import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackType } from '../entities/feedback.entity';

/**
 * DTO for feedback response
 */
export class FeedbackResponseDto {
  @ApiProperty({
    description: 'Feedback ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Restoran ID',
    example: 1,
  })
  restaurantId!: number;

  @ApiProperty({
    description: 'Yıldız puanı (1-5)',
    example: 5,
  })
  rating!: number;

  @ApiProperty({
    description: 'Geri bildirim türü',
    enum: FeedbackType,
    example: FeedbackType.POSITIVE,
  })
  type!: FeedbackType;

  @ApiPropertyOptional({
    description: 'Geri bildirim mesajı',
    example: 'Çok güzel bir menü tasarımı!',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Email adresi',
    example: 'user@example.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Oluşturulma tarihi',
    example: '2025-09-21T08:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Güncellenme tarihi',
    example: '2025-09-21T08:30:00.000Z',
  })
  updatedAt!: Date;
}
