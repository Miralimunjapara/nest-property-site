import { Controller, Post, Get,BadRequestException,HttpStatus,HttpException,Query, Body, UsePipes, Param, Put, Delete,UnauthorizedException,Res,NotFoundException,Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JoiValidationPipe } from '../dto/validation.pipe';
import { CreateUserSchema, UpdateUserSchema, LoginUserSchema,ChangePasswordSchema } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from '../comman/auth.guard';



@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @Post('/Registration')
  
  async createUser(@Body(new JoiValidationPipe(CreateUserSchema)) createUserDto) {
    const existingUser = await this.userService.findByEmail(createUserDto.email);
    if (existingUser) {
        throw new BadRequestException('Email already exists');
    }
    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
    
    createUserDto.password = hashedPassword;
  
    return this.userService.createUser(createUserDto), {msg:'registration successfull '}
  }

  @Get('/list')
  @UseGuards(AuthGuard)
  async getUsers(@Request() req, @Query('page') page: number =1, @Query('limit') limit: number=5 ) {
    const user = req.user;
  
    if (user.role === 'USER') {
      throw new UnauthorizedException('Only admin access!!');
    }
  

    const pageNumber = Math.max(page);
    const pageSize = Math.max(limit);
  
    return this.userService.getUsers(pageNumber, pageSize);
  }

  @Get('/:id')
  @UseGuards(AuthGuard) 
  async getUser(@Param('id') id: string, @Request() req) {
    const user = req.user;
  
    if (user.role == 'USER' && user.id !== id) {
      throw new UnauthorizedException('you are access only own data');
    }
    return this.userService.getUserById(id);
  }


  @Put(':id')
  @UseGuards(AuthGuard)
  async updateUser(
    @Param('id') id: string, 
    @Request() req, 
    @Body(new JoiValidationPipe(UpdateUserSchema)) updateUserDto: any ) {
    const user = req.user;

    if (user.role == 'USER' && user.id !== id) {
      throw new UnauthorizedException('You can only update your own data');
    } else {
      return this.userService.updateUser(id, updateUserDto);
    }
  }


  @Delete(':id')
  @UseGuards(AuthGuard) 
   async deleteUser(@Param('id') id: string, @Request() req) {
    const user = req.user;

    if (user.role == 'USER' && user.id !== id) {
      throw new UnauthorizedException('you are delete only own data');
    }
    return this.userService.deleteUser(id);
  }

  @Post('/login')
  async login(@Body(new JoiValidationPipe(LoginUserSchema)) loginDto: any) {
    return this.authService.login(loginDto.email, loginDto.password); 
  }


  @Post('/change-password/:id')
  @UseGuards(AuthGuard)
  async changePassword(@Param('id') id: string, @Body() changePasswordDto:any, @Request() req) {
    const user = req.user;
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    if(user.id !== id){
      throw new UnauthorizedException('you can change only your password');
    }
  
    if (newPassword !== confirmPassword) {
      throw new NotFoundException  ('New password and confirm password do not match')
    }
    await this.userService.changePassword(id, oldPassword, newPassword);
    return ({msg:" your password change successfull"});
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @Res() res: any) {
      await this.userService.forgotPassword(email,res);
      return new HttpException("otp send successfull in your Email", HttpStatus.CREATED);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto:any): Promise<{ message: string }> {
    const { email, otp, newPassword, confirmPassword } = resetPasswordDto;

    await this.userService.resetPassword(email, otp, newPassword, confirmPassword);

    return new HttpException('Password reset successful',HttpStatus.CREATED);
  }
}

