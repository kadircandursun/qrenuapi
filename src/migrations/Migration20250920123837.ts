import { Migration } from '@mikro-orm/migrations';

export class Migration20250920123837 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "restaurant" ("id" serial primary key, "name" varchar(255) not null, "description" text null, "welcome_message" text null, "website_url" varchar(255) null, "instagram_url" varchar(255) null, "facebook_url" varchar(255) null, "twitter_url" varchar(255) null, "linkedin_url" varchar(255) null, "youtube_url" varchar(255) null, "tiktok_url" varchar(255) null, "owner_id" int not null, "is_active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`alter table "restaurant" add constraint "restaurant_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "restaurant" cascade;`);
  }

}
