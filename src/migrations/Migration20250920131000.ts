import { Migration } from '@mikro-orm/migrations';

export class Migration20250920131000 extends Migration {

  override async up(): Promise<void> {
    // Standart Paket adını Free Paket olarak değiştir
    this.addSql(`update "package" set "name" = 'Free Paket', "description" = 'Küçük işletmeler için ücretsiz paket' where "name" = 'Standart Paket';`);
  }

  override async down(): Promise<void> {
    // Free Paket adını Standart Paket olarak geri değiştir
    this.addSql(`update "package" set "name" = 'Standart Paket', "description" = 'Küçük işletmeler için ideal paket' where "name" = 'Free Paket';`);
  }

}
