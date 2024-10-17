import { Injectable ,ForbiddenException,NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Create PrismaService to manage database connections
import { Prisma, Property } from '@prisma/client';

@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}

  async createProperty(data:Prisma.PropertyCreateInput): Promise<Property> {
    return this.prisma.property.create({
      data,
    });
  }

  async getAllProperties(page:number,limit:number) {
    const offset=(page - 1)*limit;

    const totalProperties=await this.prisma.property.count();

    const properties=await this.prisma.property.findMany({
      skip:offset,
      take:limit,
      select: {
        id: true,
        name:true,
        address: true,
        city: true,
        state: true,
        zipcode: true,
        price: true,
        description: true,
        rooms: true,
        contactNo :false,
        proTypeId:true,   
        userId  :false,  
        status :false, 
        createdAt:false, 
        updatedAt:false,
       }
 })
 return{
  statusCode:200,
  message:"properties fetched successfully",
  data:properties,
  totalItems: totalProperties,
  totalPages: Math.ceil(totalProperties / limit),
  currentPage: page,
}
    
  }

  async getPropertyById(id:string){
    try {
      const property = await this.prisma.property.findUnique({
        where: { id },
        include: { 
          images: true,
          proType:{
            select:{
              name:true,
          }
        },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },

          
      }
      });

  
      
      if (!property) {
        throw new NotFoundException(`Property not found`);
      }
  
      return property;
    } catch (error) {
      throw error
    }
  }
  

  async updateProperty(id: string, data: Prisma.PropertyUpdateInput): Promise<Property> {
    return this.prisma.property.update({
      where: { id },
      data,
    });
  }


  async deleteProperty(id: string): Promise<Property> {
    return this.prisma.property.update({
      where: { id }, 
      data: {
            status: 'INACTIVE', 
          },
      });
  }
}
