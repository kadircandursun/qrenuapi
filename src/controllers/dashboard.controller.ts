import { Controller, Get, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DashboardService } from '../services/dashboard.service';
import { DashboardOverviewResponseDto } from '../dto/dashboard-overview.dto';

/**
 * Dashboard controller for overview statistics
 */
@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get dashboard overview for authenticated user
   * @param req Request object containing user information
   * @returns Dashboard overview data
   */
  @Get('overview')
  @ApiOperation({
    summary: 'Dashboard genel bakış',
    description: 'Kullanıcının tüm restoranları için genel bakış istatistiklerini getirir',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard genel bakış verileri başarıyla getirildi',
    type: DashboardOverviewResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkilendirme hatası',
  })
  async getDashboardOverview(@Request() req: any): Promise<DashboardOverviewResponseDto> {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      throw new Error('User ID not found');
    }
    
    return this.dashboardService.getDashboardOverview(userId);
  }


}
