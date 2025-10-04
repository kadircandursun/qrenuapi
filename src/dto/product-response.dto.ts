import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for product response
 */
export class ProductResponseDto {
  @ApiProperty({
    description: 'Ürün ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Ürün adı',
    example: 'Adana Kebap',
  })
  name!: string;

  @ApiProperty({
    description: 'Ürün açıklaması',
    example: 'Acılı kıyma ile hazırlanan geleneksel Adana kebap',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Ürün fiyatı',
    example: 45.50,
  })
  price!: number;

  @ApiProperty({
    description: 'Para birimi',
    example: 'TRY',
  })
  currency!: string;

  @ApiProperty({
    description: 'İndirimli fiyat (kampanyalı ürünler için)',
    example: 35.50,
    required: false,
  })
  discountedPrice?: number;

  @ApiProperty({
    description: 'Ürün fotoğrafı URL',
    example: 'https://example.com/product-image.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Ürün fotoğrafı dosya yolu',
    example: 'uploads/products/product-image-123.png',
    required: false,
  })
  imagePath?: string;

  @ApiProperty({
    description: 'Stokta var mı',
    example: true,
  })
  isInStock!: boolean;

  @ApiProperty({
    description: 'Sıralama düzeni',
    example: 1,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Ürün aktif durumu',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Kategori ID',
    example: 1,
  })
  categoryId!: number;

  @ApiProperty({
    description: 'Formatlanmış fiyat',
    example: '45.50 TRY',
  })
  formattedPrice!: string;

  @ApiProperty({
    description: 'Formatlanmış indirimli fiyat (kampanyalı ürünler için)',
    example: '35.50 TRY',
    required: false,
  })
  formattedDiscountedPrice?: string;

  @ApiProperty({
    description: 'İndirim yüzdesi (kampanyalı ürünler için)',
    example: 22,
    required: false,
  })
  discountPercentage?: number;

  @ApiProperty({
    description: 'Kampanyalı ürün mü',
    example: true,
  })
  isOnSale!: boolean;

  @ApiProperty({
    description: 'Ürün müsait mi',
    example: true,
  })
  isAvailable!: boolean;

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
