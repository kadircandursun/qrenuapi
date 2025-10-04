import { Entity, PrimaryKey, Property, Unique, OneToMany, Collection } from '@mikro-orm/core';
import { User } from './user.entity';

/**
 * Package entity representing subscription packages
 */
@Entity()
@Unique({ properties: ['name'] })
export class Package {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property()
  maxRestaurants: number = 1;

  @Property()
  maxCategoriesPerRestaurant: number = 5;

  @Property()
  maxProductsPerCategory: number = 20;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Property()
  currency: string = 'TRY';

  @Property()
  durationInDays: number = 30;

  @Property()
  isActive: boolean = true;

  @Property()
  isDefault: boolean = false;

  @OneToMany(() => User, user => user.package)
  users = new Collection<User>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  /**
   * Check if the package is active
   * @returns True if the package is active
   */
  isPackageActive(): boolean {
    return this.isActive;
  }

  /**
   * Check if this is the default package
   * @returns True if this is the default package
   */
  isDefaultPackage(): boolean {
    return this.isDefault;
  }

  /**
   * Get formatted price with currency
   * @returns Formatted price string
   */
  getFormattedPrice(): string {
    if (!this.price) {
      return 'Ücretsiz';
    }
    return `${this.price} ${this.currency}`;
  }

  /**
   * Get package features as an object
   * @returns Object containing package features
   */
  getFeatures(): Record<string, any> {
    return {
      maxRestaurants: this.maxRestaurants,
      maxCategoriesPerRestaurant: this.maxCategoriesPerRestaurant,
      maxProductsPerCategory: this.maxProductsPerCategory,
      price: this.price,
      currency: this.currency,
      durationInDays: this.durationInDays,
    };
  }
}
