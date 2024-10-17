import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../comman/auth.guard';
import { OtpUtil } from 'src/utils/otp.generate';
import { MailService } from 'src/utils/mail.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallbackSecretKey', 
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
  ],
  providers: [AuthService, UserService,AuthGuard,OtpUtil,MailService, PrismaService],
  controllers: [],
  exports: [AuthService,JwtModule],
})
export class AuthModule {}
