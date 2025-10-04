import { ApiProperty } from '@nestjs/swagger';

/**
 * Analytics overview metrics
 */
export class AnalyticsOverviewDto {
  @ApiProperty({
    description: 'Toplam görüntülenme sayısı',
    example: 1247,
  })
  totalViews: number;

  @ApiProperty({
    description: 'Bu ayki görüntülenme artış yüzdesi',
    example: 18,
  })
  viewIncreasePercentage: number;

  @ApiProperty({
    description: 'Benzersiz ziyaretçi sayısı',
    example: 892,
  })
  uniqueVisitors: number;

  @ApiProperty({
    description: 'Benzersiz ziyaretçi artış yüzdesi',
    example: 15,
  })
  uniqueVisitorIncreasePercentage: number;

  @ApiProperty({
    description: 'Ortalama menü görüntüleme süresi (dakika)',
    example: 3.2,
  })
  averageDuration: number;

  @ApiProperty({
    description: 'En popüler ürün adı',
    example: 'Pizza Margherita',
  })
  mostPopularProduct: string;

  @ApiProperty({
    description: 'En popüler ürün görüntülenme sayısı',
    example: 156,
  })
  mostPopularProductViews: number;
}

/**
 * Daily analytics data
 */
export class DailyAnalyticsDto {
  @ApiProperty({
    description: 'Gün adı',
    example: 'Pazartesi',
  })
  day: string;

  @ApiProperty({
    description: 'Görüntülenme sayısı',
    example: 45,
  })
  views: number;
}

/**
 * Popular product analytics
 */
export class PopularProductDto {
  @ApiProperty({
    description: 'Ürün adı',
    example: 'Pizza Margherita',
  })
  name: string;

  @ApiProperty({
    description: 'Kategori adı',
    example: 'Ana Yemekler',
  })
  category: string;

  @ApiProperty({
    description: 'Görüntülenme sayısı',
    example: 156,
  })
  views: number;
}

/**
 * Hourly analytics data
 */
export class HourlyAnalyticsDto {
  @ApiProperty({
    description: 'Saat aralığı',
    example: '12:00 - 13:00',
  })
  timeRange: string;

  @ApiProperty({
    description: 'Görüntülenme sayısı',
    example: 89,
  })
  views: number;
}

/**
 * Device analytics data
 */
export class DeviceAnalyticsDto {
  @ApiProperty({
    description: 'Cihaz türü',
    example: 'Mobil',
  })
  deviceType: string;

  @ApiProperty({
    description: 'Yüzde',
    example: 78,
  })
  percentage: number;

  @ApiProperty({
    description: 'Görüntülenme sayısı',
    example: 972,
  })
  views: number;
}

/**
 * Analytics response DTO
 */
export class AnalyticsResponseDto {
  @ApiProperty({
    description: 'Genel analitik metrikleri',
    type: AnalyticsOverviewDto,
  })
  overview: AnalyticsOverviewDto;

  @ApiProperty({
    description: 'Son 7 günlük görüntülenme verileri',
    type: [DailyAnalyticsDto],
  })
  dailyViews: DailyAnalyticsDto[];

  @ApiProperty({
    description: 'En popüler ürünler',
    type: [PopularProductDto],
  })
  popularProducts: PopularProductDto[];

  @ApiProperty({
    description: 'En yoğun saatler',
    type: [HourlyAnalyticsDto],
  })
  busiestHours: HourlyAnalyticsDto[];

  @ApiProperty({
    description: 'Cihaz analizi',
    type: [DeviceAnalyticsDto],
  })
  deviceAnalysis: DeviceAnalyticsDto[];

  @ApiProperty({
    description: 'Veri güncelleme tarihi',
    example: '2025-09-23T22:47:36.000Z',
  })
  lastUpdated: Date;
}
