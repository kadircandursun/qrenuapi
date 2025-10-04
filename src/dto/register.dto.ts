import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsPhoneNumber } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Kullanıcının adı',
    example: 'Ahmet',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Kullanıcının soyadı',
    example: 'Yılmaz',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Kullanıcının email adresi',
    example: 'denizuca24@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Kullanıcının telefon numarası',
    example: '+905551234567',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Firma adı',
    example: 'ABC Teknoloji A.Ş.',
  })
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @ApiProperty({
    description: 'Kullanıcının şifresi',
    example: '123456',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
