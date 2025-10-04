import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmailVerificationService } from '../services/email-verification.service';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { VerificationResponseDto } from '../dto/verification-response.dto';
import { EmailVerificationStatusDto } from '../dto/email-verification-status.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('email-verification')
@Controller('email-verification')
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Email doğrulama maili gönder' })
  @ApiResponse({
    status: 200,
    description: 'Doğrulama maili başarıyla gönderildi',
    type: VerificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Doğrulama maili gönderim hatası',
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  @HttpCode(HttpStatus.OK)
  async sendVerificationEmail(@Request() req: any): Promise<VerificationResponseDto> {
    return this.emailVerificationService.sendVerificationEmailByUserId(req.user.userId);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Email doğrulama durumunu kontrol et' })
  @ApiResponse({
    status: 200,
    description: 'Email doğrulama durumu başarıyla getirildi',
    type: EmailVerificationStatusDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  @ApiResponse({
    status: 404,
    description: 'Kullanıcı bulunamadı',
  })
  @HttpCode(HttpStatus.OK)
  async getEmailVerificationStatus(@Request() req: any): Promise<EmailVerificationStatusDto> {
    return this.emailVerificationService.getEmailVerificationStatus(req.user.userId);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Email doğrulama tokenını doğrula' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email başarıyla doğrulandı',
    type: VerificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Doğrulama hatası',
  })
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<VerificationResponseDto> {
    return this.emailVerificationService.verifyEmail(verifyEmailDto);
  }
}
