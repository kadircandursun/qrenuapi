import { Entity, PrimaryKey, Property, ManyToOne, Ref } from '@mikro-orm/core';
import { Restaurant } from './restaurant.entity';

/**
 * Session Analytics entity for tracking user sessions
 */
@Entity()
export class SessionAnalytics {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Restaurant, { ref: true })
  restaurant!: Ref<Restaurant>;

  @Property()
  uid!: string; // Unique identifier for the user

  @Property()
  sessionId!: string; // Unique session identifier

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
  pageViews: number = 1; // Number of page views in this session

  @Property()
  totalDuration: number = 0; // Total duration in seconds

  @Property()
  lastActivityAt: Date = new Date();

  @Property()
  isActive: boolean = true;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  /**
   * Check if session is from mobile device
   * @returns True if mobile device
   */
  isMobileSession(): boolean {
    return this.deviceType === 'mobile';
  }

  /**
   * Update session activity
   * @param duration Additional duration in seconds
   */
  updateActivity(duration: number = 0): void {
    this.lastActivityAt = new Date();
    this.totalDuration += duration;
    this.pageViews += 1;
    this.updatedAt = new Date();
  }

  /**
   * End session
   */
  endSession(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Get session duration in minutes
   * @returns Duration in minutes
   */
  getDurationInMinutes(): number {
    return Math.round(this.totalDuration / 60);
  }

  /**
   * Check if session is recent (within last 30 minutes)
   * @returns True if session is recent
   */
  isRecentSession(): boolean {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return this.lastActivityAt > thirtyMinutesAgo;
  }
}
