import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
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
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserProfileDto } from '../dto/user-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { LogoutResponseDto } from '../dto/logout-response.dto';
import { DeleteAccountDto } from '../dto/delete-account.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthRateLimit } from '../decorators/rate-limit.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @AuthRateLimit() // 5 istek/15 dakika
  @ApiOperation({ summary: 'Kullanıcı kaydı' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Kullanıcı başarıyla kaydedildi',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email adresi zaten kullanılıyor',
  })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @AuthRateLimit() // 5 istek/15 dakika
  @ApiOperation({ summary: 'Kullanıcı girişi' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Giriş başarılı',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Email veya şifre hatalı',
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcı profil bilgileri' })
  @ApiResponse({
    status: 200,
    description: 'Profil bilgileri başarıyla getirildi',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  async getProfile(@Request() req: any): Promise<UserProfileDto> {
    return this.authService.getProfile(req.user.userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil bilgilerini güncelle' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profil başarıyla güncellendi',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz veri',
  })
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.authService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hesabı tamamen sil' })
  @ApiBody({ type: DeleteAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Hesap başarıyla silindi',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Hesabınız başarıyla silindi',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim veya şifre hatalı',
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz veri',
  })
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @Request() req: any,
    @Body() deleteAccountDto: DeleteAccountDto,
  ): Promise<{ message: string }> {
    return this.authService.deleteAccount(req.user.userId, deleteAccountDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcı çıkışı' })
  @ApiResponse({
    status: 200,
    description: 'Başarıyla çıkış yapıldı',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any): Promise<LogoutResponseDto> {
    return this.authService.logout(req.user.userId);
  }
}
