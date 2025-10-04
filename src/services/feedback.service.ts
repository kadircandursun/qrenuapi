import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Feedback } from '../entities/feedback.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
import { FeedbackResponseDto } from '../dto/feedback-response.dto';
import { FeedbackStatsDto } from '../dto/feedback-stats.dto';

/**
 * Feedback Service for managing restaurant feedback
 */
@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: EntityRepository<Feedback>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: EntityRepository<Restaurant>,
    private readonly em: EntityManager,
  ) {}

  /**
   * Geri bildirim oluştur
   * @param createFeedbackDto Geri bildirim verileri
   * @returns Oluşturulan geri bildirim
   */
  async createFeedback(createFeedbackDto: CreateFeedbackDto): Promise<FeedbackResponseDto> {
    // Restoran kontrolü
    const restaurant = await this.restaurantRepository.findOne({ id: createFeedbackDto.restaurantId });
    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Geri bildirim oluştur
    const feedback = this.feedbackRepository.create({
      restaurant: createFeedbackDto.restaurantId,
      rating: createFeedbackDto.rating,
      type: createFeedbackDto.type,
      message: createFeedbackDto.message,
      email: createFeedbackDto.email,
      ipAddress: createFeedbackDto.ipAddress,
      userAgent: createFeedbackDto.userAgent,
      country: createFeedbackDto.country,
      city: createFeedbackDto.city,
      deviceType: createFeedbackDto.deviceType,
      browser: createFeedbackDto.browser,
      os: createFeedbackDto.os,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(feedback);

    return this.mapToResponseDto(feedback);
  }

  /**
   * Restoran geri bildirimlerini getir
   * @param restaurantId Restoran ID
   * @param userId Kullanıcı ID (sahiplik kontrolü için)
   * @param page Sayfa numarası
   * @param limit Sayfa başına kayıt sayısı
   * @returns Geri bildirimler
   */
  async getRestaurantFeedbacks(
    restaurantId: number,
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ feedbacks: FeedbackResponseDto[]; total: number; page: number; limit: number }> {
    // Restoran kontrolü ve sahiplik kontrolü
    const restaurant = await this.restaurantRepository.findOne({ id: restaurantId }, { populate: ['owner'] });
    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Sahiplik kontrolü
    if (restaurant.owner.id !== userId) {
      throw new ForbiddenException('Bu restorana erişim yetkiniz yok');
    }

    const offset = (page - 1) * limit;

    const [feedbacks, total] = await this.feedbackRepository.findAndCount(
      { restaurant: restaurantId },
      {
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
      },
    );

    return {
      feedbacks: feedbacks.map(feedback => this.mapToResponseDto(feedback)),
      total,
      page,
      limit,
    };
  }

  /**
   * Restoran geri bildirim istatistiklerini getir
   * @param restaurantId Restoran ID
   * @param userId Kullanıcı ID (sahiplik kontrolü için)
   * @returns Geri bildirim istatistikleri
   */
  async getRestaurantFeedbackStats(restaurantId: number, userId: number): Promise<FeedbackStatsDto> {
    // Restoran kontrolü ve sahiplik kontrolü
    const restaurant = await this.restaurantRepository.findOne({ id: restaurantId }, { populate: ['owner'] });
    if (!restaurant) {
      throw new NotFoundException('Restoran bulunamadı');
    }

    // Sahiplik kontrolü
    if (restaurant.owner.id !== userId) {
      throw new ForbiddenException('Bu restorana erişim yetkiniz yok');
    }

    // Toplam geri bildirim sayısı
    const totalFeedbacks = await this.feedbackRepository.count({ restaurant: restaurantId });

    if (totalFeedbacks === 0) {
      return {
        totalFeedbacks: 0,
        averageRating: 0,
        ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        typeDistribution: { positive: 0, negative: 0, suggestion: 0 },
        last30Days: 0,
        last7Days: 0,
      };
    }

    // Ortalama puan
    const avgResult = await this.em.getConnection().execute(
      'SELECT AVG(rating) as avg_rating FROM feedbacks WHERE restaurant_id = ?',
      [restaurantId],
    );
    const averageRating = parseFloat(avgResult[0]?.avg_rating || '0');

    // Puan dağılımı
    const ratingDistribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    for (let i = 1; i <= 5; i++) {
      const count = await this.feedbackRepository.count({
        restaurant: restaurantId,
        rating: i,
      });
      ratingDistribution[i.toString()] = count;
    }

    // Tür dağılımı
    const typeDistribution: Record<string, number> = { positive: 0, negative: 0, suggestion: 0 };
    const types = ['positive', 'negative', 'suggestion'];
    for (const type of types) {
      const count = await this.feedbackRepository.count({
        restaurant: restaurantId,
        type: type as any,
      });
      typeDistribution[type] = count;
    }

    // Son 30 gün
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30Days = await this.feedbackRepository.count({
      restaurant: restaurantId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Son 7 gün
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = await this.feedbackRepository.count({
      restaurant: restaurantId,
      createdAt: { $gte: sevenDaysAgo },
    });

    return {
      totalFeedbacks,
      averageRating: Math.round(averageRating * 10) / 10, // 1 ondalık basamak
      ratingDistribution,
      typeDistribution,
      last30Days,
      last7Days,
    };
  }

  /**
   * Feedback entity'sini response DTO'ya dönüştür
   * @param feedback Feedback entity
   * @returns Feedback response DTO
   */
  private mapToResponseDto(feedback: Feedback): FeedbackResponseDto {
    return {
      id: feedback.id,
      restaurantId: feedback.restaurant.id,
      rating: feedback.rating,
      type: feedback.type,
      message: feedback.message,
      email: feedback.email,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    };
  }
}
