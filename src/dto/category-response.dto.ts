import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for category response
 */
export class CategoryResponseDto {
  @ApiProperty({
    description: 'Kategori ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Kategori adı',
    example: 'Ana Yemekler',
  })
  name!: string;

  @ApiProperty({
    description: 'Kategori açıklaması',
    example: 'Geleneksel Türk mutfağının ana yemekleri',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Kategori resmi URL',
    example: 'https://example.com/category-image.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Kategori resmi dosya yolu',
    example: 'uploads/categories/category-image-123.png',
    required: false,
  })
  imagePath?: string;

  @ApiProperty({
    description: 'Sıralama düzeni',
    example: 1,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Kategori aktif durumu',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Restoran ID',
    example: 1,
  })
  restaurantId!: number;

  @ApiProperty({
    description: 'Ürün sayısı',
    example: 5,
  })
  productCount!: number;

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
