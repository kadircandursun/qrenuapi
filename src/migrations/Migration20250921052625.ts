import { Migration } from '@mikro-orm/migrations';

export class Migration20250921052625 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "feedbacks" ("id" serial primary key, "restaurant_id" int not null, "rating" int not null, "type" text check ("type" in ('positive', 'negative', 'suggestion')) not null, "message" text null, "email" varchar(255) null, "ip_address" varchar(255) not null, "user_agent" varchar(255) null, "country" varchar(255) null, "city" varchar(255) null, "device_type" varchar(255) null, "browser" varchar(255) null, "os" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`alter table "feedbacks" add constraint "feedbacks_restaurant_id_foreign" foreign key ("restaurant_id") references "restaurant" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "feedbacks" cascade;`);
  }

}
