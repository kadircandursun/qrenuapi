import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

/**
 * Cache decorator for methods
 * @param key Cache key pattern (can include method parameters)
 * @param ttl Time to live in seconds
 */
export function Cacheable(key: string, ttl: number = 3600) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, key)(target, propertyName, descriptor);
    SetMetadata(CACHE_TTL_METADATA, ttl)(target, propertyName, descriptor);
    return descriptor;
  };
}

/**
 * Cache invalidation decorator
 * @param keys Cache keys to invalidate (can include method parameters)
 */
export function CacheInvalidate(keys: string[]) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    SetMetadata('cache_invalidate', keys)(target, propertyName, descriptor);
    return descriptor;
  };
}

/**
 * Cache key generators for common patterns
 */
export class CacheKeys {
  /**
   * Restaurant cache key
   */
  static restaurant(id: number): string {
    return `restaurant:${id}`;
  }

  /**
   * Restaurant menu cache key
   */
  static restaurantMenu(restaurantId: number): string {
    return `menu:${restaurantId}`;
  }

  /**
   * Category cache key
   */
  static category(id: number): string {
    return `category:${id}`;
  }

  /**
   * Product cache key
   */
  static product(id: number): string {
    return `product:${id}`;
  }

  /**
   * Analytics cache key
   */
  static analytics(restaurantId: number, period: string): string {
    return `analytics:${restaurantId}:${period}`;
  }

  /**
   * Package cache key
   */
  static package(packageName: string): string {
    return `package:${packageName}`;
  }

  /**
   * User session cache key
   */
  static userSession(userId: number): string {
    return `session:${userId}`;
  }

  /**
   * Subdomain check cache key
   */
  static subdomainCheck(subdomain: string): string {
    return `subdomain:check:${subdomain}`;
  }

  /**
   * Feedback stats cache key
   */
  static feedbackStats(restaurantId: number): string {
    return `feedback:stats:${restaurantId}`;
  }

  /**
   * Health check cache key
   */
  static healthCheck(): string {
    return 'health:check';
  }
}
