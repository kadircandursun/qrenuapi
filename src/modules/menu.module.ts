import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { User } from '../entities/user.entity';
import { Package } from '../entities/package.entity';
import { CategoryController } from '../controllers/category.controller';
import { ProductController } from '../controllers/product.controller';
import { CategoryService } from '../services/category.service';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { FileUploadService } from '../services/file-upload.service';
import { MailModule } from './mail.module';
import { EmailVerificationService } from '../services/email-verification.service';
import { PackageService } from '../services/package.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Category, Product, Restaurant, User, Package]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
      }),
      inject: [ConfigService],
    }),
    MailModule,
  ],
  controllers: [CategoryController, ProductController],
  providers: [CategoryService, ProductService, AuthService, EmailVerificationService, PackageService, FileUploadService],
  exports: [CategoryService, ProductService],
})
export class MenuModule {}
