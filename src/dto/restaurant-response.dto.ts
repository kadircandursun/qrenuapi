import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for restaurant response
 */
export class RestaurantResponseDto {
  @ApiProperty({
    description: 'Restoran ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Restoran adı',
    example: 'Lezzet Durağı',
  })
  name!: string;

  @ApiProperty({
    description: 'Restoran subdomain (URL ön eki)',
    example: 'lezzet-duragi',
  })
  subdomain!: string;

  @ApiProperty({
    description: 'QR kod URL\'si',
    example: 'https://lezzet-duragi.qrenu.com',
  })
  qrUrl!: string;

  @ApiProperty({
    description: 'Restoran açıklaması',
    example: 'Geleneksel Türk mutfağının en lezzetli örneklerini sunuyoruz.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Hoşgeldin mesajı',
    example: 'QRenu\'ya hoş geldiniz! Menümüzü inceleyebilirsiniz.',
    required: false,
  })
  welcomeMessage?: string;

  @ApiProperty({
    description: 'Website URL',
    example: 'https://www.lezzetduragi.com',
    required: false,
  })
  websiteUrl?: string;

  @ApiProperty({
    description: 'Instagram URL',
    example: 'https://www.instagram.com/lezzetduragi',
    required: false,
  })
  instagramUrl?: string;

  @ApiProperty({
    description: 'Facebook URL',
    example: 'https://www.facebook.com/lezzetduragi',
    required: false,
  })
  facebookUrl?: string;

  @ApiProperty({
    description: 'Twitter URL',
    example: 'https://www.twitter.com/lezzetduragi',
    required: false,
  })
  twitterUrl?: string;

  @ApiProperty({
    description: 'LinkedIn URL',
    example: 'https://www.linkedin.com/company/lezzetduragi',
    required: false,
  })
  linkedinUrl?: string;

  @ApiProperty({
    description: 'YouTube URL',
    example: 'https://www.youtube.com/c/lezzetduragi',
    required: false,
  })
  youtubeUrl?: string;

  @ApiProperty({
    description: 'TikTok URL',
    example: 'https://www.tiktok.com/@lezzetduragi',
    required: false,
  })
  tiktokUrl?: string;

  @ApiProperty({
    description: 'Restoran logosu dosya yolu',
    example: 'uploads/logos/restaurant-logo-123.png',
    required: false,
  })
  logoPath?: string;

  @ApiProperty({
    description: 'Restoran sahibi ID',
    example: 1,
  })
  ownerId!: number;

  @ApiProperty({
    description: 'Restoran aktif durumu',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Oluşturulma tarihi',
    example: '2025-09-20T15:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Güncellenme tarihi',
    example: '2025-09-20T15:30:00.000Z',
  })
  updatedAt!: Date;
}
