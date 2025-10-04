import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../services/cache.service';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '../decorators/cache.decorator';

/**
 * Cache Interceptor for automatic caching
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(CACHE_KEY_METADATA, context.getHandler());
    const cacheTtl = this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler());

    if (!cacheKey) {
      return next.handle();
    }

    try {
      // Generate dynamic cache key from method parameters
      const request = context.switchToHttp().getRequest();
      const dynamicKey = this.generateCacheKey(cacheKey, request);

      // Try to get from cache
      const cachedResult = await this.cacheService.get(dynamicKey);
      if (cachedResult) {
        return of(cachedResult);
      }

      // Execute method and cache result
      return next.handle().pipe(
        tap(async (result) => {
          if (result) {
            try {
              await this.cacheService.set(dynamicKey, result, cacheTtl);
            } catch (error) {
              // Cache error shouldn't break the response
              console.warn('Cache set error:', error.message);
            }
          }
        }),
      );
    } catch (error) {
      // If cache fails, continue without cache
      console.warn('Cache interceptor error:', error.message);
      return next.handle();
    }
  }

  /**
   * Generate dynamic cache key from request parameters
   */
  private generateCacheKey(keyPattern: string, request: any): string {
    let key = keyPattern;

    // Replace :id with actual ID from params
    if (request.params?.id) {
      key = key.replace(':id', request.params.id);
    }

    // Replace :restaurantId with actual restaurant ID
    if (request.params?.restaurantId) {
      key = key.replace(':restaurantId', request.params.restaurantId);
    }

    // Replace :categoryId with actual category ID
    if (request.params?.categoryId) {
      key = key.replace(':categoryId', request.params.categoryId);
    }

    // Replace :subdomain with actual subdomain
    if (request.params?.subdomain) {
      key = key.replace(':subdomain', request.params.subdomain);
    }

    // Replace query parameters
    if (request.query) {
      Object.keys(request.query).forEach(param => {
        const value = request.query[param];
        key = key.replace(`:${param}`, value);
      });
    }

    return key;
  }
}
