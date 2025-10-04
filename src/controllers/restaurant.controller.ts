import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RestaurantService } from '../services/restaurant.service';
import { SubdomainService } from '../services/subdomain.service';
import { CreateRestaurantDto } from '../dto/create-restaurant.dto';
import { UpdateRestaurantDto } from '../dto/update-restaurant.dto';
import { RestaurantResponseDto } from '../dto/restaurant-response.dto';
import { RestaurantWithMenuDto } from '../dto/restaurant-with-menu.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantController {
  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly subdomainService: SubdomainService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcının restoranlarını listele (sadece kendi restoranları)' })
  @ApiResponse({
    status: 200,
    description: 'Restoranlar başarıyla listelendi',
    type: [RestaurantResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  async getUserRestaurants(@Request() req: any): Promise<RestaurantResponseDto[]> {
    return this.restaurantService.getUserRestaurants(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni restoran oluştur (sadece üyeler)' })
  @ApiBody({ type: CreateRestaurantDto })
  @ApiResponse({
    status: 201,
    description: 'Restoran başarıyla oluşturuldu',
    type: RestaurantResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz veri',
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  @HttpCode(HttpStatus.CREATED)
  async createRestaurant(
    @Request() req: any,
    @Body() createRestaurantDto: CreateRestaurantDto
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.createRestaurant(req.user.userId, createRestaurantDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Restoran detayını getir (herkese açık)' })
  @ApiParam({
    name: 'id',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Restoran detayı başarıyla getirildi',
    type: RestaurantResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  async getRestaurantById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.getRestaurantByIdPublic(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restoran güncelle (sadece sahibi)' })
  @ApiParam({
    name: 'id',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiBody({ type: UpdateRestaurantDto })
  @ApiResponse({
    status: 200,
    description: 'Restoran başarıyla güncellendi',
    type: RestaurantResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz veri',
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  @ApiResponse({
    status: 403,
    description: 'Bu restoranı güncelleme yetkiniz yok',
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  async updateRestaurant(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRestaurantDto: UpdateRestaurantDto
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.updateRestaurant(req.user.userId, id, updateRestaurantDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restoran sil (sadece sahibi)' })
  @ApiParam({
    name: 'id',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Restoran ve tüm verileri başarıyla silindi',
    schema: {
      type: 'object',
      properties: {
        deletedCategories: { type: 'number', example: 5 },
        deletedProducts: { type: 'number', example: 25 },
        deletedImages: { type: 'number', example: 8 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  @ApiResponse({
    status: 403,
    description: 'Bu restoranı silme yetkiniz yok',
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  @HttpCode(HttpStatus.OK)
  async deleteRestaurant(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number
  ): Promise<{ deletedCategories: number; deletedProducts: number; deletedImages: number }> {
    return this.restaurantService.deleteRestaurant(req.user.userId, id);
  }

  @Get('check-subdomain/:subdomain')
  @ApiOperation({ summary: 'Subdomain müsaitlik kontrolü' })
  @ApiParam({
    name: 'subdomain',
    description: 'Kontrol edilecek subdomain',
    example: 'lezzet-duragi',
  })
  @ApiResponse({
    status: 200,
    description: 'Subdomain kontrolü tamamlandı',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean', example: true },
        subdomain: { type: 'string', example: 'lezzet-duragi' },
        message: { type: 'string', example: 'Subdomain müsait' },
        suggestions: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['lezzet-duragi1', 'lezzet-duragi-tr']
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz subdomain formatı',
  })
  async checkSubdomain(
    @Param('subdomain') subdomain: string
  ): Promise<{
    available: boolean;
    subdomain: string;
    message: string;
    suggestions?: string[];
  }> {
    const result = await this.subdomainService.checkSubdomainAvailability(subdomain);
    
    // If not available, generate suggestions
    if (!result.available) {
      const suggestions = await this.subdomainService.generateSubdomainSuggestions(subdomain);
      return {
        ...result,
        suggestions,
      };
    }

    return result;
  }

  @Get('subdomain/:subdomain')
  @ApiOperation({ summary: 'Subdomain\'e göre restoran detayını kategoriler ve ürünlerle getir (herkese açık)' })
  @ApiParam({
    name: 'subdomain',
    description: 'Restoran subdomain\'i',
    example: 'lezzet-duragi',
  })
  @ApiResponse({
    status: 200,
    description: 'Restoran detayı kategoriler ve ürünlerle birlikte başarıyla getirildi',
    type: RestaurantWithMenuDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  async getRestaurantBySubdomain(
    @Param('subdomain') subdomain: string
  ): Promise<RestaurantWithMenuDto> {
    return this.restaurantService.getRestaurantBySubdomain(subdomain);
  }
}
