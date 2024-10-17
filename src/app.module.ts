import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path'; // For resolving the path
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProtypeModule } from './protype/protype.module';
import { PropertyModule } from './property/property.module';
import { ProImgController } from './property-img/property-img.controller';
import { PropertyImgModule } from './property-img/property-img.module';

@Module({
  imports: [
    // Add ServeStaticModule to serve files from the uploads directory
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Path to your uploads folder
      serveRoot: '/uploads', // Optional: URL path to access uploads
    }),
    
    // Other modules
    PrismaModule,
    UserModule,
    AuthModule,
    ProtypeModule,
    PropertyModule,
    PropertyImgModule,
  ],
  controllers: [ProImgController],
  providers: [],
})
export class AppModule {}
