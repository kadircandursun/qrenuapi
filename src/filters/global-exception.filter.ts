import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService } from '../services/app-logger.service';

/**
 * Global Exception Filter
 * Catches and logs all unhandled exceptions
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
      } else {
        message = exceptionResponse as string;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Extract user ID from JWT token if available
    const userId = (request as any).user?.userId;

    // Log the exception
    this.logger.error('Unhandled exception', 'GlobalExceptionFilter');
    this.logger.error(JSON.stringify({
      method: request.method,
      url: request.url,
      statusCode: status,
      message,
      error,
      stack: exception instanceof Error ? exception.stack : undefined,
      userId,
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      timestamp: new Date().toISOString(),
    }), 'GlobalExceptionFilter');

    // Send error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    });
  }
}
