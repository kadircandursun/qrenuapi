import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for password reset response
 */
export class PasswordResetResponseDto {
  @ApiProperty({
    description: 'İşlem durumu',
    example: 'success',
  })
  status!: string;

  @ApiProperty({
    description: 'İşlem mesajı',
    example: 'Şifre sıfırlama maili gönderildi',
  })
  message!: string;

  @ApiProperty({
    description: 'Sonraki mail gönderim tarihi (cooldown)',
    example: '2025-09-20T15:40:00.000Z',
    required: false,
  })
  nextResetAt?: Date;
}
