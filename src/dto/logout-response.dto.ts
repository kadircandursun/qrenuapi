import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for logout response
 */
export class LogoutResponseDto {
  @ApiProperty({
    description: 'Başarı mesajı',
    example: 'Başarıyla çıkış yapıldı',
  })
  message: string;

  @ApiProperty({
    description: 'Çıkış zamanı',
    example: '2025-09-20T20:33:49.000Z',
  })
  logoutTime: string;
}
