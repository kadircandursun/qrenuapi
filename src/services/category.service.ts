import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Category } from '../entities/category.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { AuthService } from './auth.service';
import { FileUploadService } from './file-upload.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: EntityRepository<Category>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: EntityRepository<Restaurant>,
    private readonly em: EntityManager,
    private readonly authService: AuthService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Restoranın kategorilerini listele (Sahip için)
   * 
   * Bu metod restoran sahibinin kendi restoranındaki kategorileri getirir.
   * Sahiplik kontrolü yapılır ve ürün sayıları dahil edilir.
   * 
   * @param userId Kullanıcı ID - Restoran sahibinin ID'si
   * @param restaurantId Restoran ID - Kategorilerin getirileceği restoran ID'si
   * @returns Promise<CategoryResponseDto[]> - Kategori listesi
   * 
   * @throws {NotFoundException} Restoran bulunamadığında
   * @throws {ForbiddenException} Kullanıcının restorana erişim yetkisi yoksa
   * 
   * @example
   * ```typescript
   * const categories = await categoryService.getRestaurantCategories(123, 456);
   * // Dönen veri:
   * // [
   * //   {
   * //     id: 1,
   * //     name: "Ana Yemekler",
   * //     description: "Geleneksel Türk mutfağı",
   * //     imageUrl: "https://example.com/image.jpg",
   * //     sortOrder: 1,
   * //     isActive: true,
   * //     restaurantId: 456,
   * //     productCount: 15,
   * //     createdAt: "2025-09-20T10:00:00Z",
   * //     updatedAt: "2025-09-20T10:00:00Z"
   * //   }
   * // ]
   * ```
   */
  async getRestaurantCategories(userId: number, restaurantId: number): Promise<CategoryResponseDto[]> {
    // Restoran sahiplik kontrolü
    await this.validateRestaurantOwnership(userId, restaurantId);

    const categories = await this.categoryRepository.find(
      { restaurant: restaurantId },
      { 
        orderBy: { sortOrder: 'ASC', createdAt: 'ASC' },
        populate: ['products']
      }
    );

    return categories.map(category => this.mapToResponseDto(category));
  }

  /**
   * Kategori oluştur
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @param createCategoryDto Kategori bilgileri
   * @returns Oluşturulan kategori
   */
  async createCategory(
    userId: number,
    restaurantId: number,
    createCategoryDto: CreateCategoryDto
  ): Promise<CategoryResponseDto> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    // Restoran sahiplik kontrolü ve kullanıcı bilgilerini al
    const restaurant = await this.validateRestaurantOwnership(userId, restaurantId);

    // Owner'ı populate et
    const owner = await restaurant.owner.load();
    if (!owner) {
      throw new NotFoundException('Restoran sahibi bulunamadı');
    }

    // Paket aktif mi kontrol et
    if (!owner.isPackageActive()) {
      throw new ForbiddenException('Paket süreniz dolmuş. Lütfen paketinizi yenileyin.');
    }

    // Mevcut kategori sayısını kontrol et
    const currentCategoryCount = await this.categoryRepository.count({ restaurant: restaurantId });
    if (!owner.canCreateCategory(currentCategoryCount)) {
      const limits = owner.getPackageLimits();
      throw new ForbiddenException(
        `Paket limitiniz doldu. Restoran başına maksimum ${limits.maxCategoriesPerRestaurant} kategori açabilirsiniz.`
      );
    }

    // Resim kaydetme işlemi
    let imagePath: string | undefined;
    if (createCategoryDto.image) {
      try {
        imagePath = await this.fileUploadService.saveCategoryImage(createCategoryDto.image);
      } catch (error) {
        throw new ForbiddenException('Resim kaydedilemedi: ' + error.message);
      }
    }

    // Yeni kategori oluştur
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      restaurant: restaurant,
      imagePath,
      sortOrder: createCategoryDto.sortOrder || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(category);

    return this.mapToResponseDto(category);
  }

  /**
   * Kategori güncelle
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @param categoryId Kategori ID
   * @param updateCategoryDto Güncellenecek bilgiler
   * @returns Güncellenen kategori
   */
  async updateCategory(
    userId: number,
    restaurantId: number,
    categoryId: number,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<CategoryResponseDto> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    // Restoran sahiplik kontrolü
    await this.validateRestaurantOwnership(userId, restaurantId);

    // Kategoriyi bul
    const category = await this.categoryRepository.findOne(
      { id: categoryId, restaurant: restaurantId },
      { populate: ['products'] }
    );

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    // Resim işlemi
    let newImagePath: string | undefined = category.imagePath;
    if (updateCategoryDto.image !== undefined) {
      if (updateCategoryDto.image === '' || updateCategoryDto.image === null) {
        // Resim silinmek isteniyor
        await this.deleteOldImage(category.imagePath);
        newImagePath = undefined;
      } else {
        // Yeni resim kaydediliyor
        try {
          await this.deleteOldImage(category.imagePath); // Eski resmi sil
          newImagePath = await this.fileUploadService.saveCategoryImage(updateCategoryDto.image);
        } catch (error) {
          throw new ForbiddenException('Resim kaydedilemedi: ' + error.message);
        }
      }
    }

    // Kategoriyi güncelle
    Object.assign(category, updateCategoryDto);
    category.imagePath = newImagePath;
    
    // sortOrder için default değer kontrolü
    if (category.sortOrder === undefined || category.sortOrder === null) {
      category.sortOrder = 0;
    }
    
    category.updatedAt = new Date();

    await this.em.persistAndFlush(category);

    return this.mapToResponseDto(category);
  }

  /**
   * Kategori sil
   * 
   * Bu metod kategoriyi silmeden önce o kategoriye ait tüm ürünleri ve resimlerini siler.
   * Cascade delete işlemi yapar.
   * 
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @param categoryId Kategori ID
   * @returns Silinen veri sayıları
   */
  async deleteCategory(userId: number, restaurantId: number, categoryId: number): Promise<{
    deletedProducts: number;
    deletedImages: number;
  }> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    // Restoran sahiplik kontrolü
    await this.validateRestaurantOwnership(userId, restaurantId);

    // Kategoriyi bul
    const category = await this.categoryRepository.findOne(
      { id: categoryId, restaurant: restaurantId },
      { populate: ['products'] }
    );

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    // Kategoriye ait ürünleri getir
    const products = await category.products.loadItems();
    let deletedImages = 0;

    // Her ürün için resmi sil
    for (const product of products) {
      if (product.imagePath) {
        try {
          await this.fileUploadService.deleteFile(product.imagePath);
          deletedImages++;
        } catch (error) {
          console.warn(`Ürün resmi silinemedi: ${product.imagePath}`, error.message);
        }
      }
    }

    // Ürünleri veritabanından sil
    if (products.length > 0) {
      await this.em.removeAndFlush(products);
    }

    // Kategori resmini sil
    await this.deleteOldImage(category.imagePath);

    // Kategoriyi sil
    await this.em.removeAndFlush(category);

    return {
      deletedProducts: products.length,
      deletedImages,
    };
  }

  /**
   * Kategori detayını getir
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @param categoryId Kategori ID
   * @returns Kategori detayı
   */
  async getCategoryById(
    userId: number,
    restaurantId: number,
    categoryId: number
  ): Promise<CategoryResponseDto> {
    // Restoran sahiplik kontrolü
    await this.validateRestaurantOwnership(userId, restaurantId);

    // Kategoriyi bul
    const category = await this.categoryRepository.findOne(
      { id: categoryId, restaurant: restaurantId },
      { populate: ['products'] }
    );

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return this.mapToResponseDto(category);
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
      { populate: ['owner', 'owner.package'] }
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
      { id: categoryId, restaurant: restaurantId },
      { populate: ['products'] }
    );

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return category;
  }

  /**
   * Kategori entity'sini response DTO'ya dönüştür
   * 
   * Bu metod Category entity'sini CategoryResponseDto formatına dönüştürür.
   * Ürün sayısı, resim bilgileri ve diğer tüm kategori detayları dahil edilir.
   * 
   * @param category Category entity - Dönüştürülecek kategori entity'si
   * @returns CategoryResponseDto - Response DTO formatında kategori bilgileri
   * 
   * @example
   * ```typescript
   * const categoryEntity = await this.categoryRepository.findOne({ id: 1 });
   * const responseDto = this.mapToResponseDto(categoryEntity);
   * // Dönen veri:
   * // {
   * //   id: 1,
   * //   name: "Ana Yemekler",
   * //   description: "Geleneksel Türk mutfağı",
   * //   imageUrl: "https://example.com/image.jpg",
   * //   imagePath: "uploads/categories/category-1.jpg",
   * //   sortOrder: 1,
   * //   isActive: true,
   * //   restaurantId: 456,
   * //   productCount: 15,
   * //   createdAt: "2025-09-20T10:00:00Z",
   * //   updatedAt: "2025-09-20T10:00:00Z"
   * // }
   * ```
   */
  private mapToResponseDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      imagePath: category.imagePath,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      restaurantId: category.restaurant.id,
      productCount: category.products.isInitialized() ? category.products.length : 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
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
   * Restoranın kategorilerini listele (Herkese Açık)
   * 
   * Bu metod herhangi bir restoranın kategorilerini herkese açık olarak getirir.
   * Sahiplik kontrolü yapılmaz ve ürün sayıları dahil edilmez.
   * Genellikle QR kod okutulduğunda müşteriler için kullanılır.
   * 
   * @param restaurantId Restoran ID - Kategorilerin getirileceği restoran ID'si
   * @returns Promise<CategoryResponseDto[]> - Kategori listesi
   * 
   * @throws {NotFoundException} Restoran bulunamadığında
   * 
   * @example
   * ```typescript
   * const categories = await categoryService.getRestaurantCategoriesPublic(456);
   * // Dönen veri:
   * // [
   * //   {
   * //     id: 1,
   * //     name: "Ana Yemekler",
   * //     description: "Geleneksel Türk mutfağı",
   * //     imageUrl: "https://example.com/image.jpg",
   * //     sortOrder: 1,
   * //     isActive: true,
   * //     restaurantId: 456,
   * //     productCount: 0, // Ürünler populate edilmediği için 0
   * //     createdAt: "2025-09-20T10:00:00Z",
   * //     updatedAt: "2025-09-20T10:00:00Z"
   * //   }
   * // ]
   * ```
   */
  async getRestaurantCategoriesPublic(restaurantId: number): Promise<CategoryResponseDto[]> {
    const restaurant = await this.restaurantRepository.findOne({ id: restaurantId });

    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    const categories = await this.categoryRepository.find(
      { restaurant: restaurantId },
      { 
        orderBy: { sortOrder: 1 },
        populate: ['products']
      }
    );

    return categories.map(category => this.mapToResponseDto(category));
  }

  /**
   * Kategori detayını getir (herkese açık)
   * @param restaurantId Restoran ID
   * @param categoryId Kategori ID
   * @returns Kategori detayı
   */
  async getCategoryByIdPublic(restaurantId: number, categoryId: number): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      id: categoryId,
      restaurant: restaurantId,
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return this.mapToResponseDto(category);
  }

  /**
   * Restoranın tüm kategorilerini ve ürünlerini sil
   * 
   * Bu metod restoran sahibinin tüm kategorilerini ve bu kategorilere ait
   * tüm ürünleri siler. Ayrıca tüm resim dosyalarını da temizler.
   * 
   * @param userId Kullanıcı ID - Restoran sahibinin ID'si
   * @param restaurantId Restoran ID - Silinecek kategorilerin bulunduğu restoran ID'si
   * @returns Silinen kategori ve ürün sayıları
   * 
   * @throws {NotFoundException} Restoran bulunamadığında
   * @throws {ForbiddenException} Kullanıcının restorana erişim yetkisi yoksa
   * @throws {ForbiddenException} Email doğrulanmamışsa
   * 
   * @example
   * ```typescript
   * const result = await categoryService.deleteAllCategoriesAndProducts(123, 456);
   * // Dönen veri:
   * // {
   * //   deletedCategories: 5,
   * //   deletedProducts: 25,
   * //   deletedImages: 8
   * // }
   * ```
   */
  async deleteAllCategoriesAndProducts(userId: number, restaurantId: number): Promise<{
    deletedCategories: number;
    deletedProducts: number;
    deletedImages: number;
  }> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    // Restoran sahiplik kontrolü
    await this.validateRestaurantOwnership(userId, restaurantId);

    // Tüm kategorileri ve ürünlerini getir
    const categories = await this.categoryRepository.find(
      { restaurant: restaurantId },
      { populate: ['products'] }
    );

    let deletedProducts = 0;
    let deletedImages = 0;

    // Her kategori için ürünleri ve resimleri sil
    for (const category of categories) {
      // Kategori resmini sil
      if (category.imagePath) {
        try {
          await this.deleteOldImage(category.imagePath);
          deletedImages++;
        } catch (error) {
          console.warn(`Kategori resmi silinemedi: ${category.imagePath}`, error.message);
        }
      }

      // Kategoriye ait ürünleri sil
      const products = await category.products.loadItems();
      for (const product of products) {
        // Ürün resmini sil
        if (product.imagePath) {
          try {
            await this.fileUploadService.deleteFile(product.imagePath);
            deletedImages++;
          } catch (error) {
            console.warn(`Ürün resmi silinemedi: ${product.imagePath}`, error.message);
          }
        }
        deletedProducts++;
      }

      // Ürünleri veritabanından sil
      if (products.length > 0) {
        await this.em.removeAndFlush(products);
      }
    }

    // Kategorileri sil
    await this.em.removeAndFlush(categories);

    return {
      deletedCategories: categories.length,
      deletedProducts,
      deletedImages,
    };
  }

  /**
   * Belirli kategoriye ait tüm ürünleri sil
   * 
   * Bu metod belirli bir kategoriye ait tüm ürünleri ve resimlerini siler.
   * Kategori kendisi silinmez, sadece içindeki ürünler silinir.
   * 
   * @param userId Kullanıcı ID - Restoran sahibinin ID'si
   * @param restaurantId Restoran ID - Kategorinin bulunduğu restoran ID'si
   * @param categoryId Kategori ID - Silinecek ürünlerin bulunduğu kategori ID'si
   * @returns Silinen ürün sayısı
   * 
   * @throws {NotFoundException} Restoran veya kategori bulunamadığında
   * @throws {ForbiddenException} Kullanıcının restorana erişim yetkisi yoksa
   * @throws {ForbiddenException} Email doğrulanmamışsa
   * 
   * @example
   * ```typescript
   * const result = await categoryService.deleteCategoryProducts(123, 456, 789);
   * // Dönen veri:
   * // {
   * //   deletedProducts: 8,
   * //   deletedImages: 5
   * // }
   * ```
   */
  async deleteCategoryProducts(userId: number, restaurantId: number, categoryId: number): Promise<{
    deletedProducts: number;
    deletedImages: number;
  }> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    // Restoran sahiplik kontrolü
    await this.validateRestaurantOwnership(userId, restaurantId);

    // Kategoriyi bul ve sahiplik kontrolü
    const category = await this.validateCategoryOwnership(restaurantId, categoryId);

    // Kategoriye ait ürünleri getir
    const products = await category.products.loadItems();

    let deletedImages = 0;

    // Her ürün için resmi sil
    for (const product of products) {
      if (product.imagePath) {
        try {
          await this.fileUploadService.deleteFile(product.imagePath);
          deletedImages++;
        } catch (error) {
          console.warn(`Ürün resmi silinemedi: ${product.imagePath}`, error.message);
        }
      }
    }

    // Ürünleri veritabanından sil
    await this.em.removeAndFlush(products);

    return {
      deletedProducts: products.length,
      deletedImages,
    };
  }
}
