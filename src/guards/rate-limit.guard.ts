import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private requests = new Map<string, { count: number; resetTime: number }>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

    const userRequests = this.requests.get(ip);
    
    if (!userRequests || now > userRequests.resetTime) {
      // Yeni pencere başlat
      this.requests.set(ip, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userRequests.count >= maxRequests) {
      // Limit aşıldı
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    // İsteği say
    userRequests.count++;
    return true;
  }
}
