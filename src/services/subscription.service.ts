import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { Package } from '../entities/package.entity';
import { UpgradePackageDto } from '../dto/upgrade-package.dto';
import { SubscriptionResponseDto, PackageInfoDto } from '../dto/subscription-response.dto';
import { AuthService } from './auth.service';

/**
 * Subscription service for managing user package upgrades
 */
@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Package)
    private readonly packageRepository: EntityRepository<Package>,
    private readonly em: EntityManager,
    private readonly authService: AuthService,
  ) {}

  /**
   * Kullanıcının paketini yükselt
   * @param userId Kullanıcı ID
   * @param upgradePackageDto Yükseltme bilgileri
   * @returns Yükseltme sonucu
   */
  async upgradePackage(userId: number, upgradePackageDto: UpgradePackageDto): Promise<SubscriptionResponseDto> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    const user = await this.userRepository.findOne(
      { id: userId },
      { populate: ['package'] }
    );

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const newPackage = await this.packageRepository.findOne({ id: upgradePackageDto.packageId });
    if (!newPackage) {
      throw new NotFoundException('Paket bulunamadı');
    }

    if (!newPackage.isActive) {
      throw new BadRequestException('Bu paket aktif değil');
    }

    // Aynı pakete yükseltme yapılamaz
    if (user.package.id === newPackage.id) {
      throw new BadRequestException('Zaten bu paketi kullanıyorsunuz');
    }

    // Premium pakete yükseltme kontrolü
    if (newPackage.name === 'Premium Paket') {
      return await this.upgradeToPremium(user, newPackage);
    }

    // Basic pakete yükseltme kontrolü
    if (newPackage.name === 'Basic Paket') {
      return await this.upgradeToBasic(user, newPackage);
    }

    // Diğer paketlere yükseltme
    return await this.upgradeToOtherPackage(user, newPackage);
  }

  /**
   * Basic pakete yükseltme
   * @param user Kullanıcı
   * @param basicPackage Basic paket
   * @returns Yükseltme sonucu
   */
  private async upgradeToBasic(user: User, basicPackage: Package): Promise<SubscriptionResponseDto> {
    // Basic paket süresi hesapla (1 yıl)
    const now = new Date();
    const expirationDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 yıl

    // Kullanıcının paketini güncelle
    user.package = basicPackage;
    user.packageExpiresAt = expirationDate;
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);

    return {
      success: true,
      message: 'Basic pakete başarıyla yükseltildi!',
      newPackage: {
        id: basicPackage.id,
        name: basicPackage.name,
        description: basicPackage.description,
        maxRestaurants: basicPackage.maxRestaurants,
        maxCategoriesPerRestaurant: basicPackage.maxCategoriesPerRestaurant,
        maxProductsPerCategory: basicPackage.maxProductsPerCategory,
        price: basicPackage.price,
        currency: basicPackage.currency,
        durationInDays: basicPackage.durationInDays,
        isActive: basicPackage.isActive,
        isDefault: basicPackage.isDefault,
        createdAt: basicPackage.createdAt,
        updatedAt: basicPackage.updatedAt,
      },
      expirationDate: expirationDate,
      features: [
        '1 restoran oluşturma',
        'Sınırsız kategori oluşturma',
        'Sınırsız ürün ekleme',
        '1 yıl geçerli',
        'Basic destek',
      ],
    };
  }

  /**
   * Premium pakete yükseltme
   * @param user Kullanıcı
   * @param premiumPackage Premium paket
   * @returns Yükseltme sonucu
   */
  private async upgradeToPremium(user: User, premiumPackage: Package): Promise<SubscriptionResponseDto> {
    // Premium paket süresi hesapla (1 yıl)
    const now = new Date();
    const expirationDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 yıl

    // Kullanıcının paketini güncelle
    user.package = premiumPackage;
    user.packageExpiresAt = expirationDate;
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);

    return {
      success: true,
      message: 'Premium pakete başarıyla yükseltildi!',
      newPackage: {
        id: premiumPackage.id,
        name: premiumPackage.name,
        description: premiumPackage.description,
        maxRestaurants: premiumPackage.maxRestaurants,
        maxCategoriesPerRestaurant: premiumPackage.maxCategoriesPerRestaurant,
        maxProductsPerCategory: premiumPackage.maxProductsPerCategory,
        price: premiumPackage.price,
        currency: premiumPackage.currency,
        durationInDays: premiumPackage.durationInDays,
        isActive: premiumPackage.isActive,
        isDefault: premiumPackage.isDefault,
        createdAt: premiumPackage.createdAt,
        updatedAt: premiumPackage.updatedAt,
      },
      expirationDate: expirationDate,
      features: [
        'Sınırsız restoran oluşturma',
        'Sınırsız kategori oluşturma',
        'Sınırsız ürün ekleme',
        '1 yıl geçerli',
        'Premium destek',
      ],
    };
  }

  /**
   * Diğer paketlere yükseltme
   * @param user Kullanıcı
   * @param newPackage Yeni paket
   * @returns Yükseltme sonucu
   */
  private async upgradeToOtherPackage(user: User, newPackage: Package): Promise<SubscriptionResponseDto> {
    // Paket süresi hesapla
    const now = new Date();
    const expirationDate = new Date(now.getTime() + (newPackage.durationInDays * 24 * 60 * 60 * 1000));

    // Kullanıcının paketini güncelle
    user.package = newPackage;
    user.packageExpiresAt = expirationDate;
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);

    return {
      success: true,
      message: `${newPackage.name} paketine başarıyla yükseltildi!`,
      newPackage: {
        id: newPackage.id,
        name: newPackage.name,
        description: newPackage.description,
        maxRestaurants: newPackage.maxRestaurants,
        maxCategoriesPerRestaurant: newPackage.maxCategoriesPerRestaurant,
        maxProductsPerCategory: newPackage.maxProductsPerCategory,
        price: newPackage.price,
        currency: newPackage.currency,
        durationInDays: newPackage.durationInDays,
        isActive: newPackage.isActive,
        isDefault: newPackage.isDefault,
        createdAt: newPackage.createdAt,
        updatedAt: newPackage.updatedAt,
      },
      expirationDate: expirationDate,
      features: this.getPackageFeatures(newPackage),
    };
  }

  /**
   * Tüm paketleri listele
   * @returns Aktif paketler
   */
  async getAllPackages(): Promise<PackageInfoDto[]> {
    const packages = await this.packageRepository.find(
      { isActive: true },
      { orderBy: { price: 'ASC' } }
    );

    return packages.map(pkg => ({
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
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
    }));
  }

  /**
   * Kullanıcının mevcut aboneliğini getir
   * @param userId Kullanıcı ID
   * @returns Abonelik bilgileri
   */
  async getCurrentSubscription(userId: number): Promise<SubscriptionResponseDto> {
    const user = await this.userRepository.findOne(
      { id: userId },
      { populate: ['package'] }
    );

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const isActive = user.isPackageActive();
    const daysRemaining = user.packageExpiresAt 
      ? Math.ceil((user.packageExpiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : undefined;

    return {
      success: true,
      message: 'Abonelik bilgileri getirildi',
      newPackage: {
        id: user.package.id,
        name: user.package.name,
        description: user.package.description,
        maxRestaurants: user.package.maxRestaurants,
        maxCategoriesPerRestaurant: user.package.maxCategoriesPerRestaurant,
        maxProductsPerCategory: user.package.maxProductsPerCategory,
        price: user.package.price,
        currency: user.package.currency,
        durationInDays: user.package.durationInDays,
        isActive: user.package.isActive,
        isDefault: user.package.isDefault,
        createdAt: user.package.createdAt,
        updatedAt: user.package.updatedAt,
      },
      expirationDate: user.packageExpiresAt,
      isActive: isActive,
      daysRemaining: daysRemaining,
      features: this.getPackageFeatures(user.package),
    };
  }

  /**
   * Paket özelliklerini getir
   * @param pkg Paket
   * @returns Özellik listesi
   */
  private getPackageFeatures(pkg: Package): string[] {
    const features: string[] = [];

    if (pkg.maxRestaurants === 999999) {
      features.push('Sınırsız restoran oluşturma');
    } else {
      features.push(`${pkg.maxRestaurants} restoran oluşturma`);
    }

    if (pkg.maxCategoriesPerRestaurant === 999999) {
      features.push('Sınırsız kategori oluşturma');
    } else {
      features.push(`Restoran başına ${pkg.maxCategoriesPerRestaurant} kategori`);
    }

    if (pkg.maxProductsPerCategory === 999999) {
      features.push('Sınırsız ürün ekleme');
    } else {
      features.push(`Kategori başına ${pkg.maxProductsPerCategory} ürün`);
    }

    if (pkg.durationInDays === 999999) {
      features.push('Sınırsız süre');
    } else {
      features.push(`${pkg.durationInDays} gün geçerli`);
    }

    if (pkg.name === 'Premium Paket') {
      features.push('Premium destek');
    } else if (pkg.name === 'Basic Paket') {
      features.push('Basic destek');
    }

    return features;
  }
}
