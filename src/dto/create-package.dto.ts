import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a package
 */
export class CreatePackageDto {
  @ApiProperty({
    description: 'Paket adı',
    example: 'Standart Paket',
  })
  @IsString({ message: 'Paket adı string olmalıdır' })
  @IsNotEmpty({ message: 'Paket adı boş olamaz' })
  name!: string;

  @ApiProperty({
    description: 'Paket açıklaması',
    example: 'Küçük işletmeler için ideal paket',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Açıklama string olmalıdır' })
  description?: string;

  @ApiProperty({
    description: 'Maksimum restoran sayısı',
    example: 1,
  })
  @IsNumber({}, { message: 'Maksimum restoran sayısı sayı olmalıdır' })
  @Min(0, { message: 'Maksimum restoran sayısı 0 veya daha büyük olmalıdır' })
  maxRestaurants!: number;

  @ApiProperty({
    description: 'Restoran başına maksimum kategori sayısı',
    example: 5,
  })
  @IsNumber({}, { message: 'Maksimum kategori sayısı sayı olmalıdır' })
  @Min(0, { message: 'Maksimum kategori sayısı 0 veya daha büyük olmalıdır' })
  maxCategoriesPerRestaurant!: number;

  @ApiProperty({
    description: 'Kategori başına maksimum ürün sayısı',
    example: 20,
  })
  @IsNumber({}, { message: 'Maksimum ürün sayısı sayı olmalıdır' })
  @Min(0, { message: 'Maksimum ürün sayısı 0 veya daha büyük olmalıdır' })
  maxProductsPerCategory!: number;

  @ApiProperty({
    description: 'Paket fiyatı',
    example: 99.99,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Fiyat sayı olmalıdır' })
  @Min(0, { message: 'Fiyat 0 veya daha büyük olmalıdır' })
  price?: number;

  @ApiProperty({
    description: 'Para birimi',
    example: 'TRY',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Para birimi string olmalıdır' })
  currency?: string;

  @ApiProperty({
    description: 'Paket süresi (gün)',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Süre sayı olmalıdır' })
  @Min(1, { message: 'Süre 1 veya daha büyük olmalıdır' })
  durationInDays?: number;

  @ApiProperty({
    description: 'Varsayılan paket mi',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Varsayılan paket durumu boolean olmalıdır' })
  isDefault?: boolean;
}
