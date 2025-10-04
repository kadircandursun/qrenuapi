import { Migration } from '@mikro-orm/migrations';

export class Migration20250920123101 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "password_reset_token" varchar(255) null, add column "password_reset_token_expires_at" timestamptz null, add column "last_password_reset_email_sent_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "password_reset_token", drop column "password_reset_token_expires_at", drop column "last_password_reset_email_sent_at";`);
  }

}
