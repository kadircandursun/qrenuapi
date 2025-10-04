import { ApiProperty } from '@nestjs/swagger';

/**
 * Dashboard overview performance metrics
 */
export class DashboardPerformanceDto {
  @ApiProperty({
    description: 'Bu ayki görüntülenme artış yüzdesi',
    example: 12,
  })
  viewIncreasePercentage: number;

  @ApiProperty({
    description: 'Ortalama menü görüntüleme süresi (dakika)',
    example: 2.4,
  })
  averageViewingDuration: number;

  @ApiProperty({
    description: 'En popüler restoran adı',
    example: 'Lezzet Durağı',
  })
  mostPopularRestaurant: string;
}

/**
 * Dashboard overview summary metrics
 */
export class DashboardSummaryDto {
  @ApiProperty({
    description: 'Toplam restoran sayısı',
    example: 1,
  })
  totalRestaurants: number;

  @ApiProperty({
    description: 'Toplam görüntülenme sayısı',
    example: 15,
  })
  totalViews: number;

  @ApiProperty({
    description: 'Toplam ürün sayısı',
    example: 25,
  })
  totalProducts: number;

  @ApiProperty({
    description: 'Aktif restoran sayısı',
    example: 1,
  })
  activeRestaurants: number;
}

/**
 * Dashboard overview response DTO
 */
export class DashboardOverviewResponseDto {
  @ApiProperty({
    description: 'Bu ay performans metrikleri',
    type: DashboardPerformanceDto,
  })
  performance: DashboardPerformanceDto;

  @ApiProperty({
    description: 'Özet metrikler',
    type: DashboardSummaryDto,
  })
  summary: DashboardSummaryDto;

  @ApiProperty({
    description: 'Veri güncelleme tarihi',
    example: '2025-09-23T22:20:49.000Z',
  })
  lastUpdated: Date;
}
