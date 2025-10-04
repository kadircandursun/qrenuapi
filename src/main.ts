import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { AppLoggerService } from './services/app-logger.service';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Body parser limitlerini artır (base64 resimler için)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  
  // Statik dosya servisi (uploads klasörü için)
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('📁 Uploads path:', uploadsPath);
  app.use('/uploads', express.static(uploadsPath));
  
  // CORS konfigürasyonu
  app.enableCors({
    origin: true, // Development için tüm origin'lere izin ver
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });
  
  // Winston Logger'ı global logger olarak ayarla
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(AppLoggerService)));
  
  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(AppLoggerService)));
  
  // Swagger konfigürasyonu
  const config = new DocumentBuilder()
    .setTitle('QRenu API')
    .setDescription('QRenu API dokümantasyonu')
    .setVersion('1.0')
    .addTag('health', 'Sistem sağlık durumu')
    .addTag('auth', 'Kimlik doğrulama işlemleri')
    .addTag('email-verification', 'Email doğrulama işlemleri')
    .addTag('password-reset', 'Şifre sıfırlama işlemleri')
    .addTag('restaurants', 'Restoran yönetimi işlemleri')
    .addTag('categories', 'Kategori yönetimi işlemleri')
    .addTag('products', 'Ürün yönetimi işlemleri')
    .addTag('subscription', 'Paket yükseltme işlemleri')
    .addTag('analytics', 'Restoran istatistikleri işlemleri')
    .addTag('feedback', 'Geri bildirim işlemleri')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Uygulama çalışıyor: http://localhost:${process.env.PORT ?? 3001}`);
  console.log(`📚 Swagger UI: http://localhost:${process.env.PORT ?? 3001}/api`);
}
bootstrap();
