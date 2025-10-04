import { ApiProperty } from '@nestjs/swagger';

export class VerificationResponseDto {
  @ApiProperty({
    description: 'İşlem durumu',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Durum mesajı',
    example: 'Email doğrulama maili gönderildi',
  })
  message: string;

  @ApiProperty({
    description: 'Sonraki doğrulama maili gönderebilme zamanı',
    example: '2025-09-20T15:20:00.000Z',
    required: false,
  })
  nextVerificationAt?: Date;
}
