import { Entity, PrimaryKey, Property, ManyToOne, Ref } from '@mikro-orm/core';
import { Restaurant } from './restaurant.entity';

/**
 * QR Scan Analytics entity for tracking QR code scans
 */
@Entity()
export class QrScanAnalytics {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Restaurant, { ref: true })
  restaurant!: Ref<Restaurant>;

  @Property()
  uid!: string; // Unique identifier for the scanner

  @Property()
  ipAddress!: string;

  @Property()
  userAgent?: string;

  @Property()
  country?: string;

  @Property()
  city?: string;

  @Property()
  deviceType?: string; // mobile, desktop, tablet

  @Property()
  browser?: string;

  @Property()
  os?: string;

  @Property()
  referrer?: string;

  @Property()
  scanCount: number = 1; // Number of scans in this session

  @Property()
  sessionDuration?: number; // Duration in seconds

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  /**
   * Check if scan is from mobile device
   * @returns True if mobile device
   */
  isMobileDevice(): boolean {
    return this.deviceType === 'mobile';
  }

  /**
   * Get scan hour (0-23)
   * @returns Hour of the day
   */
  getScanHour(): number {
    return this.createdAt.getHours();
  }

  /**
   * Get scan day of week (0-6, Sunday = 0)
   * @returns Day of week
   */
  getScanDayOfWeek(): number {
    return this.createdAt.getDay();
  }

  /**
   * Get scan date (YYYY-MM-DD)
   * @returns Date string
   */
  getScanDate(): string {
    return this.createdAt.toISOString().split('T')[0];
  }
}
