import { Migration } from '@mikro-orm/migrations';

export class Migration20250920133000 extends Migration {

  override async up(): Promise<void> {
    // Basic paket fiyatını 1200 TL yap
    this.addSql(`update "package" set "price" = 1200.00 where "name" = 'Basic Paket';`);
    
    // Premium paket fiyatını 4000 TL yap
    this.addSql(`update "package" set "price" = 4000.00 where "name" = 'Premium Paket';`);
  }

  override async down(): Promise<void> {
    // Basic paket fiyatını 299.99 TL'ye geri döndür
    this.addSql(`update "package" set "price" = 299.99 where "name" = 'Basic Paket';`);
    
    // Premium paket fiyatını 999.99 TL'ye geri döndür
    this.addSql(`update "package" set "price" = 999.99 where "name" = 'Premium Paket';`);
  }

}
