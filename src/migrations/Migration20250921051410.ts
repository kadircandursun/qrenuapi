import { Migration } from '@mikro-orm/migrations';

export class Migration20250921051410 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop table if exists "restaurant_qrs" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table "restaurant_qrs" ("id" serial primary key, "restaurant_id" int null, "qr_code_svg" text not null, "qr_url" varchar(255) not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP);`);

    this.addSql(`alter table "restaurant_qrs" add constraint "restaurant_qrs_restaurant_id_foreign" foreign key ("restaurant_id") references "restaurant" ("id") on delete cascade;`);
  }

}
