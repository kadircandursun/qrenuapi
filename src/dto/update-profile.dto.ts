import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsPhoneNumber, MaxLength, MinLength } from 'class-validator';

/**
 * DTO for updating user profile
 */
export class UpdateProfileDto {
  @ApiProperty({
    description: 'Kullanıcı adı',
    example: 'Ahmet',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Ad en az 2 karakter olmalıdır' })
  @MaxLength(50, { message: 'Ad en fazla 50 karakter olabilir' })
  firstName?: string;

  @ApiProperty({
    description: 'Kullanıcı soyadı',
    example: 'Yılmaz',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Soyad en az 2 karakter olmalıdır' })
  @MaxLength(50, { message: 'Soyad en fazla 50 karakter olabilir' })
  lastName?: string;

  @ApiProperty({
    description: 'Telefon numarası',
    example: '+905551234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('TR', { message: 'Geçerli bir telefon numarası giriniz' })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Şirket adı',
    example: 'Lezzet Durağı A.Ş.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Şirket adı en az 2 karakter olmalıdır' })
  @MaxLength(100, { message: 'Şirket adı en fazla 100 karakter olabilir' })
  companyName?: string;
}
