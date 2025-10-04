import { Entity, PrimaryKey, Property, Unique, ManyToOne, Ref } from '@mikro-orm/core';
import { Package } from './package.entity';

/**
 * User entity representing a user in the system
 */
@Entity()
@Unique({ properties: ['email'] })
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property()
  @Unique()
  email!: string;

  @Property()
  phoneNumber!: string;

  @Property()
  companyName!: string;

  @Property({ hidden: true })
  password!: string;

  @Property()
  isActive: boolean = true;

  @Property()
  isEmailVerified: boolean = false;

  @Property({ nullable: true })
  emailVerificationToken?: string;

  @Property({ nullable: true })
  emailVerificationTokenExpiresAt?: Date;

  @Property({ nullable: true })
  lastVerificationEmailSentAt?: Date;

  @Property({ nullable: true })
  passwordResetToken?: string;

  @Property({ nullable: true })
  passwordResetTokenExpiresAt?: Date;

  @Property({ nullable: true })
  lastPasswordResetEmailSentAt?: Date;

  @Property()
  role: string = 'user';

  @ManyToOne(() => Package)
  package!: Package;

  @Property({ nullable: true })
  packageExpiresAt?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  /**
   * Get the full name of the user
   * @returns The concatenated first and last name
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Check if the user is active
   * @returns True if the user is active
   */
  isUserActive(): boolean {
    return this.isActive;
  }

  /**
   * Check if email verification is needed
   * @returns True if email verification is needed
   */
  needsEmailVerification(): boolean {
    return !this.isEmailVerified;
  }

  /**
   * Check if verification email can be sent (10 minutes cooldown)
   * @returns True if verification email can be sent
   */
  canSendVerificationEmail(): boolean {
    if (!this.lastVerificationEmailSentAt) {
      return true;
    }
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    return this.lastVerificationEmailSentAt < tenMinutesAgo;
  }

  /**
   * Check if password reset email can be sent (10 minutes cooldown)
   * @returns True if password reset email can be sent
   */
  canSendPasswordResetEmail(): boolean {
    if (!this.lastPasswordResetEmailSentAt) {
      return true;
    }
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    return this.lastPasswordResetEmailSentAt < tenMinutesAgo;
  }

  /**
   * Check if user is admin
   * @returns True if user is admin
   */
  isAdmin(): boolean {
    return this.role === 'admin';
  }

  /**
   * Check if user package is active
   * @returns True if package is active
   */
  isPackageActive(): boolean {
    if (!this.packageExpiresAt) {
      return true; // No expiration date means unlimited
    }
    return this.packageExpiresAt > new Date();
  }

  /**
   * Check if user can create more restaurants
   * @param currentCount Current restaurant count
   * @returns True if user can create more restaurants
   */
  canCreateRestaurant(currentCount: number): boolean {
    if (!this.isPackageActive()) {
      return false;
    }
    return currentCount < this.package.maxRestaurants;
  }

  /**
   * Check if user can create more categories in a restaurant
   * @param currentCount Current category count in restaurant
   * @returns True if user can create more categories
   */
  canCreateCategory(currentCount: number): boolean {
    if (!this.isPackageActive()) {
      return false;
    }
    return currentCount < this.package.maxCategoriesPerRestaurant;
  }

  /**
   * Check if user can create more products in a category
   * @param currentCount Current product count in category
   * @returns True if user can create more products
   */
  canCreateProduct(currentCount: number): boolean {
    if (!this.isPackageActive()) {
      return false;
    }
    return currentCount < this.package.maxProductsPerCategory;
  }

  /**
   * Get package limits
   * @returns Object containing package limits
   */
  getPackageLimits(): Record<string, number> {
    return {
      maxRestaurants: this.package.maxRestaurants,
      maxCategoriesPerRestaurant: this.package.maxCategoriesPerRestaurant,
      maxProductsPerCategory: this.package.maxProductsPerCategory,
    };
  }
}
