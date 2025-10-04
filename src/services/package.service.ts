import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Package } from '../entities/package.entity';
import { CreatePackageDto } from '../dto/create-package.dto';
import { PackageResponseDto } from '../dto/package-response.dto';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: EntityRepository<Package>,
    private readonly em: EntityManager,
  ) {}

  /**
   * Tüm paketleri listele
   * @returns Aktif paketler
   */
  async getAllPackages(): Promise<PackageResponseDto[]> {
    const packages = await this.packageRepository.find(
      { isActive: true },
      { orderBy: { isDefault: 'DESC', price: 'ASC' } }
    );

    return packages.map(pkg => this.mapToResponseDto(pkg));
  }

  /**
   * Paket detayını getir
   * @param id Paket ID
   * @returns Paket detayı
   */
  async getPackageById(id: number): Promise<PackageResponseDto> {
    const pkg = await this.packageRepository.findOne({ id });

    if (!pkg) {
      throw new NotFoundException('Paket bulunamadı');
    }

    return this.mapToResponseDto(pkg);
  }

  /**
   * Varsayılan paketi getir
   * @returns Varsayılan paket
   */
  async getDefaultPackage(): Promise<Package> {
    let defaultPackage = await this.packageRepository.findOne({ 
      isDefault: true, 
      isActive: true 
    });

    if (!defaultPackage) {
      // Varsayılan paket yoksa oluştur
      defaultPackage = await this.createDefaultPackage();
    }

    return defaultPackage;
  }

  /**
   * Varsayılan paketi oluştur
   * @returns Oluşturulan varsayılan paket
   */
  private async createDefaultPackage(): Promise<Package> {
    const defaultPackage = this.packageRepository.create({
      name: 'Free Paket',
      description: 'Küçük işletmeler için ücretsiz paket',
      maxRestaurants: 1,
      maxCategoriesPerRestaurant: 5,
      maxProductsPerCategory: 20,
      price: null,
      currency: 'TRY',
      durationInDays: 999999, // Sadece süre sınırsız
      isActive: true,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(defaultPackage);
    return defaultPackage;
  }

  /**
   * Yeni paket oluştur
   * @param createPackageDto Paket bilgileri
   * @returns Oluşturulan paket
   */
  async createPackage(createPackageDto: CreatePackageDto): Promise<PackageResponseDto> {
    // Eğer varsayılan paket olarak işaretleniyorsa, diğer varsayılan paketleri kaldır
    if (createPackageDto.isDefault) {
      await this.removeDefaultFlag();
    }

    const pkg = this.packageRepository.create({
      ...createPackageDto,
      currency: createPackageDto.currency || 'TRY',
      durationInDays: createPackageDto.durationInDays || 30,
      isDefault: createPackageDto.isDefault || false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(pkg);

    return this.mapToResponseDto(pkg);
  }

  /**
   * Paket güncelle
   * @param id Paket ID
   * @param updateData Güncellenecek bilgiler
   * @returns Güncellenen paket
   */
  async updatePackage(id: number, updateData: Partial<CreatePackageDto>): Promise<PackageResponseDto> {
    const pkg = await this.packageRepository.findOne({ id });

    if (!pkg) {
      throw new NotFoundException('Paket bulunamadı');
    }

    // Eğer varsayılan paket olarak işaretleniyorsa, diğer varsayılan paketleri kaldır
    if (updateData.isDefault) {
      await this.removeDefaultFlag();
    }

    Object.assign(pkg, updateData);
    pkg.updatedAt = new Date();

    await this.em.persistAndFlush(pkg);

    return this.mapToResponseDto(pkg);
  }

  /**
   * Paket sil
   * @param id Paket ID
   */
  async deletePackage(id: number): Promise<void> {
    const pkg = await this.packageRepository.findOne({ id });

    if (!pkg) {
      throw new NotFoundException('Paket bulunamadı');
    }

    // Varsayılan paket silinemez
    if (pkg.isDefault) {
      throw new BadRequestException('Varsayılan paket silinemez');
    }

    // Paketi kullanan kullanıcılar var mı kontrol et
    const userCount = await pkg.users.loadCount();
    if (userCount > 0) {
      throw new BadRequestException('Bu paketi kullanan kullanıcılar bulunduğu için silinemez');
    }

    await this.em.removeAndFlush(pkg);
  }

  /**
   * Basic paketi oluştur
   * @returns Oluşturulan basic paket
   */
  async createBasicPackage(): Promise<PackageResponseDto> {
    const basicPackage = this.packageRepository.create({
      name: 'Basic Paket',
      description: 'Tek restoran için sınırsız kategori ve ürün - 1 yıl geçerli',
      maxRestaurants: 1, // Sadece 1 restoran
      maxCategoriesPerRestaurant: 999999, // Sınırsız kategori
      maxProductsPerCategory: 999999, // Sınırsız ürün
      price: 1200.00, // 1 yıllık basic fiyat
      currency: 'TRY',
      durationInDays: 365, // 1 yıl
      isActive: true,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(basicPackage);
    return this.mapToResponseDto(basicPackage);
  }

  /**
   * Premium paketi oluştur
   * @returns Oluşturulan premium paket
   */
  async createPremiumPackage(): Promise<PackageResponseDto> {
    const premiumPackage = this.packageRepository.create({
      name: 'Premium Paket',
      description: 'Sınırsız kullanım için premium paket - 1 yıl geçerli',
      maxRestaurants: 999999, // Sınırsız
      maxCategoriesPerRestaurant: 999999, // Sınırsız
      maxProductsPerCategory: 999999, // Sınırsız
      price: 4000.00, // 1 yıllık premium fiyat
      currency: 'TRY',
      durationInDays: 365, // 1 yıl
      isActive: true,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(premiumPackage);
    return this.mapToResponseDto(premiumPackage);
  }

  /**
   * Varsayılan paket bayrağını kaldır
   */
  private async removeDefaultFlag(): Promise<void> {
    const defaultPackages = await this.packageRepository.find({ isDefault: true });
    for (const pkg of defaultPackages) {
      pkg.isDefault = false;
      await this.em.persist(pkg);
    }
    await this.em.flush();
  }

  /**
   * Package entity'sini response DTO'ya dönüştür
   * @param pkg Package entity
   * @returns Package response DTO
   */
  private mapToResponseDto(pkg: Package): PackageResponseDto {
    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      maxRestaurants: pkg.maxRestaurants,
      maxCategoriesPerRestaurant: pkg.maxCategoriesPerRestaurant,
      maxProductsPerCategory: pkg.maxProductsPerCategory,
      price: pkg.price,
      currency: pkg.currency,
      durationInDays: pkg.durationInDays,
      isActive: pkg.isActive,
      isDefault: pkg.isDefault,
      formattedPrice: pkg.getFormattedPrice(),
      features: pkg.getFeatures(),
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
    };
  }
}
