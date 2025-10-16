import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Feedback } from '../entities/feedback.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { FeedbackController } from '../controllers/feedback.controller';
import { FeedbackService } from '../services/feedback.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * Feedback Module for managing restaurant feedback
 */
@Module({
  imports: [
    MikroOrmModule.forFeature([
      Feedback,
      Restaurant,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as string },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, JwtAuthGuard],
  exports: [FeedbackService],
})
export class FeedbackModule {}
