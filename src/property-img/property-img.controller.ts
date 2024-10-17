import { Controller, Post, Get, Param, Put, Delete, UseInterceptors, UploadedFiles, Body, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProImgService } from './property-img.service';

@Controller('pro-img')
export class ProImgController {
  constructor(private readonly proImgService: ProImgService) {}

  
  @Post('create')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async createProImgs(
    @UploadedFiles() files: Array<Express.Multer.File>, 
    @Body('proId') proId: string,
  ) {
    
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

 
    const result = await this.proImgService.createProImgs(proId, files);

    return {
      message: 'Images uploaded successfully',
      data: result,
    };
  }

  @Get('list')
  async getAllProImgs() {
    return this.proImgService.getAllProImgs();
  }


  @Get(':id')
  async getProImgById(@Param('id') id: string) {
    return this.proImgService.getProImgById(id);
  }

  @Put(':id')
  async updateProImg(@Param('id') id: string, @Body() data: any) {
    return this.proImgService.updateProImg(id, data);
  }

  // Delete ProImg by ID
  @Delete(':id')
  async deleteProImg(@Param('id') id: string) {
    return this.proImgService.deleteProImg(id);
  }
}
