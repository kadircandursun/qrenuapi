import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AnalyticsRateLimit } from '../decorators/rate-limit.decorator';

/**
 * Analytics Controller for managing restaurant analytics
 */
@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * QR kod tarama kaydı oluştur
   * @param restaurantId Restoran ID
   * @param scanData Tarama verileri
   * @returns Oluşturulan tarama kaydı
   */
  @Post('restaurants/:restaurantId/qr-scan')
  @AnalyticsRateLimit() // 100 istek/saat
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'QR kod tarama kaydı oluştur (herkese açık)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        uid: { type: 'string', example: 'user-123' },
        ipAddress: { type: 'string', example: '192.168.1.1' },
        userAgent: { type: 'string', example: 'Mozilla/5.0...' },
        country: { type: 'string', example: 'Turkey' },
        city: { type: 'string', example: 'Istanbul' },
        deviceType: { type: 'string', example: 'mobile' },
        browser: { type: 'string', example: 'Chrome' },
        os: { type: 'string', example: 'Android' },
        referrer: { type: 'string', example: 'https://google.com' },
      },
      required: ['uid', 'ipAddress'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'QR tarama kaydı başarıyla oluşturuldu',
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  async recordQrScan(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() scanData: any,
  ): Promise<any> {
    return await this.analyticsService.recordQrScan(restaurantId, scanData);
  }

  /**
   * Favori işlemi kaydı oluştur
   * Kullanıcı sadece kategoriye girebilir veya ürün detayına girmeden de favori ekleyebilir
   * @param restaurantId Restoran ID
   * @param favoriteData Favori verileri (categoryId ve productId opsiyonel)
   * @returns Oluşturulan favori kaydı
   */
  @Post('restaurants/:restaurantId/favorite')
  @AnalyticsRateLimit() // 100 istek/saat
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Favori işlemi kaydı oluştur (herkese açık)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        uid: { type: 'string', example: 'user-123' },
        action: { type: 'string', enum: ['add', 'remove', 'view'], example: 'add' },
        categoryId: { type: 'number', example: 1, description: 'Kategori ID (opsiyonel - sadece kategoriye girildiğinde)' },
        productId: { type: 'number', example: 1, description: 'Ürün ID (opsiyonel - ürün detayına girildiğinde)' },
        ipAddress: { type: 'string', example: '192.168.1.1' },
        userAgent: { type: 'string', example: 'Mozilla/5.0...' },
        country: { type: 'string', example: 'Turkey' },
        city: { type: 'string', example: 'Istanbul' },
        deviceType: { type: 'string', example: 'mobile' },
        browser: { type: 'string', example: 'Chrome' },
        os: { type: 'string', example: 'Android' },
      },
      required: ['uid', 'action', 'ipAddress'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Favori kaydı başarıyla oluşturuldu',
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran, kategori veya ürün bulunamadı',
  })
  async recordFavoriteAction(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() favoriteData: any,
  ): Promise<any> {
    return await this.analyticsService.recordFavoriteAction(restaurantId, favoriteData);
  }

  /**
   * Oturum kaydı oluştur veya güncelle
   * @param restaurantId Restoran ID
   * @param sessionData Oturum verileri
   * @returns Oluşturulan veya güncellenen oturum kaydı
   */
  @Post('restaurants/:restaurantId/session')
  @AnalyticsRateLimit() // 100 istek/saat
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Oturum kaydı oluştur veya güncelle (herkese açık)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        uid: { type: 'string', example: 'user-123' },
        sessionId: { type: 'string', example: 'session-456' },
        ipAddress: { type: 'string', example: '192.168.1.1' },
        userAgent: { type: 'string', example: 'Mozilla/5.0...' },
        country: { type: 'string', example: 'Turkey' },
        city: { type: 'string', example: 'Istanbul' },
        deviceType: { type: 'string', example: 'mobile' },
        browser: { type: 'string', example: 'Chrome' },
        os: { type: 'string', example: 'Android' },
        referrer: { type: 'string', example: 'https://google.com' },
        duration: { type: 'number', example: 300 },
      },
      required: ['uid', 'sessionId', 'ipAddress'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Oturum kaydı başarıyla oluşturuldu veya güncellendi',
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  async recordSession(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() sessionData: any,
  ): Promise<any> {
    return await this.analyticsService.recordSession(restaurantId, sessionData);
  }

  /**
   * Restoran istatistiklerini getir
   * @param req Request nesnesi (kullanıcı bilgileri için)
   * @param restaurantId Restoran ID
   * @param period Dönem
   * @returns Restoran istatistikleri
   */
  @Get('restaurants/:restaurantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restoran istatistiklerini getir (sadece restoran sahibi)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiQuery({
    name: 'period',
    description: 'İstatistik dönemi',
    enum: ['7d', '30d', '90d', '1y'],
    required: false,
    example: '30d',
  })
  @ApiResponse({
    status: 200,
    description: 'Restoran istatistikleri başarıyla getirildi',
    schema: {
      type: 'object',
      properties: {
        period: { type: 'string', example: '30d' },
        startDate: { type: 'string', example: '2025-08-21T00:00:00.000Z' },
        endDate: { type: 'string', example: '2025-09-20T19:56:00.000Z' },
        qrScans: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 150 },
            uniqueUsers: { type: 'number', example: 75 },
            hourlyDistribution: { type: 'object' },
            dailyDistribution: { type: 'object' },
            deviceTypes: { type: 'object' },
            countries: { type: 'object' },
          },
        },
        favorites: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 50 },
            uniqueUsers: { type: 'number', example: 25 },
            actions: { type: 'object' },
            topCategories: { type: 'array' },
            topProducts: { type: 'array' },
          },
        },
        sessions: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            uniqueUsers: { type: 'number', example: 50 },
            averageDuration: { type: 'number', example: 5 },
            totalDuration: { type: 'number', example: 500 },
            activeSessions: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  @ApiResponse({
    status: 403,
    description: 'Email doğrulanmamış veya restorana erişim yetkiniz yok',
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  async getRestaurantAnalytics(
    @Request() req: any,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Query('period') period: '7d' | '30d' | '90d' | '1y' = '30d',
  ): Promise<any> {
    return await this.analyticsService.getRestaurantAnalytics(
      req.user.userId,
      restaurantId,
      period,
    );
  }
}
