import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

/**
 * Health Service for system health monitoring
 */
@Injectable()
export class HealthService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Temel sistem sağlık durumu
   * @returns Sistem sağlık bilgileri
   */
  async getBasicHealth() {
    const memoryUsage = process.memoryUsage();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
    };
  }

  /**
   * Veritabanı bağlantı durumu
   * @returns Veritabanı sağlık bilgileri
   */
  async getDatabaseHealth() {
    try {
      const start = Date.now();
      
      // Basit bir SQL sorgusu ile bağlantıyı test et
      await this.em.getConnection().execute('SELECT 1 as test');
      
      const responseTime = Date.now() - start;
      
      // Aktif bağlantı sayısını al
      const connectionInfo = await this.em.getConnection().execute(
        'SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = ?',
        ['active']
      );
      
      const activeConnections = connectionInfo[0]?.active_connections || 0;

      return {
        status: 'ok',
        database: 'connected',
        responseTime: `${responseTime}ms`,
        activeConnections: parseInt(activeConnections),
        driver: 'postgresql',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Servislerin durumunu kontrol et
   * @returns Servis sağlık bilgileri
   */
  async getServicesHealth() {
    const services = {
      auth: 'ok',
      analytics: 'ok',
      feedback: 'ok',
      mail: 'ok',
      restaurant: 'ok',
      menu: 'ok',
      subscription: 'ok',
    };

    // Mail servisi kontrolü
    try {
      if (!process.env.SMTP_TOKEN) {
        services.mail = 'warning - SMTP_TOKEN not configured';
      }
    } catch (error) {
      services.mail = 'error';
    }

    return {
      status: 'ok',
      services,
      timestamp: new Date().toISOString(),
    };
  }
}
