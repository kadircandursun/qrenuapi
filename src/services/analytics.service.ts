import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { QrScanAnalytics } from '../entities/qr-scan-analytics.entity';
import { FavoriteAnalytics } from '../entities/favorite-analytics.entity';
import { SessionAnalytics } from '../entities/session-analytics.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';
import { PackageService } from './package.service';

/**
 * Analytics Service for managing restaurant analytics
 */
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(QrScanAnalytics)
    private readonly qrScanRepository: EntityRepository<QrScanAnalytics>,
    @InjectRepository(FavoriteAnalytics)
    private readonly favoriteRepository: EntityRepository<FavoriteAnalytics>,
    @InjectRepository(SessionAnalytics)
    private readonly sessionRepository: EntityRepository<SessionAnalytics>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: EntityRepository<Restaurant>,
    @InjectRepository(Category)
    private readonly categoryRepository: EntityRepository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: EntityRepository<Product>,
    private readonly em: EntityManager,
    private readonly authService: AuthService,
    private readonly packageService: PackageService,
  ) {}

  /**
   * Free paket kontrolü - Free paket kullanıcıları analytics kullanamaz
   * @param userId Kullanıcı ID
   * @throws ForbiddenException eğer Free paket kullanıcısıysa
   */
  private async checkPackageForAnalytics(userId: number): Promise<void> {
    const user = await this.authService.getProfile(userId);
    
    // User entity'sini tam olarak almak için repository'den çekelim
    const userEntity = await this.em.findOne(User, { id: userId }, { populate: ['package'] });
    
    if (!userEntity || !userEntity.package) {
      throw new ForbiddenException('Paket bilgisi bulunamadı');
    }

    // Free paket kontrolü
    if (userEntity.package.name === 'Free Package') {
      throw new ForbiddenException('Analytics özelliği sadece Basic ve Premium paketlerde mevcuttur');
    }
  }

  /**
   * QR kod tarama kaydı oluştur
   * @param restaurantId Restoran ID
   * @param scanData Tarama verileri
   * @returns Oluşturulan tarama kaydı
   */
  async recordQrScan(restaurantId: number, scanData: {
    uid: string;
    ipAddress: string;
    userAgent?: string;
    country?: string;
    city?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    referrer?: string;
  }): Promise<QrScanAnalytics> {
    const restaurant = await this.restaurantRepository.findOne({ id: restaurantId });
    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Mevcut tarama kaydını kontrol et (aynı UID ve restoran için)
    const existingScan = await this.qrScanRepository.findOne({
      restaurant: restaurantId,
      uid: scanData.uid,
    });

    if (existingScan) {
      // Mevcut kaydı güncelle
      existingScan.scanCount += 1;
      existingScan.updatedAt = new Date();
      await this.em.persistAndFlush(existingScan);
      return existingScan;
    }

    // Yeni tarama kaydı oluştur
    const qrScan = this.qrScanRepository.create({
      restaurant,
      ...scanData,
      scanCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(qrScan);
    return qrScan;
  }

  /**
   * Favori işlemi kaydı oluştur
   * Kullanıcı sadece kategoriye girebilir veya ürün detayına girmeden de favori ekleyebilir
   * @param restaurantId Restoran ID
   * @param favoriteData Favori verileri (categoryId ve productId opsiyonel)
   * @returns Oluşturulan favori kaydı
   */
  async recordFavoriteAction(restaurantId: number, favoriteData: {
    uid: string;
    action: 'add' | 'remove' | 'view';
    categoryId?: number;
    productId?: number;
    ipAddress: string;
    userAgent?: string;
    country?: string;
    city?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  }): Promise<FavoriteAnalytics> {
    const restaurant = await this.restaurantRepository.findOne({ id: restaurantId });
    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    let category: Category | undefined;
    let product: Product | undefined;

    if (favoriteData.categoryId) {
      const foundCategory = await this.categoryRepository.findOne({ 
        id: favoriteData.categoryId,
        restaurant: restaurantId 
      });
      if (!foundCategory) {
        throw new NotFoundException('Kategori bulunamadı');
      }
      category = foundCategory;
    }

    if (favoriteData.productId) {
      const foundProduct = await this.productRepository.findOne({ 
        id: favoriteData.productId,
        category: favoriteData.categoryId 
      });
      if (!foundProduct) {
        throw new NotFoundException('Ürün bulunamadı');
      }
      product = foundProduct;
    }

    const favorite = this.favoriteRepository.create({
      restaurant,
      category,
      product,
      uid: favoriteData.uid,
      action: favoriteData.action,
      ipAddress: favoriteData.ipAddress,
      userAgent: favoriteData.userAgent,
      country: favoriteData.country,
      city: favoriteData.city,
      deviceType: favoriteData.deviceType,
      browser: favoriteData.browser,
      os: favoriteData.os,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(favorite);
    return favorite;
  }

  /**
   * Oturum kaydı oluştur veya güncelle
   * @param restaurantId Restoran ID
   * @param sessionData Oturum verileri
   * @returns Oluşturulan veya güncellenen oturum kaydı
   */
  async recordSession(restaurantId: number, sessionData: {
    uid: string;
    sessionId: string;
    ipAddress: string;
    userAgent?: string;
    country?: string;
    city?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    referrer?: string;
    duration?: number;
  }): Promise<SessionAnalytics> {
    const restaurant = await this.restaurantRepository.findOne({ id: restaurantId });
    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Mevcut oturum kaydını kontrol et
    let session = await this.sessionRepository.findOne({
      restaurant: restaurantId,
      uid: sessionData.uid,
      sessionId: sessionData.sessionId,
      isActive: true,
    });

    if (session) {
      // Mevcut oturumu güncelle
      session.updateActivity(sessionData.duration || 0);
      await this.em.persistAndFlush(session);
      return session;
    }

    // Yeni oturum kaydı oluştur
    session = this.sessionRepository.create({
      restaurant,
      uid: sessionData.uid,
      sessionId: sessionData.sessionId,
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      country: sessionData.country,
      city: sessionData.city,
      deviceType: sessionData.deviceType,
      browser: sessionData.browser,
      os: sessionData.os,
      referrer: sessionData.referrer,
      pageViews: 1,
      totalDuration: sessionData.duration || 0,
      lastActivityAt: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(session);
    return session;
  }

  /**
   * Restoran istatistiklerini getir
   * @param userId Kullanıcı ID
   * @param restaurantId Restoran ID
   * @param period Dönem (7d, 30d, 90d, 1y)
   * @returns Restoran istatistikleri
   */
  async getRestaurantAnalytics(
    userId: number,
    restaurantId: number,
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<any> {
    // Email doğrulama kontrolü
    await this.authService.checkEmailVerification(userId);

    // Free paket kontrolü
    await this.checkPackageForAnalytics(userId);

    // Restoran sahiplik kontrolü
    const restaurant = await this.restaurantRepository.findOne({ id: restaurantId });
    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Sahiplik kontrolü
    if (restaurant.owner.id !== userId) {
      throw new ForbiddenException('Bu restorana erişim yetkiniz yok');
    }

    const startDate = this.getStartDate(period);

    // QR tarama istatistikleri
    const qrScans = await this.qrScanRepository.find({
      restaurant: restaurantId,
      createdAt: { $gte: startDate },
    });

    // Favori istatistikleri
    const favorites = await this.favoriteRepository.find({
      restaurant: restaurantId,
      createdAt: { $gte: startDate },
    });

    // Oturum istatistikleri
    const sessions = await this.sessionRepository.find({
      restaurant: restaurantId,
      createdAt: { $gte: startDate },
    });

    return {
      period,
      startDate,
      endDate: new Date(),
      qrScans: {
        total: qrScans.length,
        uniqueUsers: new Set(qrScans.map(scan => scan.uid)).size,
        hourlyDistribution: this.getHourlyDistribution(qrScans),
        dailyDistribution: this.getDailyDistribution(qrScans),
        deviceTypes: this.getDeviceTypeDistribution(qrScans),
        countries: this.getCountryDistribution(qrScans),
      },
      favorites: {
        total: favorites.length,
        uniqueUsers: new Set(favorites.map(fav => fav.uid)).size,
        actions: this.getActionDistribution(favorites),
        topCategories: await this.getTopCategories(favorites),
        topProducts: await this.getTopProducts(favorites),
      },
      sessions: {
        total: sessions.length,
        uniqueUsers: new Set(sessions.map(session => session.uid)).size,
        averageDuration: this.getAverageSessionDuration(sessions),
        totalDuration: sessions.reduce((sum, session) => sum + session.totalDuration, 0),
        activeSessions: sessions.filter(session => session.isActive).length,
      },
    };
  }

  /**
   * Dönem başlangıç tarihini hesapla
   * @param period Dönem
   * @returns Başlangıç tarihi
   */
  private getStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Saatlik dağılımı hesapla
   * @param scans Tarama kayıtları
   * @returns Saatlik dağılım
   */
  private getHourlyDistribution(scans: QrScanAnalytics[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (let hour = 0; hour < 24; hour++) {
      distribution[hour.toString()] = 0;
    }
    
    scans.forEach(scan => {
      const hour = scan.getScanHour().toString();
      distribution[hour] = (distribution[hour] || 0) + scan.scanCount;
    });

    return distribution;
  }

  /**
   * Günlük dağılımı hesapla
   * @param scans Tarama kayıtları
   * @returns Günlük dağılım
   */
  private getDailyDistribution(scans: QrScanAnalytics[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    
    days.forEach(day => {
      distribution[day] = 0;
    });
    
    scans.forEach(scan => {
      const dayIndex = scan.getScanDayOfWeek();
      const dayName = days[dayIndex];
      distribution[dayName] = (distribution[dayName] || 0) + scan.scanCount;
    });

    return distribution;
  }

  /**
   * Cihaz türü dağılımı hesapla
   * @param scans Tarama kayıtları
   * @returns Cihaz türü dağılımı
   */
  private getDeviceTypeDistribution(scans: QrScanAnalytics[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    scans.forEach(scan => {
      const deviceType = scan.deviceType || 'unknown';
      distribution[deviceType] = (distribution[deviceType] || 0) + scan.scanCount;
    });

    return distribution;
  }

  /**
   * Ülke dağılımı hesapla
   * @param scans Tarama kayıtları
   * @returns Ülke dağılımı
   */
  private getCountryDistribution(scans: QrScanAnalytics[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    scans.forEach(scan => {
      const country = scan.country || 'unknown';
      distribution[country] = (distribution[country] || 0) + scan.scanCount;
    });

    return distribution;
  }

  /**
   * Aksiyon dağılımı hesapla
   * @param favorites Favori kayıtları
   * @returns Aksiyon dağılımı
   */
  private getActionDistribution(favorites: FavoriteAnalytics[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    favorites.forEach(favorite => {
      const action = favorite.action;
      distribution[action] = (distribution[action] || 0) + 1;
    });

    return distribution;
  }

  /**
   * En popüler kategorileri getir
   * @param favorites Favori kayıtları
   * @returns En popüler kategoriler
   */
  private async getTopCategories(favorites: FavoriteAnalytics[]): Promise<any[]> {
    const categoryCounts: Record<number, number> = {};
    
    favorites.forEach(favorite => {
      if (favorite.category) {
        const categoryId = favorite.category.id;
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      }
    });

    const topCategoryIds = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([id]) => parseInt(id));

    const categories = await this.categoryRepository.find({
      id: { $in: topCategoryIds },
    });

    return categories.map(category => ({
      id: category.id,
      name: category.name,
      count: categoryCounts[category.id] || 0,
    }));
  }

  /**
   * En popüler ürünleri getir
   * @param favorites Favori kayıtları
   * @returns En popüler ürünler
   */
  private async getTopProducts(favorites: FavoriteAnalytics[]): Promise<any[]> {
    const productCounts: Record<number, number> = {};
    
    favorites.forEach(favorite => {
      if (favorite.product) {
        const productId = favorite.product.id;
        productCounts[productId] = (productCounts[productId] || 0) + 1;
      }
    });

    const topProductIds = Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([id]) => parseInt(id));

    const products = await this.productRepository.find({
      id: { $in: topProductIds },
    });

    return products.map(product => ({
      id: product.id,
      name: product.name,
      count: productCounts[product.id] || 0,
    }));
  }

  /**
   * Ortalama oturum süresini hesapla
   * @param sessions Oturum kayıtları
   * @returns Ortalama süre (dakika)
   */
  private getAverageSessionDuration(sessions: SessionAnalytics[]): number {
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce((sum, session) => sum + session.totalDuration, 0);
    return Math.round(totalDuration / sessions.length / 60); // Dakika cinsinden
  }
}
