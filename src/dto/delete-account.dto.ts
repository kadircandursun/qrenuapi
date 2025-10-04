import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * Hesap silme için şifre doğrulama DTO'su
 */
export class DeleteAccountDto {
  @ApiProperty({
    description: 'Kullanıcı şifresi',
    example: 'mySecurePassword123',
    minLength: 6,
  })
  @IsString({ message: 'Şifre metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'Şifre boş olamaz' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;
}
