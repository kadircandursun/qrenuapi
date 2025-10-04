import { Migration } from '@mikro-orm/migrations';

export class Migration20250920122117 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "is_email_verified" boolean not null default false, add column "email_verification_token" varchar(255) null, add column "email_verification_token_expires_at" timestamptz null, add column "last_verification_email_sent_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "is_email_verified", drop column "email_verification_token", drop column "email_verification_token_expires_at", drop column "last_verification_email_sent_at";`);
  }

}
