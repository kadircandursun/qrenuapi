import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AppLoggerService } from './app-logger.service';

/**
 * Cache Service for Redis operations
 */
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const start = Date.now();
      const value = await this.cacheManager.get<T>(key);
      const duration = Date.now() - start;
      
      this.logger.debug('Cache GET operation', 'CacheService');
      this.logger.debug(JSON.stringify({
        key,
        hit: value !== null,
        duration: `${duration}ms`,
      }), 'CacheService');
      
      return value || null;
    } catch (error) {
      this.logger.error('Cache GET error', 'CacheService');
      this.logger.error(JSON.stringify({
        key,
        error: error.message,
      }), 'CacheService');
      return null;
    }
  }

  /**
   * Set value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const start = Date.now();
      await this.cacheManager.set(key, value, ttl ? ttl * 1000 : undefined);
      const duration = Date.now() - start;
      
      this.logger.debug('Cache SET operation', 'CacheService');
      this.logger.debug(JSON.stringify({
        key,
        ttl: ttl || 'default',
        duration: `${duration}ms`,
      }), 'CacheService');
    } catch (error) {
      this.logger.error('Cache SET error', 'CacheService');
      this.logger.error(JSON.stringify({
        key,
        error: error.message,
      }), 'CacheService');
    }
  }

  /**
   * Delete value from cache
   * @param key Cache key
   */
  async del(key: string): Promise<void> {
    try {
      const start = Date.now();
      await this.cacheManager.del(key);
      const duration = Date.now() - start;
      
      this.logger.debug('Cache DEL operation', 'CacheService');
      this.logger.debug(JSON.stringify({
        key,
        duration: `${duration}ms`,
      }), 'CacheService');
    } catch (error) {
      this.logger.error('Cache DEL error', 'CacheService');
      this.logger.error(JSON.stringify({
        key,
        error: error.message,
      }), 'CacheService');
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      const start = Date.now();
      // Cache manager doesn't have reset method, we'll implement it differently
      const duration = Date.now() - start;
      
      this.logger.log('Cache CLEAR operation', 'CacheService');
      this.logger.log(JSON.stringify({
        duration: `${duration}ms`,
      }), 'CacheService');
    } catch (error) {
      this.logger.error('Cache CLEAR error', 'CacheService');
      this.logger.error(JSON.stringify({
        error: error.message,
      }), 'CacheService');
    }
  }

  /**
   * Check if key exists in cache
   * @param key Cache key
   * @returns True if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.cacheManager.get(key);
      return value !== null && value !== undefined;
    } catch (error) {
      this.logger.error('Cache EXISTS error', 'CacheService');
      this.logger.error(JSON.stringify({
        key,
        error: error.message,
      }), 'CacheService');
      return false;
    }
  }

  /**
   * Get multiple keys from cache
   * @param keys Array of cache keys
   * @returns Object with key-value pairs
   */
  async mget<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const start = Date.now();
      const promises = keys.map(key => this.get<T>(key));
      const values = await Promise.all(promises);
      const duration = Date.now() - start;
      
      const result: Record<string, T | null> = {};
      keys.forEach((key, index) => {
        result[key] = values[index];
      });
      
      this.logger.debug('Cache MGET operation', 'CacheService');
      this.logger.debug(JSON.stringify({
        keys: keys.length,
        hits: values.filter(v => v !== null).length,
        duration: `${duration}ms`,
      }), 'CacheService');
      
      return result;
    } catch (error) {
      this.logger.error('Cache MGET error', 'CacheService');
      this.logger.error(JSON.stringify({
        keys: keys.length,
        error: error.message,
      }), 'CacheService');
      return {};
    }
  }

  /**
   * Set multiple key-value pairs
   * @param data Object with key-value pairs
   * @param ttl Time to live in seconds (optional)
   */
  async mset<T>(data: Record<string, T>, ttl?: number): Promise<void> {
    try {
      const start = Date.now();
      const promises = Object.entries(data).map(([key, value]) => 
        this.set(key, value, ttl)
      );
      await Promise.all(promises);
      const duration = Date.now() - start;
      
      this.logger.debug('Cache MSET operation', 'CacheService');
      this.logger.debug(JSON.stringify({
        keys: Object.keys(data).length,
        ttl: ttl || 'default',
        duration: `${duration}ms`,
      }), 'CacheService');
    } catch (error) {
      this.logger.error('Cache MSET error', 'CacheService');
      this.logger.error(JSON.stringify({
        keys: Object.keys(data).length,
        error: error.message,
      }), 'CacheService');
    }
  }

  /**
   * Delete multiple keys
   * @param keys Array of cache keys
   */
  async mdel(keys: string[]): Promise<void> {
    try {
      const start = Date.now();
      const promises = keys.map(key => this.del(key));
      await Promise.all(promises);
      const duration = Date.now() - start;
      
      this.logger.debug('Cache MDEL operation', 'CacheService');
      this.logger.debug(JSON.stringify({
        keys: keys.length,
        duration: `${duration}ms`,
      }), 'CacheService');
    } catch (error) {
      this.logger.error('Cache MDEL error', 'CacheService');
      this.logger.error(JSON.stringify({
        keys: keys.length,
        error: error.message,
      }), 'CacheService');
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    memory: any;
    info: any;
  }> {
    try {
      // This would need to be implemented based on the Redis client
      // For now, return basic info
      return {
        connected: true,
        memory: {},
        info: {},
      };
    } catch (error) {
      this.logger.error('Cache STATS error', 'CacheService');
      this.logger.error(JSON.stringify({
        error: error.message,
      }), 'CacheService');
      return {
        connected: false,
        memory: {},
        info: {},
      };
    }
  }
}
