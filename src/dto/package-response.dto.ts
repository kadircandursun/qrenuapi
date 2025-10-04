import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for package response
 */
export class PackageResponseDto {
  @ApiProperty({
    description: 'Paket ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Paket adı',
    example: 'Standart Paket',
  })
  name!: string;

  @ApiProperty({
    description: 'Paket açıklaması',
    example: 'Küçük işletmeler için ideal paket',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Maksimum restoran sayısı',
    example: 1,
  })
  maxRestaurants!: number;

  @ApiProperty({
    description: 'Restoran başına maksimum kategori sayısı',
    example: 5,
  })
  maxCategoriesPerRestaurant!: number;

  @ApiProperty({
    description: 'Kategori başına maksimum ürün sayısı',
    example: 20,
  })
  maxProductsPerCategory!: number;

  @ApiProperty({
    description: 'Paket fiyatı',
    example: 99.99,
    required: false,
  })
  price?: number;

  @ApiProperty({
    description: 'Para birimi',
    example: 'TRY',
  })
  currency!: string;

  @ApiProperty({
    description: 'Paket süresi (gün)',
    example: 30,
  })
  durationInDays!: number;

  @ApiProperty({
    description: 'Paket aktif durumu',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Varsayılan paket mi',
    example: false,
  })
  isDefault!: boolean;

  @ApiProperty({
    description: 'Formatlanmış fiyat',
    example: '99.99 TRY',
  })
  formattedPrice!: string;

  @ApiProperty({
    description: 'Paket özellikleri',
    example: {
      maxRestaurants: 1,
      maxCategoriesPerRestaurant: 5,
      maxProductsPerCategory: 20,
      price: 99.99,
      currency: 'TRY',
      durationInDays: 30
    },
  })
  features!: Record<string, any>;

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
