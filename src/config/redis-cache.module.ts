import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Redis Cache Module Configuration
 * Falls back to memory cache if Redis is not available
 */
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        
        // If Redis URL is provided, try to use Redis
        if (redisUrl) {
          try {
            const redisStore = await import('cache-manager-redis-store');
            return {
              store: redisStore.default,
              url: redisUrl,
              ttl: parseInt(configService.get<string>('CACHE_TTL') || '3600'),
              max: parseInt(configService.get<string>('CACHE_MAX_ITEMS') || '1000'),
              isGlobal: true,
            };
          } catch (error) {
            console.warn('Redis not available, falling back to memory cache');
          }
        }
        
        // Fallback to memory cache
        return {
          ttl: parseInt(configService.get<string>('CACHE_TTL') || '3600'),
          max: parseInt(configService.get<string>('CACHE_MAX_ITEMS') || '1000'),
          isGlobal: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
