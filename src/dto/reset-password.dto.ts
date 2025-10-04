import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for resetting password with token
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: 'Şifre sıfırlama tokenı',
    example: 'abc123def456ghi789',
  })
  @IsString({ message: 'Token string olmalıdır' })
  @IsNotEmpty({ message: 'Token boş olamaz' })
  token!: string;

  @ApiProperty({
    description: 'Yeni şifre',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsString({ message: 'Şifre string olmalıdır' })
  @IsNotEmpty({ message: 'Şifre boş olamaz' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  newPassword!: string;
}
