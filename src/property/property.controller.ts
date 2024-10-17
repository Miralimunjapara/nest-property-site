import { Controller, Post, Get, Put, Delete,BadRequestException, Param, Body, Request,UseInterceptors, UploadedFiles,UnauthorizedException, ValidationPipe, UseGuards } from '@nestjs/common';
import { PropertyService } from './property.service';
import {propertySchema} from '../dto/create-property.dto'
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JoiValidationPipe } from 'src/dto/validation.pipe';
import { AuthGuard } from '../comman/auth.guard'
import { AuthService } from 'src/auth/auth.service';
import {ProImgService} from '../property-img/property-img.service'
import { fileURLToPath } from 'url';
import { MailService } from 'src/utils/mail.service';

@Controller('property')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly proImgService: ProImgService,
    private readonly mailService:MailService  
  ) {}

  @Post('create')
@UseGuards(AuthGuard)
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
async create(
  @Body(new JoiValidationPipe(propertySchema)) updatePropertyDto,
  @UploadedFiles() files: Array<Express.Multer.File>,
  @Request() req,
) {
  const user = req.user;

  const data = {
    ...updatePropertyDto,
    price: Number(updatePropertyDto.price),
    area: Number(updatePropertyDto.area),
    rooms: Number(updatePropertyDto.rooms),
    userId: user.id,
  };

  const property = await this.propertyService.createProperty(data);

  if (!property) {
    throw new BadRequestException('Failed to create property');
  }

  // Prepare image data for property
  let attachImages = [];
  if (files && files.length > 0) {
    const imagePaths = files.map((file) => ({
      propertyid: property.id,
      images: file.filename,
    }));

    
    await this.proImgService.createProImgs(property.id, files);

    // Prepare images for email attachment
    attachImages = files.map((file) => ({
      filename: file.filename,
      path: `uploads/${file.filename}`,  // Path where images are stored
    }));
  }

  // Email content for the user
  const userEmailContent = {
    to: user.email,
    subject: 'Property Added Successfully',
    html: `
      <h3>Dear ${user.firstName},</h3>
      <p>Your property has been added successfully!</p>
      <p><strong>Property Details:</strong></p>
      <ul>
        <li>Name: ${property.name}</li>
        <li>Price: ${property.price}</li>
        <li>Rooms: ${property.rooms}</li>
        <li>Address: ${property.address}, ${property.city}, ${property.state} - ${property.zipcode}</li>
      </ul>
      <p><strong>Images:</strong></p>
       <img src="cid:unique@nodemailer.com"/>`,
         attachments: attachImages
    ,
  };

 
  const adminEmailContent = {
    to: process.env.EMAIL_USER, 
    subject: 'New Property Added',
    html: `
      <h3>New Property Added</h3>
      <p>A new property has been added by <b>${user.firstName} ${user.lastName}</b>.</p>
      <p><strong>Property Details:</strong></p>
      <ul>
        <li>Name: ${property.name}</li>
        <li>Price: ${property.price}</li>
        <li>Rooms: ${property.rooms}</li>
        <li>Address: ${property.address}, ${property.city}, ${property.state} - ${property.zipcode}</li>
      </ul>
      <p><strong>Images:</strong></p>
       <img src="cid:unique@nodemailer.com"/>`,
         attachments: attachImages
  };

 
  await this.mailService.sendMail(userEmailContent);

  
  await this.mailService.sendMail(adminEmailContent);

  return {
    message: 'Property and images created successfully',
    property,
  };
}


  @Get('list')
  async getAllProperties() {
    return this.propertyService.getAllProperties();
  }

  @Get(':id')
  async getPropertyById(@Param('id') id: string) {
    return this.propertyService.getPropertyById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateProperty(
    @Param('id') id: string,
    @Body() updatePropertyDto,
    @Request() req,
  ) {
    const user = req.user; 
    const userId = user.id; 


    const property = await this.propertyService.getPropertyById(id);
    
  
    if (user.role !== 'ADMIN' && property.userId !== userId) {
      throw new UnauthorizedException('You are not authorized to update this property');
    }

   
    return this.propertyService.updateProperty(id, updatePropertyDto);
  }


  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteProperty(@Param('id') id: string,@Request() req) {
    const user = req.user;
    const userId=user.id;
   
    const property = await this.propertyService.getPropertyById(id);

    if (user.role !== 'ADMIN' && property.userId !== userId) {
      throw new UnauthorizedException('You are not authorized to delete this property');
    }

    return this.propertyService.deleteProperty(id);
  }
}
