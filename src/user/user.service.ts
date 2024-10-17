import { Injectable ,NotFoundException,InternalServerErrorException,BadRequestException,UnauthorizedException} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';


import { PrismaService } from 'src/prisma/prisma.service';
import { OtpUtil } from 'src/utils/otp.generate';
import { MailService } from 'src/utils/mail.service';


@Injectable()
export class UserService {
     constructor(private prisma: PrismaService,
      private readonly otpUtil: OtpUtil, 
     private readonly mailService: MailService,
    ) {}

    async createUser(data:Prisma.UserCreateInput):Promise<User>{
        return this.prisma.user.create({data})
    }

    async getUsers(){
        const alluser=await this.prisma.user.findMany({
          select:{
            id:true,
            firstName:true,
            lastName:true,
            email:true,
            password:true,
            createdAt:true,
            updatedAt:true,
          }}
        );
        
        return{
          statusCode:200,
          message:"users fetched successfully",
          data:alluser
        }
    }

    async getUserById(id: string) {

        const user=await this.prisma.user.findUnique({
          where: { id },
          
        });
        return{
          statusCode:200,
          message:"user fetched successfully",
          data:user
        }

    }

    async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
          where: { id },
          data,
        });
      }
    
      async deleteUser(id: string): Promise<User> {
        return this.prisma.user.update({
          where: { id }, 
          data: {
            status: 'INACTIVE', 
          },
        });
      }

      async findByEmail(email: string): Promise<User | null> {
        
          const user = await this.prisma.user.findUnique({
            where: { email },
          })
           return user;
        }
        
      
      async findEmailByUser(email: string): Promise<User | null> {
        try {
          const user = await this.prisma.user.findUnique({
            where: { email },
          });
      
          if (!user) {
            throw new NotFoundException('User not found');
          }
      
          return user;
        } catch (error) {
          throw error;
        }
      }

      async changePassword(id: string, oldPassword: string, newPassword: string): Promise<User> {
      
        const user = await this.prisma.user.findUnique({ where: { id } });
    
        if (!user) {
          throw new NotFoundException('User not found');
        }
    
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
          throw new NotFoundException('Old password is incorrect');
        }
    
        const hashedPassword = await bcrypt.hash(newPassword, 10);
    

        return this.prisma.user.update({
          where: { id },
          data: {
            password: hashedPassword,
          },
        });
      }

      async updateOtp(email: string, otp: string, otpExpire: Date): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.update({
            where: { email },
            data: {
                otp,
                otpExpire,
            },
        });
      }

      async forgotPassword(email: string, res: any): Promise<void> {
        try {
            
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const { otp, otpExpire } = this.otpUtil.createOtp(6, 1);
            const expiryDate = new Date(otpExpire);
    
            await this.updateOtp(email, otp, expiryDate);

            const emailContent = {
                to: user.email,
                subject: 'Password Reset OTP',
                html: `<p>Your OTP for password reset is: <strong>${otp}</strong>. It expires in ${otpExpire} minutes.</p>`,
            };
            
            await this.mailService.sendMail(emailContent);

            res.status(200).json({ message: "OTP sent successfully to your email." });
        } catch (error) {
            console.error('Error in forgotPassword:', error);
            throw new InternalServerErrorException('Failed to process forgot password request');
        }
    }

    async updatePassword(id:string,confirmPassword:string){
      const hashedPassword = await bcrypt.hash(confirmPassword, 10);
    

        return this.prisma.user.update({
          where: { id },
          data: {
            password: hashedPassword,
          },
        });
      }
    

    async resetPassword(
      email: string,
      otp: string,
      newPassword: string,
      confirmPassword: string,
    ): Promise<void> {
      try {
        const user = await this.findEmailByUser(email);
  
        if (!user) {
          throw new UnauthorizedException('User not found');
        }
  
        const otpExpiryTime = 60 * 1000;
        const currentTime = new Date().getTime();
        const otpCreatedAtTime = new Date(user.otpExpire).getTime();

        if (currentTime - otpCreatedAtTime > otpExpiryTime) {
          throw new UnauthorizedException('OTP has expired');
        }
  
       
        if (otp !== user.otp) {
          throw new UnauthorizedException('Invalid OTP');
        }
  
       
        if (newPassword !== confirmPassword) {
          throw new BadRequestException('confirmPassword and newPassword do not match');
        }

        await this.updatePassword(user.id, confirmPassword);
  
      } catch (error) {
        console.error('Error in resetPassword:', error);
        throw error;
      }
    }
  }


  