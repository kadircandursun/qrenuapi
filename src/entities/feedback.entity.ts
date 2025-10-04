import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { Restaurant } from './restaurant.entity';

export enum FeedbackType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  SUGGESTION = 'suggestion',
}

/**
 * Feedback Entity - QR menü kullanıcılarının geri bildirimleri
 */
@Entity({ tableName: 'feedbacks' })
export class Feedback {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Restaurant)
  restaurant!: Restaurant;

  @Property()
  rating!: number; // 1-5 yıldız

  @Enum(() => FeedbackType)
  type!: FeedbackType; // olumlu, olumsuz, öneri

  @Property({ type: 'text', nullable: true })
  message?: string; // İsteğe bağlı mesaj

  @Property({ nullable: true })
  email?: string; // İsteğe bağlı email

  @Property()
  ipAddress!: string; // IP adresi (analytics için)

  @Property({ nullable: true })
  userAgent?: string; // Tarayıcı bilgisi

  @Property({ nullable: true })
  country?: string; // Ülke bilgisi

  @Property({ nullable: true })
  city?: string; // Şehir bilgisi

  @Property({ nullable: true })
  deviceType?: string; // Cihaz türü

  @Property({ nullable: true })
  browser?: string; // Tarayıcı

  @Property({ nullable: true })
  os?: string; // İşletim sistemi

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
