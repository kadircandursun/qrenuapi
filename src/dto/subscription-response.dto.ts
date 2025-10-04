import { ApiProperty } from '@nestjs/swagger';

/**
 * Package information for subscription response
 */
export class PackageInfoDto {
  @ApiProperty({ description: 'Paket ID' })
  id!: number;

  @ApiProperty({ description: 'Paket adı' })
  name!: string;

  @ApiProperty({ description: 'Paket açıklaması', required: false })
  description?: string;

  @ApiProperty({ description: 'Maksimum restoran sayısı' })
  maxRestaurants!: number;

  @ApiProperty({ description: 'Restoran başına maksimum kategori sayısı' })
  maxCategoriesPerRestaurant!: number;

  @ApiProperty({ description: 'Kategori başına maksimum ürün sayısı' })
  maxProductsPerCategory!: number;

  @ApiProperty({ description: 'Paket fiyatı', required: false })
  price?: number;

  @ApiProperty({ description: 'Para birimi' })
  currency!: string;

  @ApiProperty({ description: 'Paket süresi (gün)' })
  durationInDays!: number;

  @ApiProperty({ description: 'Paket aktif mi' })
  isActive!: boolean;

  @ApiProperty({ description: 'Varsayılan paket mi' })
  isDefault!: boolean;

  @ApiProperty({ description: 'Oluşturulma tarihi' })
  createdAt!: Date;

  @ApiProperty({ description: 'Güncellenme tarihi' })
  updatedAt!: Date;
}

/**
 * Subscription response DTO
 */
export class SubscriptionResponseDto {
  @ApiProperty({ description: 'İşlem başarılı mı' })
  success!: boolean;

  @ApiProperty({ description: 'İşlem mesajı' })
  message!: string;

  @ApiProperty({ description: 'Yeni paket bilgileri', type: PackageInfoDto })
  newPackage!: PackageInfoDto;

  @ApiProperty({ description: 'Paket bitiş tarihi', required: false })
  expirationDate?: Date;

  @ApiProperty({ description: 'Paket aktif mi', required: false })
  isActive?: boolean;

  @ApiProperty({ description: 'Kalan gün sayısı', required: false })
  daysRemaining?: number;

  @ApiProperty({ description: 'Paket özellikleri', type: [String] })
  features!: string[];
}
