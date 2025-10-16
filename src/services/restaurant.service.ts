import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Restaurant } from '../entities/restaurant.entity';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { CreateRestaurantDto } from '../dto/create-restaurant.dto';
import { UpdateRestaurantDto } from '../dto/update-restaurant.dto';
import { RestaurantResponseDto } from '../dto/restaurant-response.dto';
import { RestaurantWithMenuDto, CategoryInMenuDto, ProductInMenuDto } from '../dto/restaurant-with-menu.dto';
import { SubdomainService } from './subdomain.service';
import { AuthService } from './auth.service';
import { CategoryService } from './category.service';
import { FileUploadService } from './file-upload.service';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: EntityRepository<Restaurant>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: EntityRepository<Category>,
    private readonly em: EntityManager,
    private readonly subdomainService: SubdomainService,
    private readonly authService: AuthService,
    private readonly fileUploadService: FileUploadService,
    private readonly categoryService: CategoryService,
  ) {}

  /**
   * Kullanıcının restoranlarını listele
   * @param userId Kullanıcı ID
   * @returns Kullanıcının restoranları
   */
  async getUserRestaurants(userId: number): Promise<RestaurantResponseDto[]> {
    const restaurants = await this.restaurantRepository.find(
      { owner: userId },
      { orderBy: { createdAt: 'DESC' } }
    );

    return restaurants.map(restaurant => this.mapToResponseDto(restaurant));
  }

  /**
   * Restoran oluştur
   * @param userId Kullanıcı ID
   * @param createRestaurantDto Restoran bilgileri
   * @returns Oluşturulan restoran
   */
  async createRestaurant(userId: number, createRestaurantDto: CreateRestaurantDto): Promise<RestaurantResponseDto> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    // Kullanıcıyı bul ve paket bilgilerini yükle
    const user = await this.userRepository.findOne(
      { id: userId },
      { populate: ['package'] }
    );
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Paket aktif mi kontrol et
    if (!user.isPackageActive()) {
      throw new ForbiddenException('Paket süreniz dolmuş. Lütfen paketinizi yenileyin.');
    }

    // Mevcut restoran sayısını kontrol et
    const currentRestaurantCount = await this.restaurantRepository.count({ owner: userId });
    if (!user.canCreateRestaurant(currentRestaurantCount)) {
      const limits = user.getPackageLimits();
      throw new ForbiddenException(
        `Paket limitiniz doldu. Maksimum ${limits.maxRestaurants} restoran açabilirsiniz.`
      );
    }

    // Subdomain kontrolü
    await this.subdomainService.reserveSubdomain(createRestaurantDto.subdomain);

    // Logo kaydetme işlemi
    let logoPath: string | undefined;
    if (createRestaurantDto.logo) {
      try {
        logoPath = await this.fileUploadService.saveBase64Image(createRestaurantDto.logo);
      } catch (error) {
        throw new ForbiddenException('Logo kaydedilemedi: ' + error.message);
      }
    }

    // Yeni restoran oluştur
    const restaurant = this.restaurantRepository.create({
      ...createRestaurantDto,
      subdomain: createRestaurantDto.subdomain.toLowerCase(), // Normalize to lowercase
      logoPath,
      owner: user,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(restaurant);

    return this.mapToResponseDto(restaurant);
  }

  /**
   * Restoran güncelle
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @param updateRestaurantDto Güncellenecek bilgiler
   * @returns Güncellenen restoran
   */
  async updateRestaurant(
    userId: number,
    restaurantId: number,
    updateRestaurantDto: UpdateRestaurantDto
  ): Promise<RestaurantResponseDto> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    // Restoranı bul
    const restaurant = await this.restaurantRepository.findOne(
      { id: restaurantId },
      { populate: ['owner'] }
    );

    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Sahiplik kontrolü
    if (restaurant.owner.id !== userId) {
      throw new ForbiddenException('Bu restoranı güncelleme yetkiniz yok');
    }

    // Logo işlemi
    let newLogoPath: string | undefined = restaurant.logoPath;
    if (updateRestaurantDto.logo !== undefined) {
      if (updateRestaurantDto.logo === '' || updateRestaurantDto.logo === null) {
        // Logo silinmek isteniyor
        await this.deleteOldLogo(restaurant.logoPath);
        newLogoPath = undefined;
      } else {
        // Yeni logo kaydediliyor
        try {
          await this.deleteOldLogo(restaurant.logoPath); // Eski logoyu sil
          newLogoPath = await this.fileUploadService.saveBase64Image(updateRestaurantDto.logo);
        } catch (error) {
          throw new ForbiddenException('Logo kaydedilemedi: ' + error.message);
        }
      }
    }

    // Subdomain kontrolü ve güncelleme
    if (updateRestaurantDto.subdomain !== undefined) {
      // Subdomain benzersizlik kontrolü
      const existingRestaurant = await this.restaurantRepository.findOne({
        subdomain: updateRestaurantDto.subdomain,
        id: { $ne: restaurantId } // Mevcut restoran hariç
      });
      
      if (existingRestaurant) {
        throw new ConflictException('Bu subdomain zaten kullanılıyor');
      }
      
      restaurant.subdomain = updateRestaurantDto.subdomain;
    }

    // Restoranı güncelle - sadece gönderilen alanları güncelle
    if (updateRestaurantDto.name !== undefined) {
      restaurant.name = updateRestaurantDto.name;
    }
    if (updateRestaurantDto.description !== undefined) {
      restaurant.description = updateRestaurantDto.description;
    }
    if (updateRestaurantDto.welcomeMessage !== undefined) {
      restaurant.welcomeMessage = updateRestaurantDto.welcomeMessage;
    }
    if (updateRestaurantDto.websiteUrl !== undefined) {
      restaurant.websiteUrl = updateRestaurantDto.websiteUrl;
    }
    if (updateRestaurantDto.instagramUrl !== undefined) {
      restaurant.instagramUrl = updateRestaurantDto.instagramUrl;
    }
    if (updateRestaurantDto.facebookUrl !== undefined) {
      restaurant.facebookUrl = updateRestaurantDto.facebookUrl;
    }
    if (updateRestaurantDto.twitterUrl !== undefined) {
      restaurant.twitterUrl = updateRestaurantDto.twitterUrl;
    }
    if (updateRestaurantDto.linkedinUrl !== undefined) {
      restaurant.linkedinUrl = updateRestaurantDto.linkedinUrl;
    }
    if (updateRestaurantDto.youtubeUrl !== undefined) {
      restaurant.youtubeUrl = updateRestaurantDto.youtubeUrl;
    }
    if (updateRestaurantDto.tiktokUrl !== undefined) {
      restaurant.tiktokUrl = updateRestaurantDto.tiktokUrl;
    }
    if (updateRestaurantDto.isActive !== undefined) {
      restaurant.isActive = updateRestaurantDto.isActive;
    }
    
    restaurant.logoPath = newLogoPath;
    restaurant.updatedAt = new Date();

    await this.em.persistAndFlush(restaurant);

    return this.mapToResponseDto(restaurant);
  }

  /**
   * Restoran sil
   * 
   * Bu metod restoranı silmeden önce tüm kategorileri, ürünleri ve resimleri siler.
   * Cascade delete işlemi yapar.
   * 
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @returns Silinen veri sayıları
   */
  async deleteRestaurant(userId: number, restaurantId: number): Promise<{
    deletedCategories: number;
    deletedProducts: number;
    deletedImages: number;
  }> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    // Restoranı bul
    const restaurant = await this.restaurantRepository.findOne(
      { id: restaurantId },
      { populate: ['owner'] }
    );

    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Sahiplik kontrolü
    if (restaurant.owner.id !== userId) {
      throw new ForbiddenException('Bu restoranı silme yetkiniz yok');
    }

    // Önce tüm kategorileri ve ürünleri sil
    const deleteResult = await this.categoryService.deleteAllCategoriesAndProducts(userId, restaurantId);

    // Logo dosyasını sil
    await this.deleteOldLogo(restaurant.logoPath);

    // Son olarak restoranı sil
    await this.em.removeAndFlush(restaurant);

    return deleteResult;
  }

  /**
   * Restoran detayını getir
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @returns Restoran detayı
   */
  async getRestaurantById(userId: number, restaurantId: number): Promise<RestaurantResponseDto> {
    // Restoranı bul
    const restaurant = await this.restaurantRepository.findOne(
      { id: restaurantId },
      { populate: ['owner'] }
    );

    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Sahiplik kontrolü
    if (restaurant.owner.id !== userId) {
      throw new ForbiddenException('Bu restorana erişim yetkiniz yok');
    }

    return this.mapToResponseDto(restaurant);
  }

  /**
   * Restaurant entity'sini response DTO'ya dönüştür
   * @param restaurant Restaurant entity
   * @returns Restaurant response DTO
   */
  private mapToResponseDto(restaurant: Restaurant): RestaurantResponseDto {
    const baseUrl = process.env.BASE_URL || 'qrenu.com';
    const qrUrl = `https://${restaurant.subdomain}.${baseUrl}`;

    return {
      id: restaurant.id,
      name: restaurant.name,
      subdomain: restaurant.subdomain,
      qrUrl,
      description: restaurant.description,
      welcomeMessage: restaurant.welcomeMessage,
      websiteUrl: restaurant.websiteUrl,
      instagramUrl: restaurant.instagramUrl,
      facebookUrl: restaurant.facebookUrl,
      twitterUrl: restaurant.twitterUrl,
      linkedinUrl: restaurant.linkedinUrl,
      youtubeUrl: restaurant.youtubeUrl,
      tiktokUrl: restaurant.tiktokUrl,
      logoPath: restaurant.logoPath,
      ownerId: restaurant.owner.id,
      isActive: restaurant.isActive,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    };
  }

  /**
   * Restoran detayını getir (herkese açık)
   * @param restaurantId Restoran ID
   * @returns Restoran detayı
   */
  async getRestaurantByIdPublic(restaurantId: number): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepository.findOne({ id: restaurantId });

    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    return this.mapToResponseDto(restaurant);
  }

  /**
   * Subdomain'e göre restoran detayını kategoriler ve ürünler ile birlikte getir (Herkese Açık)
   * 
   * Bu metod subdomain'e göre restoranın tüm herkese açık verilerini getirir.
   * Kategoriler ve her kategorinin ürünleri dahil edilir.
   * QR kod okutulduğunda müşteriler için kullanılır.
   * 
   * @param subdomain Restoran subdomain'i
   * @returns Restoran detayı kategoriler ve ürünler ile birlikte
   * 
   * @throws {NotFoundException} Restoran bulunamadığında
   * 
   * @example
   * ```typescript
   * const restaurant = await restaurantService.getRestaurantBySubdomain('lezzet-duragi');
   * // Dönen veri restoranın tüm bilgilerini, kategorilerini ve ürünlerini içerir
   * ```
   */
  async getRestaurantBySubdomain(subdomain: string): Promise<RestaurantWithMenuDto> {
    // Subdomain'i normalize et (küçük harfe çevir)
    const normalizedSubdomain = subdomain.toLowerCase();

    const restaurant = await this.restaurantRepository.findOne(
      { subdomain: normalizedSubdomain },
      { populate: ['owner'] }
    );

    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Restoran aktif mi kontrol et
    if (!restaurant.isActive) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Kategorileri ve ürünleri çek
    const categories = await this.categoryRepository.find(
      { 
        restaurant: restaurant.id,
        isActive: true,
      },
      { 
        orderBy: { sortOrder: 'ASC', createdAt: 'ASC' },
        populate: ['products']
      }
    );

    const baseUrl = process.env.BASE_URL || 'qrenu.com';
    const qrUrl = `https://${restaurant.subdomain}.${baseUrl}`;

    // Kategorileri ve ürünleri DTO'ya dönüştür
    const categoriesWithProducts: CategoryInMenuDto[] = categories.map(category => {
      const activeProducts = category.products.getItems()
        .filter(product => product.isActive && product.isInStock)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const products: ProductInMenuDto[] = activeProducts.map(product => 
        this.mapProductToMenuDto(product)
      );

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        imagePath: category.imagePath,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        products,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    });

    return {
      id: restaurant.id,
      name: restaurant.name,
      subdomain: restaurant.subdomain,
      qrUrl,
      description: restaurant.description,
      welcomeMessage: restaurant.welcomeMessage,
      websiteUrl: restaurant.websiteUrl,
      instagramUrl: restaurant.instagramUrl,
      facebookUrl: restaurant.facebookUrl,
      twitterUrl: restaurant.twitterUrl,
      linkedinUrl: restaurant.linkedinUrl,
      youtubeUrl: restaurant.youtubeUrl,
      tiktokUrl: restaurant.tiktokUrl,
      logoPath: restaurant.logoPath,
      isActive: restaurant.isActive,
      categories: categoriesWithProducts,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    };
  }

  /**
   * Product entity'sini menü DTO'ya dönüştür
   * @param product Product entity
   * @returns Product in menu DTO
   */
  private mapProductToMenuDto(product: Product): ProductInMenuDto {
    const formattedPrice = `${product.price.toFixed(2)} ${product.currency}`;
    const formattedDiscountedPrice = product.discountedPrice 
      ? `${product.discountedPrice.toFixed(2)} ${product.currency}` 
      : undefined;
    const discountPercentage = product.discountedPrice 
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : undefined;
    const isOnSale = !!product.discountedPrice;
    const isAvailable = product.isActive && product.isInStock;

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
      formattedPrice,
      formattedDiscountedPrice,
      discountPercentage,
      isOnSale,
      isAvailable,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Eski logo dosyasını sil
   * @param logoPath Silinecek logo dosya yolu
   */
  private async deleteOldLogo(logoPath: string | undefined): Promise<void> {
    if (logoPath) {
      try {
        await this.fileUploadService.deleteFile(logoPath);
      } catch (error) {
        console.warn('Eski logo silinemedi:', error.message);
      }
    }
  }
}
