import { Module } from '@nestjs/common';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardService } from '../services/dashboard.service';

/**
 * Dashboard module for overview statistics
 */
@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
