import { ApiProperty } from '@nestjs/swagger';

/**
 * Email doğrulama durumu response DTO'su
 */
export class EmailVerificationStatusDto {
  @ApiProperty({
    description: 'Email doğrulama durumu',
    example: true,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Email adresi',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Son doğrulama maili gönderim tarihi',
    example: '2025-01-21T10:30:00.000Z',
    required: false,
  })
  lastVerificationEmailSentAt?: Date;

  @ApiProperty({
    description: 'Bir sonraki doğrulama maili gönderilebilecek tarih',
    example: '2025-01-21T10:40:00.000Z',
    required: false,
  })
  nextVerificationAt?: Date;

  @ApiProperty({
    description: 'Doğrulama tokenının son geçerlilik tarihi',
    example: '2025-01-22T10:30:00.000Z',
    required: false,
  })
  tokenExpiresAt?: Date;
}
