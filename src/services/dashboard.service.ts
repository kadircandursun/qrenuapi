import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Restaurant } from '../entities/restaurant.entity';
import { Product } from '../entities/product.entity';
import { QrScanAnalytics } from '../entities/qr-scan-analytics.entity';
import { SessionAnalytics } from '../entities/session-analytics.entity';
import { DashboardOverviewResponseDto, DashboardPerformanceDto, DashboardSummaryDto } from '../dto/dashboard-overview.dto';

/**
 * Dashboard service for providing overview statistics
 */
@Injectable()
export class DashboardService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Get dashboard overview for a user
   * @param userId User ID
   * @returns Dashboard overview data
   */
  async getDashboardOverview(userId: number): Promise<DashboardOverviewResponseDto> {
    try {
      // Get user's restaurants - Manuel filtreleme ile
      const allRestaurants = await this.em.find(Restaurant, {}, {
        populate: ['owner'],
      });
      
      // Manuel filtreleme ile kullanıcının restaurant'larını bul
      const userRestaurants = allRestaurants.filter(r => r.owner.id === userId);
      
      if (userRestaurants.length === 0) {
        return this.getEmptyDashboard();
      }

      const restaurantIds = userRestaurants.map(r => r.id);

      // Get summary metrics
      const summary = await this.getSummaryMetrics(restaurantIds, userRestaurants);

      // Get performance metrics
      const performance = await this.getPerformanceMetrics(restaurantIds, userRestaurants);

      return {
        performance,
        summary,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Dashboard overview error:', error);
      return this.getEmptyDashboard();
    }
  }

  /**
   * Get summary metrics for dashboard
   * @param restaurantIds Array of restaurant IDs
   * @param restaurants Array of restaurant entities
   * @returns Summary metrics
   */
  private async getSummaryMetrics(restaurantIds: number[], restaurants: Restaurant[]): Promise<DashboardSummaryDto> {
    // Total restaurants
    const totalRestaurants = restaurants.length;

    // Active restaurants
    const activeRestaurants = restaurants.filter(r => r.isActive).length;

    // Total products across all restaurants
    const totalProducts = await this.em.count(Product, {
      category: { restaurant: { id: { $in: restaurantIds } } },
    });

    // Total views (QR scans) across all restaurants
    const totalViews = await this.em.count(QrScanAnalytics, {
      restaurant: { id: { $in: restaurantIds } },
    });

    return {
      totalRestaurants,
      totalViews,
      totalProducts,
      activeRestaurants,
    };
  }

  /**
   * Get performance metrics for dashboard
   * @param restaurantIds Array of restaurant IDs
   * @param restaurants Array of restaurant entities
   * @returns Performance metrics
   */
  private async getPerformanceMetrics(restaurantIds: number[], restaurants: Restaurant[]): Promise<DashboardPerformanceDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month views
    const currentMonthViews = await this.em.count(QrScanAnalytics, {
      restaurant: { id: { $in: restaurantIds } },
      createdAt: { $gte: startOfMonth },
    });

    // Last month views
    const lastMonthViews = await this.em.count(QrScanAnalytics, {
      restaurant: { id: { $in: restaurantIds } },
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    // Calculate view increase percentage
    let viewIncreasePercentage = 0;
    if (lastMonthViews > 0) {
      viewIncreasePercentage = Math.round(((currentMonthViews - lastMonthViews) / lastMonthViews) * 100);
    } else if (currentMonthViews > 0) {
      viewIncreasePercentage = 100; // First month with views
    }

    // Average viewing duration from session analytics
    const sessionAnalytics = await this.em.find(SessionAnalytics, {
      restaurant: { id: { $in: restaurantIds } },
      createdAt: { $gte: startOfMonth },
    });

    let averageViewingDuration = 0;
    if (sessionAnalytics.length > 0) {
      const totalDuration = sessionAnalytics.reduce((sum, session) => sum + session.totalDuration, 0);
      const totalSessions = sessionAnalytics.length;
      averageViewingDuration = Math.round((totalDuration / totalSessions / 60) * 10) / 10; // Convert to minutes with 1 decimal
    }

    // Most popular restaurant (by views this month)
    const restaurantViews = await this.em.find(QrScanAnalytics, {
      restaurant: { id: { $in: restaurantIds } },
      createdAt: { $gte: startOfMonth },
    }, {
      populate: ['restaurant'],
    });

    const restaurantViewCounts = new Map<number, number>();
    restaurantViews.forEach(view => {
      const restaurantId = view.restaurant.id;
      restaurantViewCounts.set(restaurantId, (restaurantViewCounts.get(restaurantId) || 0) + 1);
    });

    let mostPopularRestaurant = 'Henüz veri yok';
    if (restaurantViewCounts.size > 0) {
      const mostPopularEntry = Array.from(restaurantViewCounts.entries())
        .reduce((a, b) => {
          const aCount = restaurantViewCounts.get(a[0]) || 0;
          const bCount = restaurantViewCounts.get(b[0]) || 0;
          return aCount > bCount ? a : b;
        });
      
      const mostPopularId = mostPopularEntry[0];
      const mostPopular = restaurants.find(r => r.id === mostPopularId);
      if (mostPopular) {
        mostPopularRestaurant = mostPopular.name;
      }
    }

    return {
      viewIncreasePercentage,
      averageViewingDuration,
      mostPopularRestaurant,
    };
  }

  /**
   * Get empty dashboard for users with no restaurants
   * @returns Empty dashboard data
   */
  private getEmptyDashboard(): DashboardOverviewResponseDto {
    return {
      performance: {
        viewIncreasePercentage: 0,
        averageViewingDuration: 0,
        mostPopularRestaurant: 'Henüz veri yok',
      },
      summary: {
        totalRestaurants: 0,
        totalViews: 0,
        totalProducts: 0,
        activeRestaurants: 0,
      },
      lastUpdated: new Date(),
    };
  }

}
