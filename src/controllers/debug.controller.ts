import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { EntityManager } from '@mikro-orm/core';
import { Restaurant } from '../entities/restaurant.entity';
import { Product } from '../entities/product.entity';
import { QrScanAnalytics } from '../entities/qr-scan-analytics.entity';
import { SessionAnalytics } from '../entities/session-analytics.entity';

/**
 * Debug controller for checking database data
 */
@ApiTags('Debug')
@Controller('debug')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DebugController {
  constructor(
    private readonly em: EntityManager,
  ) {}
}
