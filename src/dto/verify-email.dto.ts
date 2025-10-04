import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email doğrulama tokenı',
    example: 'abc123def456ghi789',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
