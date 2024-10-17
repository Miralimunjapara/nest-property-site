import { Module } from '@nestjs/common';
import { ProtypeService } from './protype.service';
import { ProtypeController } from './protype.controller';

@Module({
  controllers: [ProtypeController],
  providers: [ProtypeService],
})
export class ProtypeModule {}
