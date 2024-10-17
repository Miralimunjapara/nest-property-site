import { Injectable } from '@nestjs/common';
import { Prisma, Pro_type } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class ProtypeService {
  constructor(private prisma:PrismaService){}
  create(data:Prisma.Pro_typeCreateInput) {
    return this.prisma.pro_type.create({data})
  }

  async getProType(){
    return await this.prisma.pro_type.findMany()
}

async getProTypeById(id: string) {
  return await this.prisma.pro_type.findUnique({
    where: { id },
    
  });
}

  async updateProTypeById(id: string, data: Prisma.Pro_typeUpdateInput): Promise<Pro_type> {
    return this.prisma.pro_type.update({
      where: { id },
      data,
    });
  }

  async deleteProType(id: string): Promise<Pro_type> {
    return this.prisma.pro_type.update({
      where: { id }, 
      data: {
        status: 'INACTIVE', 
      },
    });
  }
}
 
