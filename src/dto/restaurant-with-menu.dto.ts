import { ApiProperty } from '@nestjs/swagger';

/**
 * Kategori içindeki ürün DTO
 */
export class ProductInMenuDto {
  @ApiProperty({
    description: 'Ürün ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Ürün adı',
    example: 'Adana Kebap',
  })
  name!: string;

  @ApiProperty({
    description: 'Ürün açıklaması',
    example: 'Acılı kıyma ile hazırlanan geleneksel Adana kebap',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Ürün fiyatı',
    example: 45.50,
  })
  price!: number;

  @ApiProperty({
    description: 'Para birimi',
    example: 'TRY',
  })
  currency!: string;

  @ApiProperty({
    description: 'İndirimli fiyat (kampanyalı ürünler için)',
    example: 35.50,
    required: false,
  })
  discountedPrice?: number;

  @ApiProperty({
    description: 'Ürün fotoğrafı URL',
    example: 'https://example.com/product-image.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Ürün fotoğrafı dosya yolu',
    example: 'uploads/products/product-image-123.png',
    required: false,
  })
  imagePath?: string;

  @ApiProperty({
    description: 'Stokta var mı',
    example: true,
  })
  isInStock!: boolean;

  @ApiProperty({
    description: 'Sıralama düzeni',
    example: 1,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Ürün aktif durumu',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Formatlanmış fiyat',
    example: '45.50 TRY',
  })
  formattedPrice!: string;

  @ApiProperty({
    description: 'Formatlanmış indirimli fiyat (kampanyalı ürünler için)',
    example: '35.50 TRY',
    required: false,
  })
  formattedDiscountedPrice?: string;

  @ApiProperty({
    description: 'İndirim yüzdesi (kampanyalı ürünler için)',
    example: 22,
    required: false,
  })
  discountPercentage?: number;

  @ApiProperty({
    description: 'Kampanyalı ürün mü',
    example: true,
  })
  isOnSale!: boolean;

  @ApiProperty({
    description: 'Ürün müsait mi',
    example: true,
  })
  isAvailable!: boolean;

  @ApiProperty({
    description: 'Oluşturulma tarihi',
    example: '2025-09-20T15:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Güncellenme tarihi',
    example: '2025-09-20T15:30:00.000Z',
  })
  updatedAt!: Date;
}

/**
 * Kategori ve ürünler ile birlikte kategori DTO
 */
export class CategoryInMenuDto {
  @ApiProperty({
    description: 'Kategori ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Kategori adı',
    example: 'Ana Yemekler',
  })
  name!: string;

  @ApiProperty({
    description: 'Kategori açıklaması',
    example: 'Geleneksel Türk mutfağının ana yemekleri',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Kategori resmi URL',
    example: 'https://example.com/category-image.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Kategori resmi dosya yolu',
    example: 'uploads/categories/category-image-123.png',
    required: false,
  })
  imagePath?: string;

  @ApiProperty({
    description: 'Sıralama düzeni',
    example: 1,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Kategori aktif durumu',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Ürünler listesi',
    type: [ProductInMenuDto],
  })
  products!: ProductInMenuDto[];

  @ApiProperty({
    description: 'Oluşturulma tarihi',
    example: '2025-09-20T15:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Güncellenme tarihi',
    example: '2025-09-20T15:30:00.000Z',
  })
  updatedAt!: Date;
}

/**
 * DTO for restaurant with full menu response
 */
export class RestaurantWithMenuDto {
  @ApiProperty({
    description: 'Restoran ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Restoran adı',
    example: 'Lezzet Durağı',
  })
  name!: string;

  @ApiProperty({
    description: 'Restoran subdomain (URL ön eki)',
    example: 'lezzet-duragi',
  })
  subdomain!: string;

  @ApiProperty({
    description: 'QR kod URL\'si',
    example: 'https://lezzet-duragi.qrenu.com',
  })
  qrUrl!: string;

  @ApiProperty({
    description: 'Restoran açıklaması',
    example: 'Geleneksel Türk mutfağının en lezzetli örneklerini sunuyoruz.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Hoşgeldin mesajı',
    example: 'QRenu\'ya hoş geldiniz! Menümüzü inceleyebilirsiniz.',
    required: false,
  })
  welcomeMessage?: string;

  @ApiProperty({
    description: 'Website URL',
    example: 'https://www.lezzetduragi.com',
    required: false,
  })
  websiteUrl?: string;

  @ApiProperty({
    description: 'Instagram URL',
    example: 'https://www.instagram.com/lezzetduragi',
    required: false,
  })
  instagramUrl?: string;

  @ApiProperty({
    description: 'Facebook URL',
    example: 'https://www.facebook.com/lezzetduragi',
    required: false,
  })
  facebookUrl?: string;

  @ApiProperty({
    description: 'Twitter URL',
    example: 'https://www.twitter.com/lezzetduragi',
    required: false,
  })
  twitterUrl?: string;

  @ApiProperty({
    description: 'LinkedIn URL',
    example: 'https://www.linkedin.com/company/lezzetduragi',
    required: false,
  })
  linkedinUrl?: string;

  @ApiProperty({
    description: 'YouTube URL',
    example: 'https://www.youtube.com/c/lezzetduragi',
    required: false,
  })
  youtubeUrl?: string;

  @ApiProperty({
    description: 'TikTok URL',
    example: 'https://www.tiktok.com/@lezzetduragi',
    required: false,
  })
  tiktokUrl?: string;

  @ApiProperty({
    description: 'Restoran logosu dosya yolu',
    example: 'uploads/logos/restaurant-logo-123.png',
    required: false,
  })
  logoPath?: string;

  @ApiProperty({
    description: 'Restoran aktif durumu',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Kategoriler ve ürünler listesi',
    type: [CategoryInMenuDto],
  })
  categories!: CategoryInMenuDto[];

  @ApiProperty({
    description: 'Oluşturulma tarihi',
    example: '2025-09-20T15:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Güncellenme tarihi',
    example: '2025-09-20T15:30:00.000Z',
  })
  updatedAt!: Date;
}
