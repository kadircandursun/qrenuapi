import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Restaurant } from '../entities/restaurant.entity';
import { User } from '../entities/user.entity';
import { Package } from '../entities/package.entity';
import { Category } from '../entities/category.entity';
import { RestaurantController } from '../controllers/restaurant.controller';
import { RestaurantService } from '../services/restaurant.service';
import { SubdomainService } from '../services/subdomain.service';
import { AuthService } from '../services/auth.service';
import { EmailVerificationService } from '../services/email-verification.service';
import { PackageService } from '../services/package.service';
import { FileUploadService } from '../services/file-upload.service';
import { MailModule } from './mail.module';
import { MenuModule } from './menu.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Restaurant, User, Package, Category]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
      }),
      inject: [ConfigService],
    }),
    MailModule,
    MenuModule,
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService, SubdomainService, AuthService, EmailVerificationService, PackageService, FileUploadService],
  exports: [RestaurantService],
})
export class RestaurantModule {}
