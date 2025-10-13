import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getRoot(): {
    service: string;
    version: string;
    status: string;
    timestamp: string;
    endpoints: Record<string, string>;
  } {
    return {
      service: 'QRenu API',
      version: '1.0.0',
      status: 'operational',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        auth: '/auth',
        restaurants: '/restaurants',
        products: '/products'
      }
    };
  }
}
