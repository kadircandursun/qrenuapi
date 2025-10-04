import { Migration } from '@mikro-orm/migrations';

export class Migration20250924055815 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "product" add column "discounted_price" numeric(10,2) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "product" drop column "discounted_price";`);
  }

}
