import { Migration } from '@mikro-orm/migrations';

export class Migration20250921113614 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "category" add column "image_path" varchar(255) null;`);

    this.addSql(`alter table "product" add column "image_path" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "category" drop column "image_path";`);

    this.addSql(`alter table "product" drop column "image_path";`);
  }

}
