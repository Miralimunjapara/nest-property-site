import { Body, Controller, Delete, Get, Param, Post, Put, HttpException, HttpStatus } from '@nestjs/common';
import { ProtypeService } from './protype.service';
import { Prisma, Pro_type } from '@prisma/client';

@Controller('protype')
export class ProtypeController {
  constructor(private readonly protypeService: ProtypeService) {}

  @Post('add')
  async createProType(@Body() data: Prisma.Pro_typeCreateInput): Promise<Pro_type> {
    try {
      return await this.protypeService.create(data);
    } catch (error) {
      throw new HttpException('Error creating property type', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('all')
  async getProTypes(): Promise<Pro_type[]> {
    return await this.protypeService.getProType();
  }

 
  @Get(':id')
  async getProTypeById(@Param('id') id: string): Promise<Pro_type> {
    const proType = await this.protypeService.getProTypeById(id);
    if (!proType) {
      throw new HttpException('Pro_type not found', HttpStatus.NOT_FOUND);
    }
    return proType;
  }

  
  @Put(':id')
  async updateProType(@Param('id') id: string,@Body() data: Prisma.Pro_typeUpdateInput,): Promise<Pro_type> {
    try {
      return await this.protypeService.updateProTypeById(id, data);
    } catch (error) {
      throw new HttpException('Error updating property type', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async deleteProType(@Param('id') id: string): Promise<Pro_type> {
    const proType = await this.protypeService.getProTypeById(id);
    if (!proType) {
      throw new HttpException('Pro_type not found', HttpStatus.NOT_FOUND);
    }
    return this.protypeService.deleteProType(id);
  }
}
