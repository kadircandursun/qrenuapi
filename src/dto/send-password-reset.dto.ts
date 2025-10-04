import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for sending password reset email
 */
export class SendPasswordResetDto {
  @ApiProperty({
    description: 'Email adresi',
    example: 'denizuca24@gmail.com',
  })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty({ message: 'Email adresi boş olamaz' })
  email!: string;
}
