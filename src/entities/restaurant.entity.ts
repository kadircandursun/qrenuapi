import { Entity, PrimaryKey, Property, ManyToOne, Ref, Unique } from '@mikro-orm/core';
import { User } from './user.entity';

/**
 * Restaurant entity representing a restaurant in the system
 */
@Entity()
@Unique({ properties: ['subdomain'] })
export class Restaurant {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  @Unique()
  subdomain!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'text', nullable: true })
  welcomeMessage?: string;

  @Property({ nullable: true })
  websiteUrl?: string;

  @Property({ nullable: true })
  instagramUrl?: string;

  @Property({ nullable: true })
  facebookUrl?: string;

  @Property({ nullable: true })
  twitterUrl?: string;

  @Property({ nullable: true })
  linkedinUrl?: string;

  @Property({ nullable: true })
  youtubeUrl?: string;

  @Property({ nullable: true })
  tiktokUrl?: string;

  @Property({ nullable: true })
  logoPath?: string;

  @ManyToOne(() => User, { ref: true })
  owner!: Ref<User>;

  @Property()
  isActive: boolean = true;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  /**
   * Check if the restaurant is active
   * @returns True if the restaurant is active
   */
  isRestaurantActive(): boolean {
    return this.isActive;
  }

  /**
   * Get all social media URLs as an object
   * @returns Object containing all social media URLs
   */
  getSocialMediaUrls(): Record<string, string | undefined> {
    return {
      website: this.websiteUrl,
      instagram: this.instagramUrl,
      facebook: this.facebookUrl,
      twitter: this.twitterUrl,
      linkedin: this.linkedinUrl,
      youtube: this.youtubeUrl,
      tiktok: this.tiktokUrl,
    };
  }

  /**
   * Check if restaurant has any social media links
   * @returns True if restaurant has at least one social media link
   */
  hasSocialMediaLinks(): boolean {
    return !!(
      this.websiteUrl ||
      this.instagramUrl ||
      this.facebookUrl ||
      this.twitterUrl ||
      this.linkedinUrl ||
      this.youtubeUrl ||
      this.tiktokUrl
    );
  }

  /**
   * Get the full URL for the restaurant
   * @returns The full URL with subdomain
   */
  getFullUrl(): string {
    return `https://${this.subdomain}.qrenu.com`;
  }

  /**
   * Validate subdomain format
   * @param subdomain The subdomain to validate
   * @returns True if subdomain is valid
   */
  static isValidSubdomain(subdomain: string): boolean {
    // Subdomain should be 3-63 characters, alphanumeric and hyphens only, cannot start or end with hyphen
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
    return subdomainRegex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 63;
  }
}
