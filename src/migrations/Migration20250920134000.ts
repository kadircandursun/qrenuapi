import { Migration } from '@mikro-orm/migrations';

export class Migration20250920134000 extends Migration {

  override async up(): Promise<void> {
    // Restaurant tablosuna subdomain kolonu ekle
    this.addSql(`alter table "restaurant" add column "subdomain" varchar(255) not null default '';`);
    
    // Subdomain unique constraint ekle
    this.addSql(`alter table "restaurant" add constraint "restaurant_subdomain_unique" unique ("subdomain");`);
    
    // Mevcut restoranlar için subdomain oluştur (restoran-{id} formatında)
    this.addSql(`update "restaurant" set "subdomain" = 'restoran-' || "id" where "subdomain" = '';`);
  }

  override async down(): Promise<void> {
    // Subdomain unique constraint'i kaldır
    this.addSql(`alter table "restaurant" drop constraint "restaurant_subdomain_unique";`);
    
    // Subdomain kolonunu kaldır
    this.addSql(`alter table "restaurant" drop column "subdomain";`);
  }

}
