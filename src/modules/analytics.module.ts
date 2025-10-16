import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QrScanAnalytics } from '../entities/qr-scan-analytics.entity';
import { FavoriteAnalytics } from '../entities/favorite-analytics.entity';
import { SessionAnalytics } from '../entities/session-analytics.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { Package } from '../entities/package.entity';
import { AnalyticsController } from '../controllers/analytics.controller';
import { AnalyticsService } from '../services/analytics.service';
import { AuthService } from '../services/auth.service';
import { EmailVerificationService } from '../services/email-verification.service';
import { PackageService } from '../services/package.service';
import { MailModule } from './mail.module';

/**
 * Analytics Module for managing restaurant analytics
 */
@Module({
  imports: [
    MikroOrmModule.forFeature([
      QrScanAnalytics,
      FavoriteAnalytics,
      SessionAnalytics,
      Restaurant,
      Category,
      Product,
      User,
      Package,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as string },
      }),
      inject: [ConfigService],
    }),
    MailModule,
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AuthService,
    EmailVerificationService,
    PackageService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
