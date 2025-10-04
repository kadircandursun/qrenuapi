import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { AuthService } from './auth.service';
import { FileUploadService } from './file-upload.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: EntityRepository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: EntityRepository<Category>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: EntityRepository<Restaurant>,
    private readonly em: EntityManager,
    private readonly authService: AuthService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Kategorinin ürünlerini listele
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @param categoryId Kategori ID
   * @returns Kategorinin ürünleri
   */
  async getCategoryProducts(
    userId: number,
    restaurantId: number,
    categoryId: number
  ): Promise<ProductResponseDto[]> {
    // Restoran sahiplik kontrolü
    await this.validateRestaurantOwnership(userId, restaurantId);

    // Kategoriyi bul ve sahiplik kontrolü
    const category = await this.validateCategoryOwnership(restaurantId, categoryId);

    const products = await this.productRepository.find(
      { category: categoryId },
      { orderBy: { sortOrder: 'ASC', createdAt: 'ASC' } }
    );

    return products.map(product => this.mapToResponseDto(product));
  }

  /**
   * Ürün oluştur
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @param categoryId Kategori ID
   * @param createProductDto Ürün bilgileri
   * @returns Oluşturulan ürün
   */
  async createProduct(
    userId: number,
    restaurantId: number,
    categoryId: number,
    createProductDto: CreateProductDto
  ): Promise<ProductResponseDto> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    // Restoran sahiplik kontrolü
    await this.validateRestaurantOwnership(userId, restaurantId);

    // Kategoriyi bul ve sahiplik kontrolü
    const category = await this.validateCategoryOwnership(restaurantId, categoryId);

    // Restoran sahibinin paket bilgilerini al
    const restaurant = await this.restaurantRepository.findOne(
      { id: restaurantId },
      { populate: ['owner', 'owner.package'] }
    );

    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Owner'ı populate et
    const owner = await restaurant.owner.load();
    if (!owner) {
      throw new NotFoundException('Restoran sahibi bulunamadı');
    }

    // Paket aktif mi kontrol et
    if (!owner.isPackageActive()) {
      throw new ForbiddenException('Paket süreniz dolmuş. Lütfen paketinizi yenileyin.');
    }

    // Mevcut ürün sayısını kontrol et
    const currentProductCount = await this.productRepository.count({ category: categoryId });
    if (!owner.canCreateProduct(currentProductCount)) {
      const limits = owner.getPackageLimits();
      throw new ForbiddenException(
        `Paket limitiniz doldu. Kategori başına maksimum ${limits.maxProductsPerCategory} ürün ekleyebilirsiniz.`
      );
    }

    // Resim kaydetme işlemi
    let imagePath: string | undefined;
    if (createProductDto.image) {
      try {
        imagePath = await this.fileUploadService.saveProductImage(createProductDto.image);
      } catch (error) {
        throw new ForbiddenException('Resim kaydedilemedi: ' + error.message);
      }
    }

    // Yeni ürün oluştur
    const product = this.productRepository.create({
      ...createProductDto,
      category: category,
      imagePath,
      sortOrder: createProductDto.sortOrder || 0,
      isInStock: createProductDto.isInStock !== undefined ? createProductDto.isInStock : true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(product);

    return this.mapToResponseDto(product);
  }

  /**
   * Ürün güncelle
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @param categoryId Kategori ID
   * @param productId Ürün ID
   * @param updateProductDto Güncellenecek bilgiler
   * @returns Güncellenen ürün
   */
  async updateProduct(
    userId: number,
    restaurantId: number,
    categoryId: number,
    productId: number,
    updateProductDto: UpdateProductDto
  ): Promise<ProductResponseDto> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    // Restoran sahiplik kontrolü
    await this.validateRestaurantOwnership(userId, restaurantId);

    // Kategoriyi bul ve sahiplik kontrolü
    await this.validateCategoryOwnership(restaurantId, categoryId);

    // Ürünü bul
    const product = await this.productRepository.findOne(
      { id: productId, category: categoryId }
    );

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Resim işlemi
    let newImagePath: string | undefined = product.imagePath;
    if (updateProductDto.image !== undefined) {
      if (updateProductDto.image === '' || updateProductDto.image === null) {
        // Resim silinmek isteniyor
        await this.deleteOldImage(product.imagePath);
        newImagePath = undefined;
      } else {
        // Yeni resim kaydediliyor
        try {
          await this.deleteOldImage(product.imagePath); // Eski resmi sil
          newImagePath = await this.fileUploadService.saveProductImage(updateProductDto.image);
        } catch (error) {
          throw new ForbiddenException('Resim kaydedilemedi: ' + error.message);
        }
      }
    }

    // Ürünü güncelle
    Object.assign(product, updateProductDto);
    product.imagePath = newImagePath;
    product.updatedAt = new Date();

    await this.em.persistAndFlush(product);

    return this.mapToResponseDto(product);
  }

  /**
   * Ürün sil
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @param categoryId Kategori ID
   * @param productId Ürün ID
   */
  async deleteProduct(
    userId: number,
    restaurantId: number,
    categoryId: number,
    productId: number
  ): Promise<void> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    // Restoran sahiplik kontrolü
    await this.validateRestaurantOwnership(userId, restaurantId);

    // Kategoriyi bul ve sahiplik kontrolü
    await this.validateCategoryOwnership(restaurantId, categoryId);

    // Ürünü bul
    const product = await this.productRepository.findOne(
      { id: productId, category: categoryId }
    );

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Resim dosyasını sil
    await this.deleteOldImage(product.imagePath);

    await this.em.removeAndFlush(product);
  }

  /**
   * Ürün detayını getir
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @param categoryId Kategori ID
   * @param productId Ürün ID
   * @returns Ürün detayı
   */
  async getProductById(
    userId: number,
    restaurantId: number,
    categoryId: number,
    productId: number
  ): Promise<ProductResponseDto> {
    // Restoran sahiplik kontrolü
    await this.validateRestaurantOwnership(userId, restaurantId);

    // Kategoriyi bul ve sahiplik kontrolü
    await this.validateCategoryOwnership(restaurantId, categoryId);

    // Ürünü bul
    const product = await this.productRepository.findOne(
      { id: productId, category: categoryId }
    );

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return this.mapToResponseDto(product);
  }

  /**
   * Restoran sahiplik kontrolü
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @returns Restoran entity
   */
  private async validateRestaurantOwnership(userId: number, restaurantId: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne(
      { id: restaurantId },
      { populate: ['owner'] }
    );

    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    if (restaurant.owner.id !== userId) {
      throw new ForbiddenException('Bu restorana erişim yetkiniz yok');
    }

    return restaurant;
  }

  /**
   * Kategori sahiplik kontrolü
   * @param restaurantId Restoran ID
   * @param categoryId Kategori ID
   * @returns Kategori entity
   */
  private async validateCategoryOwnership(restaurantId: number, categoryId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne(
      { id: categoryId, restaurant: restaurantId }
    );

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return category;
  }

  /**
   * Product entity'sini response DTO'ya dönüştür
   * @param product Product entity
   * @returns Product response DTO
   */
  private mapToResponseDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      discountedPrice: product.discountedPrice,
      imageUrl: product.imageUrl,
      imagePath: product.imagePath,
      isInStock: product.isInStock,
      sortOrder: product.sortOrder,
      isActive: product.isActive,
      categoryId: product.category.id,
      formattedPrice: product.getFormattedPrice(),
      formattedDiscountedPrice: product.getFormattedDiscountedPrice(),
      discountPercentage: product.getDiscountPercentage(),
      isOnSale: product.isOnSale(),
      isAvailable: product.isAvailable(),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Eski resim dosyasını sil
   * @param imagePath Silinecek resim dosya yolu
   */
  private async deleteOldImage(imagePath: string | undefined): Promise<void> {
    if (imagePath) {
      try {
        await this.fileUploadService.deleteFile(imagePath);
      } catch (error) {
        console.warn('Eski resim silinemedi:', error.message);
      }
    }
  }

  /**
   * Kategorinin ürünlerini listele (herkese açık)
   * @param restaurantId Restoran ID
   * @param categoryId Kategori ID
   * @returns Ürünler
   */
  async getCategoryProductsPublic(restaurantId: number, categoryId: number): Promise<ProductResponseDto[]> {
    // Restoran kontrolü
    const restaurant = await this.restaurantRepository.findOne({ id: restaurantId });
    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Kategori kontrolü
    const category = await this.categoryRepository.findOne({
      id: categoryId,
      restaurant: restaurantId,
    });
    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    const products = await this.productRepository.find(
      { category: categoryId },
      { orderBy: { sortOrder: 1 } }
    );

    return products.map(product => this.mapToResponseDto(product));
  }

  /**
   * Ürün detayını getir (herkese açık)
   * @param restaurantId Restoran ID
   * @param categoryId Kategori ID
   * @param productId Ürün ID
   * @returns Ürün detayı
   */
  async getProductByIdPublic(
    restaurantId: number,
    categoryId: number,
    productId: number
  ): Promise<ProductResponseDto> {
    // Restoran kontrolü
    const restaurant = await this.restaurantRepository.findOne({ id: restaurantId });
    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Kategori kontrolü
    const category = await this.categoryRepository.findOne({
      id: categoryId,
      restaurant: restaurantId,
    });
    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    // Ürünü bul
    const product = await this.productRepository.findOne({
      id: productId,
      category: categoryId,
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return this.mapToResponseDto(product);
  }
}
