import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Restaurant } from '../entities/restaurant.entity';

/**
 * Subdomain service for managing restaurant subdomains
 */
@Injectable()
export class SubdomainService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: EntityRepository<Restaurant>,
  ) {}

  /**
   * Check if subdomain is available
   * @param subdomain The subdomain to check
   * @returns True if subdomain is available
   */
  async isSubdomainAvailable(subdomain: string): Promise<boolean> {
    // Validate subdomain format
    if (!Restaurant.isValidSubdomain(subdomain)) {
      throw new BadRequestException('Geçersiz subdomain formatı');
    }

    // Check if subdomain already exists
    const existingRestaurant = await this.restaurantRepository.findOne({
      subdomain: subdomain.toLowerCase(),
    });

    return !existingRestaurant;
  }

  /**
   * Check subdomain availability and return detailed response
   * @param subdomain The subdomain to check
   * @returns Detailed availability response
   */
  async checkSubdomainAvailability(subdomain: string): Promise<{
    available: boolean;
    subdomain: string;
    message: string;
  }> {
    // Normalize subdomain (lowercase)
    const normalizedSubdomain = subdomain.toLowerCase();

    // Validate subdomain format
    if (!Restaurant.isValidSubdomain(normalizedSubdomain)) {
      throw new BadRequestException('Geçersiz subdomain formatı. Subdomain sadece küçük harf, rakam ve tire içerebilir.');
    }

    // Check if subdomain already exists
    const existingRestaurant = await this.restaurantRepository.findOne({
      subdomain: normalizedSubdomain,
    });

    const available = !existingRestaurant;

    return {
      available,
      subdomain: normalizedSubdomain,
      message: available 
        ? 'Subdomain müsait' 
        : 'Bu subdomain zaten kullanılıyor',
    };
  }

  /**
   * Generate alternative subdomain suggestions
   * @param baseSubdomain The base subdomain
   * @returns Array of alternative subdomains
   */
  async generateSubdomainSuggestions(baseSubdomain: string): Promise<string[]> {
    const suggestions: string[] = [];
    const normalizedBase = baseSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Add numbers to the end
    for (let i = 1; i <= 5; i++) {
      const suggestion = `${normalizedBase}${i}`;
      if (Restaurant.isValidSubdomain(suggestion)) {
        const available = await this.isSubdomainAvailable(suggestion);
        if (available) {
          suggestions.push(suggestion);
        }
      }
    }

    // Add common suffixes
    const suffixes = ['tr', 'com', 'net', 'org'];
    for (const suffix of suffixes) {
      const suggestion = `${normalizedBase}-${suffix}`;
      if (Restaurant.isValidSubdomain(suggestion)) {
        const available = await this.isSubdomainAvailable(suggestion);
        if (available) {
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions.slice(0, 5); // Return max 5 suggestions
  }

  /**
   * Reserve subdomain (check availability and throw error if not available)
   * @param subdomain The subdomain to reserve
   * @throws ConflictException if subdomain is not available
   */
  async reserveSubdomain(subdomain: string): Promise<void> {
    const normalizedSubdomain = subdomain.toLowerCase();

    // Validate subdomain format
    if (!Restaurant.isValidSubdomain(normalizedSubdomain)) {
      throw new BadRequestException('Geçersiz subdomain formatı');
    }

    // Check if subdomain is available
    const available = await this.isSubdomainAvailable(normalizedSubdomain);
    if (!available) {
      throw new ConflictException('Bu subdomain zaten kullanılıyor');
    }
  }
}
