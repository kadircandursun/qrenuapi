import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database.module';
import { AuthModule } from './modules/auth.module';
import { MailModule } from './modules/mail.module';
import { EmailVerificationModule } from './modules/email-verification.module';
import { PasswordResetModule } from './modules/password-reset.module';
import { RestaurantModule } from './modules/restaurant.module';
import { MenuModule } from './modules/menu.module';
import { SubscriptionModule } from './modules/subscription.module';
import { AnalyticsModule } from './modules/analytics.module';
import { FeedbackModule } from './modules/feedback.module';
import { DashboardModule } from './modules/dashboard.module';
import { AnalyticsDashboardModule } from './modules/analytics-dashboard.module';
import { DebugController } from './controllers/debug.controller';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './services/health.service';
import { WinstonModule } from 'nest-winston';
import { AppLoggerService } from './services/app-logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { RedisCacheModule } from './config/redis-cache.module';
import { CacheService } from './services/cache.service';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import * as winston from 'winston';
import * as path from 'path';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.prettyPrint(),
      ),
      defaultMeta: {
        service: 'qrenu-api',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        // Error log dosyası
        new winston.transports.File({
          filename: path.join('logs', 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          ),
        }),
        // Combined log dosyası (tüm loglar)
        new winston.transports.File({
          filename: path.join('logs', 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        // Console output (development için)
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} [${level}]: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
              }`;
            }),
          ),
        }),
      ],
      // Exception handling
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join('logs', 'exceptions.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
      // Rejection handling
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join('logs', 'rejections.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    }),
    RedisCacheModule, // Redis Cache Module
    DatabaseModule, 
    AuthModule, 
    MailModule, 
    EmailVerificationModule, 
    PasswordResetModule, 
    RestaurantModule, 
    MenuModule,
    SubscriptionModule,
    AnalyticsModule,
    FeedbackModule,
    DashboardModule,
    AnalyticsDashboardModule
  ],
  controllers: [AppController, HealthController, DebugController],
  providers: [
    AppService, 
    RateLimitGuard, 
    HealthService,
    AppLoggerService,
    LoggingInterceptor,
    GlobalExceptionFilter,
    CacheService,
    CacheInterceptor,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('*'); // Tüm route'lar için rate limiting
  }
}
