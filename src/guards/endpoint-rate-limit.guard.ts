import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class EndpointRateLimitGuard implements CanActivate {
  private requests = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const endpoint = request.route?.path || request.url;
    const key = `${ip}:${endpoint}`;
    const now = Date.now();

    const userRequests = this.requests.get(key);
    
    if (!userRequests || now > userRequests.resetTime) {
      // Yeni pencere başlat
      this.requests.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (userRequests.count >= this.maxRequests) {
      // Limit aşıldı
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    // İsteği say
    userRequests.count++;
    return true;
  }
}
