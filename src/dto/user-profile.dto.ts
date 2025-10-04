import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({
    description: 'Kullanıcı ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Kullanıcının adı',
    example: 'Ahmet',
  })
  firstName: string;

  @ApiProperty({
    description: 'Kullanıcının soyadı',
    example: 'Yılmaz',
  })
  lastName: string;

  @ApiProperty({
    description: 'Kullanıcının email adresi',
    example: 'denizuca24@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'Kullanıcının telefon numarası',
    example: '+905551234567',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Firma adı',
    example: 'ABC Teknoloji A.Ş.',
  })
  companyName: string;

  @ApiProperty({
    description: 'Kullanıcının aktif olup olmadığı',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Kullanıcının oluşturulma tarihi',
    example: '2025-09-20T11:42:36.179Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Kullanıcının güncellenme tarihi',
    example: '2025-09-20T11:42:36.179Z',
  })
  updatedAt: Date;
}
