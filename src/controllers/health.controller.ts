import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from '../services/health.service';

/**
 * Health Controller for system health monitoring
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Sistem sağlık durumu' })
  @ApiResponse({
    status: 200,
    description: 'Sistem sağlıklı',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-09-21T08:48:18.000Z' },
        uptime: { type: 'number', example: 3600 },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Sistem sağlıksız',
  })
  async getHealth() {
    return this.healthService.getBasicHealth();
  }

  @Get('database')
  @ApiOperation({ summary: 'Veritabanı bağlantı durumu' })
  @ApiResponse({
    status: 200,
    description: 'Veritabanı bağlantısı sağlıklı',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        database: { type: 'string', example: 'connected' },
        responseTime: { type: 'string', example: '5ms' },
        activeConnections: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Veritabanı bağlantı sorunu',
  })
  async getDatabaseHealth() {
    return this.healthService.getDatabaseHealth();
  }
}
