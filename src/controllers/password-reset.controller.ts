import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PasswordResetService } from '../services/password-reset.service';
import { SendPasswordResetDto } from '../dto/send-password-reset.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { PasswordResetResponseDto } from '../dto/password-reset-response.dto';

@ApiTags('password-reset')
@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('send')
  @ApiOperation({ summary: 'Şifre sıfırlama maili gönder' })
  @ApiBody({ type: SendPasswordResetDto })
  @ApiResponse({
    status: 200,
    description: 'Şifre sıfırlama maili başarıyla gönderildi',
    type: PasswordResetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Şifre sıfırlama maili gönderim hatası',
  })
  @ApiResponse({
    status: 404,
    description: 'Kullanıcı bulunamadı',
  })
  @HttpCode(HttpStatus.OK)
  async sendPasswordResetEmail(@Body() sendPasswordResetDto: SendPasswordResetDto): Promise<PasswordResetResponseDto> {
    return this.passwordResetService.sendPasswordResetEmail(sendPasswordResetDto);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Şifre sıfırlama tokenını doğrula ve şifreyi güncelle' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Şifre başarıyla sıfırlandı',
    type: PasswordResetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Şifre sıfırlama hatası',
  })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<PasswordResetResponseDto> {
    return this.passwordResetService.resetPassword(resetPasswordDto);
  }
}
