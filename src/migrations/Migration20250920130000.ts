import { Migration } from '@mikro-orm/migrations';

export class Migration20250920130000 extends Migration {

  override async up(): Promise<void> {
    // Premium paketi ekle
    this.addSql(`insert into "package" ("name", "description", "max_restaurants", "max_categories_per_restaurant", "max_products_per_category", "price", "currency", "duration_in_days", "is_active", "is_default", "created_at", "updated_at") values ('Premium Paket', 'Sınırsız kullanım için premium paket - 1 yıl geçerli', 999999, 999999, 999999, 999.99, 'TRY', 365, true, false, now(), now());`);
  }

  override async down(): Promise<void> {
    this.addSql(`delete from "package" where "name" = 'Premium Paket';`);
  }

}
