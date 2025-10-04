import { Migration } from '@mikro-orm/migrations';

export class Migration20250920124925 extends Migration {

  override async up(): Promise<void> {
    // Package tablosunu oluştur
    this.addSql(`create table "package" ("id" serial primary key, "name" varchar(255) not null, "description" text null, "max_restaurants" int not null default 1, "max_categories_per_restaurant" int not null default 5, "max_products_per_category" int not null default 20, "price" numeric(10,2) null, "currency" varchar(255) not null default 'TRY', "duration_in_days" int not null default 30, "is_active" boolean not null default true, "is_default" boolean not null default false, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`alter table "package" add constraint "package_name_unique" unique ("name");`);

    // Varsayılan paketi ekle (sadece süre sınırsız)
    this.addSql(`insert into "package" ("name", "description", "max_restaurants", "max_categories_per_restaurant", "max_products_per_category", "price", "currency", "duration_in_days", "is_active", "is_default", "created_at", "updated_at") values ('Free Paket', 'Küçük işletmeler için ücretsiz paket', 1, 5, 20, null, 'TRY', 999999, true, true, now(), now());`);

    // User tablosuna yeni alanları ekle (nullable olarak)
    this.addSql(`alter table "user" add column "role" varchar(255) not null default 'user', add column "package_id" int null, add column "package_expires_at" timestamptz null;`);

    // Mevcut kullanıcılara varsayılan paketi ata
    this.addSql(`update "user" set "package_id" = (select id from "package" where "is_default" = true limit 1) where "package_id" is null;`);

    // package_id'yi not null yap
    this.addSql(`alter table "user" alter column "package_id" set not null;`);

    // Foreign key constraint ekle
    this.addSql(`alter table "user" add constraint "user_package_id_foreign" foreign key ("package_id") references "package" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop constraint "user_package_id_foreign";`);

    this.addSql(`drop table if exists "package" cascade;`);

    this.addSql(`alter table "user" drop column "role", drop column "package_id", drop column "package_expires_at";`);
  }

}
