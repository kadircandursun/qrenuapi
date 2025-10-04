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
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('products')
@Controller('restaurants/:restaurantId/categories/:categoryId/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Kategorinin ürünlerini listele (herkese açık)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Kategori ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ürünler başarıyla listelendi',
    type: [ProductResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Kategori bulunamadı',
  })
  async getCategoryProducts(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number
  ): Promise<ProductResponseDto[]> {
    return this.productService.getCategoryProductsPublic(restaurantId, categoryId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni ürün oluştur (sadece sahibi)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Kategori ID',
    example: 1,
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Ürün başarıyla oluşturuldu',
    type: ProductResponseDto,
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
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @Request() req: any,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() createProductDto: CreateProductDto
  ): Promise<ProductResponseDto> {
    return this.productService.createProduct(req.user.userId, restaurantId, categoryId, createProductDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ürün detayını getir (herkese açık)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Kategori ID',
    example: 1,
  })
  @ApiParam({
    name: 'id',
    description: 'Ürün ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün detayı başarıyla getirildi',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün bulunamadı',
  })
  async getProductById(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<ProductResponseDto> {
    return this.productService.getProductByIdPublic(restaurantId, categoryId, id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün güncelle (sadece sahibi)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Kategori ID',
    example: 1,
  })
  @ApiParam({
    name: 'id',
    description: 'Ürün ID',
    example: 1,
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Ürün başarıyla güncellendi',
    type: ProductResponseDto,
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
    description: 'Ürün bulunamadı',
  })
  async updateProduct(
    @Request() req: any,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<ProductResponseDto> {
    return this.productService.updateProduct(req.user.userId, restaurantId, categoryId, id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün sil (sadece sahibi)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restoran ID',
    example: 1,
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Kategori ID',
    example: 1,
  })
  @ApiParam({
    name: 'id',
    description: 'Ürün ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün başarıyla silindi',
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
    description: 'Ürün bulunamadı',
  })
  @HttpCode(HttpStatus.OK)
  async deleteProduct(
    @Request() req: any,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<{ message: string }> {
    await this.productService.deleteProduct(req.user.userId, restaurantId, categoryId, id);
    return { message: 'Ürün başarıyla silindi' };
  }
}
