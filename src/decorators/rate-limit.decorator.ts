import { applyDecorators, UseGuards } from '@nestjs/common';
import { EndpointRateLimitGuard } from '../guards/endpoint-rate-limit.guard';

export function RateLimit(maxRequests: number, windowMs: number) {
  return applyDecorators(
    UseGuards(new EndpointRateLimitGuard(maxRequests, windowMs)),
  );
}

export function AuthRateLimit() {
  const maxRequests = parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5');
  const windowMs = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000');
  return applyDecorators(
    UseGuards(new EndpointRateLimitGuard(maxRequests, windowMs)),
  );
}

export function FeedbackRateLimit() {
  const maxRequests = parseInt(process.env.FEEDBACK_RATE_LIMIT_MAX_REQUESTS || '10');
  const windowMs = parseInt(process.env.FEEDBACK_RATE_LIMIT_WINDOW_MS || '86400000');
  return applyDecorators(
    UseGuards(new EndpointRateLimitGuard(maxRequests, windowMs)),
  );
}

export function AnalyticsRateLimit() {
  const maxRequests = parseInt(process.env.ANALYTICS_RATE_LIMIT_MAX_REQUESTS || '100');
  const windowMs = parseInt(process.env.ANALYTICS_RATE_LIMIT_WINDOW_MS || '3600000');
  return applyDecorators(
    UseGuards(new EndpointRateLimitGuard(maxRequests, windowMs)),
  );
}
