import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Kullanıcının email adresi',
    example: 'denizuca24@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Kullanıcının şifresi',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
