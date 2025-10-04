import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, { count: number; resetTime: number }>();

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

    const userRequests = this.requests.get(ip);
    
    if (!userRequests || now > userRequests.resetTime) {
      // Yeni pencere başlat
      this.requests.set(ip, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (userRequests.count >= maxRequests) {
      // Limit aşıldı
      res.status(429).json({
        statusCode: 429,
        message: 'Too Many Requests',
        error: 'Too Many Requests',
      });
      return;
    }

    // İsteği say
    userRequests.count++;
    next();
  }
}
