import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';


@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET; 

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async login(email: string, password: string): Promise<{ message: string; token: string }> {
    const user = await this.userService.findEmailByUser(email);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect password, Please enter a valid password.');
    }

    const payload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.jwtSecret, 
      expiresIn: '10d', 
    });

    return {
      message: 'Login successful',
      token,
    };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = this.jwtService.verify(token, { secret: this.jwtSecret });
      return decoded as User;
    } catch (error) {
      return null; 
    }
  }
}
