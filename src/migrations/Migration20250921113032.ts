import { Migration } from '@mikro-orm/migrations';

export class Migration20250921113032 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "restaurant" add column "logo_path" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "restaurant" drop column "logo_path";`);
  }

}
