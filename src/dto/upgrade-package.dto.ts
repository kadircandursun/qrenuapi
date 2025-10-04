import { IsNumber, IsPositive, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for upgrading user package
 */
export class UpgradePackageDto {
  @ApiProperty({
    description: 'Yükseltilecek paket ID',
    example: 2,
  })
  @IsNumber()
  @IsPositive()
  packageId!: number;

  @ApiProperty({
    description: 'Ödeme bilgileri (gelecekte kullanılacak)',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({
    description: 'Ödeme token (gelecekte kullanılacak)',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentToken?: string;
}
