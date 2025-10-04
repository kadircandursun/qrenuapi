import { IsNotEmpty, IsString, IsOptional, IsUrl, IsNumber, IsBoolean, Min, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBase64Image } from '../decorators/base64-image.decorator';

/**
 * DTO for updating a product
 */
export class UpdateProductDto {
  @ApiProperty({
    description: 'Ürün adı',
    example: 'Adana Kebap',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ürün adı string olmalıdır' })
  name?: string;

  @ApiProperty({
    description: 'Ürün açıklaması',
    example: 'Acılı kıyma ile hazırlanan geleneksel Adana kebap',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Açıklama string olmalıdır' })
  description?: string;

  @ApiProperty({
    description: 'Ürün fiyatı',
    example: 45.50,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Fiyat sayı olmalıdır' })
  @Min(0, { message: 'Fiyat 0 veya daha büyük olmalıdır' })
  price?: number;

  @ApiProperty({
    description: 'Para birimi',
    example: 'TRY',
    enum: ['TRY', 'USD', 'EUR'],
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Para birimi string olmalıdır' })
  @IsIn(['TRY', 'USD', 'EUR'], { message: 'Para birimi TRY, USD veya EUR olmalıdır' })
  currency?: string;

  @ApiProperty({
    description: 'Ürün fotoğrafı URL',
    example: 'https://example.com/product-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Geçerli bir resim URL giriniz' })
  imageUrl?: string;

  @ApiProperty({
    description: 'Ürün fotoğrafı (base64 formatında). Boş string veya null gönderilirse resim silinir.',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Resim string olmalıdır' })
  @IsBase64Image({ message: 'Resim base64 formatında olmalıdır' })
  image?: string;

  @ApiProperty({
    description: 'Stokta var mı',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Stok durumu boolean olmalıdır' })
  isInStock?: boolean;

  @ApiProperty({
    description: 'İndirimli fiyat (kampanyalı ürünler için). Boş string gönderilirse kampanya kaldırılır.',
    example: 35.50,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'İndirimli fiyat sayı olmalıdır' })
  @Min(0, { message: 'İndirimli fiyat 0 veya daha büyük olmalıdır' })
  discountedPrice?: number;

  @ApiProperty({
    description: 'Sıralama düzeni',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Sıralama düzeni sayı olmalıdır' })
  @Min(0, { message: 'Sıralama düzeni 0 veya daha büyük olmalıdır' })
  sortOrder?: number;

  @ApiProperty({
    description: 'Ürün aktif durumu',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Aktif durumu boolean olmalıdır' })
  isActive?: boolean;
}
