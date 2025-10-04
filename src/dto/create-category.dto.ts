import { IsNotEmpty, IsString, IsOptional, IsUrl, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBase64Image } from '../decorators/base64-image.decorator';

/**
 * DTO for creating a category
 */
export class CreateCategoryDto {
  @ApiProperty({
    description: 'Kategori adı',
    example: 'Ana Yemekler',
  })
  @IsString({ message: 'Kategori adı string olmalıdır' })
  @IsNotEmpty({ message: 'Kategori adı boş olamaz' })
  name!: string;

  @ApiProperty({
    description: 'Kategori açıklaması',
    example: 'Geleneksel Türk mutfağının ana yemekleri',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Açıklama string olmalıdır' })
  description?: string;

  @ApiProperty({
    description: 'Kategori resmi URL',
    example: 'https://example.com/category-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Geçerli bir resim URL giriniz' })
  imageUrl?: string;

  @ApiProperty({
    description: 'Kategori resmi (base64 formatında)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Resim string olmalıdır' })
  @IsBase64Image({ message: 'Resim base64 formatında olmalıdır' })
  image?: string;

  @ApiProperty({
    description: 'Sıralama düzeni',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Sıralama düzeni sayı olmalıdır' })
  @Min(0, { message: 'Sıralama düzeni 0 veya daha büyük olmalıdır' })
  sortOrder?: number;
}
