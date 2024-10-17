import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from '../comman/auth.guard';
import { MailService } from 'src/utils/mail.service';
import { OtpUtil } from 'src/utils/otp.generate';


@Module({
  imports:[PrismaModule,AuthModule],
  controllers: [UserController],
  providers: [UserService,PrismaService,MailService,OtpUtil,AuthGuard],
  exports:[UserService]
})
export class UserModule {}
