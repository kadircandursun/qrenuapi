import { IsNotEmpty, IsString, IsOptional, IsUrl, MaxLength, Matches, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBase64Image } from '../decorators/base64-image.decorator';

/**
 * DTO for creating a restaurant
 */
export class CreateRestaurantDto {
  @ApiProperty({
    description: 'Restoran adı',
    example: 'Lezzet Durağı',
    maxLength: 100,
  })
  @IsString({ message: 'Restoran adı string olmalıdır' })
  @IsNotEmpty({ message: 'Restoran adı boş olamaz' })
  @MaxLength(100, { message: 'Restoran adı en fazla 100 karakter olabilir' })
  name!: string;

  @ApiProperty({
    description: 'Restoran subdomain (URL ön eki)',
    example: 'lezzet-duragi',
    maxLength: 63,
  })
  @IsString({ message: 'Subdomain string olmalıdır' })
  @IsNotEmpty({ message: 'Subdomain boş olamaz' })
  @MaxLength(63, { message: 'Subdomain en fazla 63 karakter olabilir' })
  @Matches(/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/, {
    message: 'Subdomain sadece küçük harf, rakam ve tire içerebilir. Tire ile başlayıp bitemez.',
  })
  subdomain!: string;

  @ApiProperty({
    description: 'Restoran açıklaması',
    example: 'Geleneksel Türk mutfağının en lezzetli örneklerini sunuyoruz.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Açıklama string olmalıdır' })
  description?: string;

  @ApiProperty({
    description: 'Hoşgeldin mesajı',
    example: 'QRenu\'ya hoş geldiniz! Menümüzü inceleyebilirsiniz.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Hoşgeldin mesajı string olmalıdır' })
  welcomeMessage?: string;

  @ApiProperty({
    description: 'Website URL',
    example: 'https://www.lezzetduragi.com',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.websiteUrl && o.websiteUrl.trim() !== '')
  @IsUrl({}, { message: 'Geçerli bir website URL giriniz' })
  websiteUrl?: string;

  @ApiProperty({
    description: 'Instagram URL',
    example: 'https://www.instagram.com/lezzetduragi',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.instagramUrl && o.instagramUrl.trim() !== '')
  @IsUrl({}, { message: 'Geçerli bir Instagram URL giriniz' })
  instagramUrl?: string;

  @ApiProperty({
    description: 'Facebook URL',
    example: 'https://www.facebook.com/lezzetduragi',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.facebookUrl && o.facebookUrl.trim() !== '')
  @IsUrl({}, { message: 'Geçerli bir Facebook URL giriniz' })
  facebookUrl?: string;

  @ApiProperty({
    description: 'Twitter URL',
    example: 'https://www.twitter.com/lezzetduragi',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.twitterUrl && o.twitterUrl.trim() !== '')
  @IsUrl({}, { message: 'Geçerli bir Twitter URL giriniz' })
  twitterUrl?: string;

  @ApiProperty({
    description: 'LinkedIn URL',
    example: 'https://www.linkedin.com/company/lezzetduragi',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.linkedinUrl && o.linkedinUrl.trim() !== '')
  @IsUrl({}, { message: 'Geçerli bir LinkedIn URL giriniz' })
  linkedinUrl?: string;

  @ApiProperty({
    description: 'YouTube URL',
    example: 'https://www.youtube.com/c/lezzetduragi',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.youtubeUrl && o.youtubeUrl.trim() !== '')
  @IsUrl({}, { message: 'Geçerli bir YouTube URL giriniz' })
  youtubeUrl?: string;

  @ApiProperty({
    description: 'TikTok URL',
    example: 'https://www.tiktok.com/@lezzetduragi',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.tiktokUrl && o.tiktokUrl.trim() !== '')
  @IsUrl({}, { message: 'Geçerli bir TikTok URL giriniz' })
  tiktokUrl?: string;

  @ApiProperty({
    description: 'Restoran logosu (data URL formatında)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Logo string olmalıdır' })
  @IsBase64Image({ message: 'Logo base64 formatında olmalıdır' })
  logo?: string;
}
