import { Migration } from '@mikro-orm/migrations';

export class Migration20250920170352 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "session_analytics" ("id" serial primary key, "restaurant_id" int not null, "uid" varchar(255) not null, "session_id" varchar(255) not null, "ip_address" varchar(255) not null, "user_agent" varchar(255) null, "country" varchar(255) null, "city" varchar(255) null, "device_type" varchar(255) null, "browser" varchar(255) null, "os" varchar(255) null, "referrer" varchar(255) null, "page_views" int not null default 1, "total_duration" int not null default 0, "last_activity_at" timestamptz not null, "is_active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "qr_scan_analytics" ("id" serial primary key, "restaurant_id" int not null, "uid" varchar(255) not null, "ip_address" varchar(255) not null, "user_agent" varchar(255) null, "country" varchar(255) null, "city" varchar(255) null, "device_type" varchar(255) null, "browser" varchar(255) null, "os" varchar(255) null, "referrer" varchar(255) null, "scan_count" int not null default 1, "session_duration" int null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "favorite_analytics" ("id" serial primary key, "restaurant_id" int not null, "category_id" int null, "product_id" int null, "uid" varchar(255) not null, "action" varchar(255) not null, "ip_address" varchar(255) not null, "user_agent" varchar(255) null, "country" varchar(255) null, "city" varchar(255) null, "device_type" varchar(255) null, "browser" varchar(255) null, "os" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`alter table "session_analytics" add constraint "session_analytics_restaurant_id_foreign" foreign key ("restaurant_id") references "restaurant" ("id") on update cascade;`);

    this.addSql(`alter table "qr_scan_analytics" add constraint "qr_scan_analytics_restaurant_id_foreign" foreign key ("restaurant_id") references "restaurant" ("id") on update cascade;`);

    this.addSql(`alter table "favorite_analytics" add constraint "favorite_analytics_restaurant_id_foreign" foreign key ("restaurant_id") references "restaurant" ("id") on update cascade;`);
    this.addSql(`alter table "favorite_analytics" add constraint "favorite_analytics_category_id_foreign" foreign key ("category_id") references "category" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "favorite_analytics" add constraint "favorite_analytics_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "session_analytics" cascade;`);

    this.addSql(`drop table if exists "qr_scan_analytics" cascade;`);

    this.addSql(`drop table if exists "favorite_analytics" cascade;`);

    this.addSql(`alter table "restaurant" drop constraint "restaurant_subdomain_unique";`);
    this.addSql(`alter table "restaurant" drop column "subdomain";`);
  }

}
