import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AnalyticsDashboardService } from '../services/analytics-dashboard.service';
import { AnalyticsResponseDto } from '../dto/analytics.dto';

/**
 * Analytics dashboard controller for detailed analytics data
 */
@ApiTags('Analytics Dashboard')
@Controller('analytics-dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsDashboardController {
  constructor(private readonly analyticsDashboardService: AnalyticsDashboardService) {}

  /**
   * Get analytics dashboard for authenticated user
   * @param req Request object containing user information
   * @returns Analytics dashboard data
   */
  @Get()
  @ApiOperation({
    summary: 'Analitik dashboard',
    description: 'Kullanıcının tüm restoranları için detaylı analitik verilerini getirir',
  })
  @ApiResponse({
    status: 200,
    description: 'Analitik dashboard verileri başarıyla getirildi',
    type: AnalyticsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkilendirme hatası',
  })
  async getAnalyticsDashboard(@Request() req: any): Promise<AnalyticsResponseDto> {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      throw new Error('User ID not found');
    }
    
    return this.analyticsDashboardService.getAnalyticsDashboard(userId);
  }
}
