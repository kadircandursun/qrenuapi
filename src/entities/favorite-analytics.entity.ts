import { Entity, PrimaryKey, Property, ManyToOne, Ref } from '@mikro-orm/core';
import { Restaurant } from './restaurant.entity';
import { Category } from './category.entity';
import { Product } from './product.entity';

/**
 * Favorite Analytics entity for tracking user favorites
 */
@Entity()
export class FavoriteAnalytics {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Restaurant, { ref: true })
  restaurant!: Ref<Restaurant>;

  @ManyToOne(() => Category, { ref: true, nullable: true })
  category?: Ref<Category>;

  @ManyToOne(() => Product, { ref: true, nullable: true })
  product?: Ref<Product>;

  @Property()
  uid!: string; // Unique identifier for the user

  @Property()
  action!: string; // 'add', 'remove', 'view'

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
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  /**
   * Check if action is adding to favorites
   * @returns True if adding to favorites
   */
  isAddingToFavorites(): boolean {
    return this.action === 'add';
  }

  /**
   * Check if action is removing from favorites
   * @returns True if removing from favorites
   */
  isRemovingFromFavorites(): boolean {
    return this.action === 'remove';
  }

  /**
   * Check if action is viewing favorites
   * @returns True if viewing favorites
   */
  isViewingFavorites(): boolean {
    return this.action === 'view';
  }

  /**
   * Get favorite type
   * @returns Type of favorite (category or product)
   */
  getFavoriteType(): string {
    if (this.product) return 'product';
    if (this.category) return 'category';
    return 'unknown';
  }
}
