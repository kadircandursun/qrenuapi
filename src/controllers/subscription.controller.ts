import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SubscriptionService } from '../services/subscription.service';
import { UpgradePackageDto } from '../dto/upgrade-package.dto';
import { SubscriptionResponseDto, PackageInfoDto } from '../dto/subscription-response.dto';

/**
 * Subscription controller for managing user package upgrades
 */
@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * Kullanıcının paketini yükselt
   */
  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paket yükseltme (sadece üyeler)' })
  @ApiResponse({
    status: 200,
    description: 'Paket başarıyla yükseltildi',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz paket veya aynı pakete yükseltme',
  })
  @ApiResponse({
    status: 404,
    description: 'Kullanıcı veya paket bulunamadı',
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  async upgradePackage(
    @Request() req: any,
    @Body() upgradePackageDto: UpgradePackageDto,
  ): Promise<SubscriptionResponseDto> {
    return await this.subscriptionService.upgradePackage(req.user.userId, upgradePackageDto);
  }

  /**
   * Tüm paketleri listele (herkese açık)
   */
  @Get('packages')
  @ApiOperation({ summary: 'Tüm paketleri listele (herkese açık)' })
  @ApiResponse({
    status: 200,
    description: 'Paketler başarıyla listelendi',
    type: [PackageInfoDto],
  })
  async getAllPackages(): Promise<PackageInfoDto[]> {
    return await this.subscriptionService.getAllPackages();
  }

  /**
   * Kullanıcının mevcut aboneliğini getir
   */
  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mevcut abonelik bilgileri (sadece üyeler)' })
  @ApiResponse({
    status: 200,
    description: 'Abonelik bilgileri getirildi',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Kullanıcı bulunamadı',
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  async getCurrentSubscription(@Request() req: any): Promise<SubscriptionResponseDto> {
    return await this.subscriptionService.getCurrentSubscription(req.user.userId);
  }
}
