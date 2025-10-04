import { Entity, PrimaryKey, Property, ManyToOne, Ref } from '@mikro-orm/core';
import { Category } from './category.entity';

/**
 * Product entity representing a menu item in a category
 */
@Entity()
export class Product {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Property()
  currency: string = 'TRY';

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountedPrice?: number;

  @Property({ nullable: true })
  imageUrl?: string;

  @Property({ nullable: true })
  imagePath?: string;

  @Property()
  isInStock: boolean = true;

  @Property()
  sortOrder: number = 0;

  @Property()
  isActive: boolean = true;

  @ManyToOne(() => Category, { ref: true })
  category!: Ref<Category>;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  /**
   * Check if the product is active
   * @returns True if the product is active
   */
  isProductActive(): boolean {
    return this.isActive;
  }

  /**
   * Check if the product is available (active and in stock)
   * @returns True if the product is available
   */
  isAvailable(): boolean {
    return this.isActive && this.isInStock;
  }

  /**
   * Get formatted price with currency
   * @returns Formatted price string
   */
  getFormattedPrice(): string {
    return `${this.price} ${this.currency}`;
  }

  /**
   * Get formatted discounted price with currency
   * @returns Formatted discounted price string
   */
  getFormattedDiscountedPrice(): string | undefined {
    if (!this.discountedPrice) return undefined;
    return `${this.discountedPrice} ${this.currency}`;
  }

  /**
   * Check if product is on sale (has discounted price)
   * @returns True if product is on sale
   */
  isOnSale(): boolean {
    return !!this.discountedPrice && this.discountedPrice > 0;
  }

  /**
   * Get discount percentage
   * @returns Discount percentage or undefined if not on sale
   */
  getDiscountPercentage(): number | undefined {
    if (!this.isOnSale()) return undefined;
    return Math.round(((this.price - this.discountedPrice!) / this.price) * 100);
  }

  /**
   * Check if product has image
   * @returns True if product has an image
   */
  hasImage(): boolean {
    return !!this.imageUrl;
  }
}
