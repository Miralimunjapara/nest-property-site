import { Module } from '@nestjs/common';
import { ProImgService } from './property-img.service';
import { ProImgController } from './property-img.controller';

@Module({

  controllers:[ProImgController],
  providers: [ProImgService],
  exports:[ProImgService]

})
export class PropertyImgModule {}
