import { Migration } from '@mikro-orm/migrations';

export class Migration20250920132000 extends Migration {

  override async up(): Promise<void> {
    // Basic paketi ekle (1 restoran, sınırsız kategori ve ürün, 1 yıl geçerli)
    this.addSql(`insert into "package" ("name", "description", "max_restaurants", "max_categories_per_restaurant", "max_products_per_category", "price", "currency", "duration_in_days", "is_active", "is_default", "created_at", "updated_at") values ('Basic Paket', 'Tek restoran için sınırsız kategori ve ürün - 1 yıl geçerli', 1, 999999, 999999, 299.99, 'TRY', 365, true, false, now(), now());`);
  }

  override async down(): Promise<void> {
    this.addSql(`delete from "package" where "name" = 'Basic Paket';`);
  }

}
