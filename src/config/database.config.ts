import { defineConfig } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { User } from '../entities/user.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { Package } from '../entities/package.entity';
import { QrScanAnalytics } from '../entities/qr-scan-analytics.entity';
import { FavoriteAnalytics } from '../entities/favorite-analytics.entity';
import { SessionAnalytics } from '../entities/session-analytics.entity';
import { Feedback } from '../entities/feedback.entity';

export default defineConfig({
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME || 'qrenuapi',
  entities: [User, Restaurant, Category, Product, Package, QrScanAnalytics, FavoriteAnalytics, SessionAnalytics, Feedback],
  entitiesTs: ['./src/**/*.entity.ts'],
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
  seeder: {
    path: './dist/seeders',
    pathTs: './src/seeders',
  },
});
