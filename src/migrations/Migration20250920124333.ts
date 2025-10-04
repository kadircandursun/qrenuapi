import { Migration } from '@mikro-orm/migrations';

export class Migration20250920124333 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "category" ("id" serial primary key, "name" varchar(255) not null, "description" text null, "image_url" varchar(255) null, "sort_order" int not null default 0, "is_active" boolean not null default true, "restaurant_id" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "product" ("id" serial primary key, "name" varchar(255) not null, "description" text null, "price" numeric(10,2) not null, "currency" varchar(255) not null default 'TRY', "image_url" varchar(255) null, "is_in_stock" boolean not null default true, "sort_order" int not null default 0, "is_active" boolean not null default true, "category_id" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`alter table "category" add constraint "category_restaurant_id_foreign" foreign key ("restaurant_id") references "restaurant" ("id") on update cascade;`);

    this.addSql(`alter table "product" add constraint "product_category_id_foreign" foreign key ("category_id") references "category" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "product" drop constraint "product_category_id_foreign";`);

    this.addSql(`drop table if exists "category" cascade;`);

    this.addSql(`drop table if exists "product" cascade;`);
  }

}
