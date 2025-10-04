import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AppLoggerService } from '../services/app-logger.service';

/**
 * Request Logging Interceptor
 * Logs all HTTP requests and responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const startTime = Date.now();

    // Extract user ID from JWT token if available
    const userId = (request as any).user?.userId;

    // Log request start
    this.logger.debug('Request started', 'LoggingInterceptor');
    this.logger.debug(JSON.stringify({
      method,
      url,
      ip,
      userAgent,
      userId,
    }), 'LoggingInterceptor');

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log successful request
          this.logger.logRequest(method, url, statusCode, duration, userId);

          // Log slow requests as warnings
          if (duration > 2000) {
            this.logger.warn('Slow request detected', 'LoggingInterceptor');
            this.logger.warn(JSON.stringify({
              method,
              url,
              duration: `${duration}ms`,
              userId,
            }), 'LoggingInterceptor');
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Log failed request
          this.logger.logRequest(method, url, statusCode, duration, userId);

          // Log error details
          this.logger.error('Request failed', 'LoggingInterceptor');
          this.logger.error(JSON.stringify({
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            error: error.message,
            stack: error.stack,
            userId,
          }), 'LoggingInterceptor');
        },
      }),
    );
  }
}
