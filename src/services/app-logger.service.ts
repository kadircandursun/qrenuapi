import { Injectable, LoggerService } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * Custom Logger Service for application logging
 */
@Injectable()
export class AppLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Log info message
   * @param message Log message
   * @param context Optional context
   */
  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  /**
   * Log error message
   * @param message Error message
   * @param trace Optional stack trace
   * @param context Optional context
   */
  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  /**
   * Log warning message
   * @param message Warning message
   * @param context Optional context
   */
  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  /**
   * Log debug message
   * @param message Debug message
   * @param context Optional context
   */
  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  /**
   * Log verbose message
   * @param message Verbose message
   * @param context Optional context
   */
  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }

  /**
   * Log authentication events
   * @param event Authentication event
   * @param data Event data
   */
  logAuth(event: string, data: any): void {
    this.logger.info(`AUTH: ${event}`, { context: 'AuthService', ...data });
  }

  /**
   * Log API requests
   * @param method HTTP method
   * @param url Request URL
   * @param statusCode Response status code
   * @param duration Request duration in ms
   * @param userId Optional user ID
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: number,
  ): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    const logData = {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userId,
      timestamp: new Date().toISOString(),
    };
    this.logger[level](`API Request: ${method} ${url}`, { context: 'RequestLogger', ...logData });
  }

  /**
   * Log database operations
   * @param operation Database operation
   * @param table Table name
   * @param duration Operation duration in ms
   * @param recordCount Number of records affected
   */
  logDatabase(
    operation: string,
    table: string,
    duration: number,
    recordCount?: number,
  ): void {
    const logData = {
      operation,
      table,
      duration: `${duration}ms`,
      recordCount,
      timestamp: new Date().toISOString(),
    };
    this.logger.debug('Database Operation', { context: 'DatabaseLogger', ...logData });
  }

  /**
   * Log analytics events
   * @param event Analytics event
   * @param restaurantId Restaurant ID
   * @param data Event data
   */
  logAnalytics(event: string, restaurantId: number, data: any): void {
    const logData = {
      restaurantId,
      ...data,
      timestamp: new Date().toISOString(),
    };
    this.logger.info(`ANALYTICS: ${event}`, { context: 'AnalyticsService', ...logData });
  }

  /**
   * Log security events
   * @param event Security event
   * @param data Event data
   */
  logSecurity(event: string, data: any): void {
    const logData = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    this.logger.warn(`SECURITY: ${event}`, { context: 'SecurityLogger', ...logData });
  }

  /**
   * Log business events
   * @param event Business event
   * @param data Event data
   */
  logBusiness(event: string, data: any): void {
    const logData = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    this.logger.info(`BUSINESS: ${event}`, { context: 'BusinessLogger', ...logData });
  }
}
