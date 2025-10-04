import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, IsOptional, IsEmail, Min, Max, Length } from 'class-validator';
import { FeedbackType } from '../entities/feedback.entity';

/**
 * DTO for creating feedback
 */
export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Restoran ID',
    example: 1,
  })
  @IsInt()
  restaurantId!: number;

  @ApiProperty({
    description: 'Yıldız puanı (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({
    description: 'Geri bildirim türü',
    enum: FeedbackType,
    example: FeedbackType.POSITIVE,
  })
  @IsEnum(FeedbackType)
  type!: FeedbackType;

  @ApiPropertyOptional({
    description: 'Geri bildirim mesajı',
    example: 'Çok güzel bir menü tasarımı!',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  message?: string;

  @ApiPropertyOptional({
    description: 'Email adresi (isteğe bağlı)',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'IP adresi',
    example: '192.168.1.1',
  })
  @IsString()
  ipAddress!: string;

  @ApiPropertyOptional({
    description: 'Tarayıcı bilgisi',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Ülke',
    example: 'Turkey',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Şehir',
    example: 'Istanbul',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Cihaz türü',
    example: 'mobile',
  })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiPropertyOptional({
    description: 'Tarayıcı',
    example: 'Chrome',
  })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiPropertyOptional({
    description: 'İşletim sistemi',
    example: 'Windows',
  })
  @IsOptional()
  @IsString()
  os?: string;
}
