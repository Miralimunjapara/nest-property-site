import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Prisma Service
import { Prisma, ProImg } from '@prisma/client'; // Import Prisma types

@Injectable()
export class ProImgService {
  constructor(private prisma: PrismaService) {}

  
  async createProImgs(proId: string, files: Array<Express.Multer.File>): Promise<ProImg[]> {
    const images = files.map(file => file.filename);
    const proImgs = await Promise.all(
      images.map(img =>
        this.prisma.proImg.create({
          data: {
            proId,
            images: img,
          },
        }),
      ),
    );
    return proImgs;
  }

  
  async getAllProImgs(): Promise<ProImg[]> {
    return this.prisma.proImg.findMany();
  }

  
  async getProImgById(id: string): Promise<ProImg> {
    const proImg = await this.prisma.proImg.findUnique({
      where: { id },
    });

    if (!proImg) {
      throw new NotFoundException('ProImg not found');
    }
    return proImg;
  }

  
  async updateProImg(id: string, data: Prisma.ProImgUpdateInput): Promise<ProImg> {
    const proImgExists = await this.prisma.proImg.findUnique({
      where: { id },
    });

    if (!proImgExists) {
      throw new NotFoundException('ProImg not found');
    }

    return this.prisma.proImg.update({
      where: { id },
      data,
    });
  }

  
  async deleteProImg(id: string): Promise<ProImg> {
    const proImgExists = await this.prisma.proImg.findUnique({
      where: { id },
    });

    if (!proImgExists) {
      throw new NotFoundException('ProImg not found');
    }

    return this.prisma.proImg.delete({
      where: { id },
    });
  }
}
