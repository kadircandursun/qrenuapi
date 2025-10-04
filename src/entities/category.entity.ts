import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Ref, Collection } from '@mikro-orm/core';
import { Restaurant } from './restaurant.entity';
import { Product } from './product.entity';

/**
 * Category entity representing a menu category in a restaurant
 */
@Entity()
export class Category {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ nullable: true })
  imageUrl?: string;

  @Property({ nullable: true })
  imagePath?: string;

  @Property()
  sortOrder: number = 0;

  @Property()
  isActive: boolean = true;

  @ManyToOne(() => Restaurant, { ref: true })
  restaurant!: Ref<Restaurant>;

  @OneToMany(() => Product, product => product.category)
  products = new Collection<Product>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  /**
   * Check if the category is active
   * @returns True if the category is active
   */
  isCategoryActive(): boolean {
    return this.isActive;
  }

  /**
   * Get active products count
   * @returns Number of active products in this category
   */
  async getActiveProductsCount(): Promise<number> {
    return this.products.getItems().filter(product => product.isActive).length;
  }

  /**
   * Check if category has products
   * @returns True if category has at least one product
   */
  hasProducts(): boolean {
    return this.products.length > 0;
  }
}
