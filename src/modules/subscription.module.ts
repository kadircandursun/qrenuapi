import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubscriptionController } from '../controllers/subscription.controller';
import { SubscriptionService } from '../services/subscription.service';
import { User } from '../entities/user.entity';
import { Package } from '../entities/package.entity';
import { AuthService } from '../services/auth.service';
import { MailModule } from './mail.module';
import { EmailVerificationService } from '../services/email-verification.service';
import { PackageService } from '../services/package.service';

/**
 * Subscription module for managing user package upgrades
 */
@Module({
  imports: [
    MikroOrmModule.forFeature([User, Package]),
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
  controllers: [SubscriptionController],
  providers: [SubscriptionService, AuthService, EmailVerificationService, PackageService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
