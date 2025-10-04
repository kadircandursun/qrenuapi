import { Module } from '@nestjs/common';
import { AnalyticsDashboardController } from '../controllers/analytics-dashboard.controller';
import { AnalyticsDashboardService } from '../services/analytics-dashboard.service';

/**
 * Analytics dashboard module for detailed analytics data
 */
@Module({
  controllers: [AnalyticsDashboardController],
  providers: [AnalyticsDashboardService],
  exports: [AnalyticsDashboardService],
})
export class AnalyticsDashboardModule {}
