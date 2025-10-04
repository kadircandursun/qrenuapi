import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for feedback statistics
 */
export class FeedbackStatsDto {
  @ApiProperty({
    description: 'Toplam geri bildirim sayısı',
    example: 150,
  })
  totalFeedbacks!: number;

  @ApiProperty({
    description: 'Ortalama puan',
    example: 4.2,
  })
  averageRating!: number;

  @ApiProperty({
    description: 'Puan dağılımı',
    example: {
      '1': 5,
      '2': 10,
      '3': 25,
      '4': 50,
      '5': 60,
    },
  })
  ratingDistribution!: Record<string, number>;

  @ApiProperty({
    description: 'Geri bildirim türü dağılımı',
    example: {
      positive: 80,
      negative: 20,
      suggestion: 50,
    },
  })
  typeDistribution!: Record<string, number>;

  @ApiProperty({
    description: 'Son 30 günlük geri bildirim sayısı',
    example: 25,
  })
  last30Days!: number;

  @ApiProperty({
    description: 'Son 7 günlük geri bildirim sayısı',
    example: 8,
  })
  last7Days!: number;
}
