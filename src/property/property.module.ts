import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PropertyImgModule } from 'src/property-img/property-img.module';
import { MailService } from 'src/utils/mail.service';

@Module({
  imports:[AuthModule,PropertyImgModule],
  providers: [PropertyService,MailService],
  controllers: [PropertyController],
  exports:[PropertyService]
})
export class PropertyModule {}
