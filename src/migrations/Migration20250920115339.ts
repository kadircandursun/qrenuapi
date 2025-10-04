import { Migration } from '@mikro-orm/migrations';

export class Migration20250920115339 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "phone_number" varchar(255) not null, add column "company_name" varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "phone_number", drop column "company_name";`);
  }

}
