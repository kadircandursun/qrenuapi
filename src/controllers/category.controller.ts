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
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('categories')
@Controller('restaurants/:restaurantId/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Restoranın kategorilerini listele (herkese açık)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Kategoriler başarıyla listelendi',
    type: [CategoryResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  async getRestaurantCategories(
    @Param('restaurantId', ParseIntPipe) restaurantId: number
  ): Promise<CategoryResponseDto[]> {
    return this.categoryService.getRestaurantCategoriesPublic(restaurantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni kategori oluştur (sadece sahibi)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Kategori başarıyla oluşturuldu',
    type: CategoryResponseDto,
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
    description: 'Bu restorana erişim yetkiniz yok',
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Request() req: any,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() createCategoryDto: CreateCategoryDto
  ): Promise<CategoryResponseDto> {
    return this.categoryService.createCategory(req.user.userId, restaurantId, createCategoryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kategori detayını getir (herkese açık)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiParam({
    name: 'id',
    description: 'Kategori ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Kategori detayı başarıyla getirildi',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Kategori bulunamadı',
  })
  async getCategoryById(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<CategoryResponseDto> {
    return this.categoryService.getCategoryByIdPublic(restaurantId, id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategori güncelle (sadece sahibi)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiParam({
    name: 'id',
    description: 'Kategori ID',
    example: 1,
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Kategori başarıyla güncellendi',
    type: CategoryResponseDto,
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
    description: 'Bu restorana erişim yetkiniz yok',
  })
  @ApiResponse({
    status: 404,
    description: 'Kategori bulunamadı',
  })
  async updateCategory(
    @Request() req: any,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<CategoryResponseDto> {
    return this.categoryService.updateCategory(req.user.userId, restaurantId, id, updateCategoryDto);
  }

  @Delete('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restoranın tüm kategorilerini ve ürünlerini sil (sadece sahibi)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tüm kategoriler ve ürünler başarıyla silindi',
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
    description: 'Bu restorana erişim yetkiniz yok',
  })
  @ApiResponse({
    status: 404,
    description: 'Restoran bulunamadı',
  })
  @HttpCode(HttpStatus.OK)
  async deleteAllCategoriesAndProducts(
    @Request() req: any,
    @Param('restaurantId', ParseIntPipe) restaurantId: number
  ): Promise<{ deletedCategories: number; deletedProducts: number; deletedImages: number }> {
    return this.categoryService.deleteAllCategoriesAndProducts(req.user.userId, restaurantId);
  }

  @Delete(':id/products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategoriye ait tüm ürünleri sil (sadece sahibi)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiParam({
    name: 'id',
    description: 'Kategori ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Kategoriye ait ürünler başarıyla silindi',
    schema: {
      type: 'object',
      properties: {
        deletedProducts: { type: 'number', example: 8 },
        deletedImages: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  @ApiResponse({
    status: 403,
    description: 'Bu restorana erişim yetkiniz yok',
  })
  @ApiResponse({
    status: 404,
    description: 'Kategori bulunamadı',
  })
  @HttpCode(HttpStatus.OK)
  async deleteCategoryProducts(
    @Request() req: any,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<{ deletedProducts: number; deletedImages: number }> {
    return this.categoryService.deleteCategoryProducts(req.user.userId, restaurantId, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategori sil (sadece sahibi)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiParam({
    name: 'id',
    description: 'Kategori ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Kategori ve ürünleri başarıyla silindi',
    schema: {
      type: 'object',
      properties: {
        deletedProducts: { type: 'number', example: 8 },
        deletedImages: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim',
  })
  @ApiResponse({
    status: 403,
    description: 'Bu restorana erişim yetkiniz yok',
  })
  @ApiResponse({
    status: 404,
    description: 'Kategori bulunamadı',
  })
  @HttpCode(HttpStatus.OK)
  async deleteCategory(
    @Request() req: any,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<{ deletedProducts: number; deletedImages: number }> {
    return this.categoryService.deleteCategory(req.user.userId, restaurantId, id);
  }
}
