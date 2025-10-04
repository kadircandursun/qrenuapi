import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FeedbackService } from '../services/feedback.service';
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
import { FeedbackResponseDto } from '../dto/feedback-response.dto';
import { FeedbackStatsDto } from '../dto/feedback-stats.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FeedbackRateLimit } from '../decorators/rate-limit.decorator';

/**
 * Feedback Controller for managing restaurant feedback
 */
@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @FeedbackRateLimit() // 10 istek/gün
  @ApiOperation({ summary: 'Geri bildirim oluştur' })
  @ApiBody({ type: CreateFeedbackDto })
  @ApiResponse({
    status: 201,
    description: 'Geri bildirim başarıyla oluşturuldu',
    type: FeedbackResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz veri',
  })
  @HttpCode(HttpStatus.CREATED)
  async createFeedback(@Body() createFeedbackDto: CreateFeedbackDto): Promise<FeedbackResponseDto> {
    return this.feedbackService.createFeedback(createFeedbackDto);
  }

  @Get('restaurants/:restaurantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restoran geri bildirimlerini getir (sadece restoran sahibi)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiQuery({
    name: 'page',
    description: 'Sayfa numarası',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Sayfa başına kayıt sayısı',
    example: 20,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Geri bildirimler başarıyla getirildi',
    schema: {
      type: 'object',
      properties: {
        feedbacks: {
          type: 'array',
          items: { $ref: '#/components/schemas/FeedbackResponseDto' },
        },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  @ApiResponse({
    status: 403,
    description: 'Bu restorana erişim yetkiniz yok',
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  async getRestaurantFeedbacks(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ feedbacks: FeedbackResponseDto[]; total: number; page: number; limit: number }> {
    return this.feedbackService.getRestaurantFeedbacks(restaurantId, req.user.userId, page, limit);
  }

  @Get('restaurants/:restaurantId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restoran geri bildirim istatistiklerini getir (sadece restoran sahibi)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Geri bildirim istatistikleri başarıyla getirildi',
    type: FeedbackStatsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  @ApiResponse({
    status: 403,
    description: 'Bu restorana erişim yetkiniz yok',
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  async getRestaurantFeedbackStats(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Request() req: any,
  ): Promise<FeedbackStatsDto> {
    return this.feedbackService.getRestaurantFeedbackStats(restaurantId, req.user.userId);
  }
}
