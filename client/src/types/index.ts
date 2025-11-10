export type ShippingMethod = 'standard' | 'express' | 'overnight';

export interface CartItem {
  id: string;
  productId: string;
  product: {
    _id: string;
    title: string;
    images: Array<{ url: string }>;
    price: number;
    slug: string;
  };
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface GuestShippingInfo {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}
// types/index.ts
export interface Product {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  images: {
    public_id: string;
    url: string;
    alt?: string;
    isPrimary?: boolean;
    _id?: string;
  }[];
  variants?: {
    _id?: string;
    size: string;
    color: string;
    stock: number;
    sku?: string;
    price?: number;
  }[];
  features: string[];
  specifications?: {
    weight?: string;
    dimensions?: string;
    material?: string;
    color?: string;
    warranty?: string;
    [key: string]: any; // For additional dynamic specifications
  };
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  isFeatured: boolean;
  isActive: boolean;
  inventory: {
    trackQuantity: boolean;
    quantity: number;
    lowStockAlert: number;
  };
  shipping?: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    freeShipping: boolean;
  };
  seo?: {
    canonicalUrl?: string;
    metaRobots?: string;
  };
  rating: {
    average: number;
    count: number;
    distribution?: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  salesCount?: number;
  viewCount?: number;
  coupons?: Coupon[];
  createdAt: string;
  updatedAt: string;
  // Virtual fields (computed)
  discountPercentage?: number;
  activeCoupons?: Coupon[];
  isInStock?: (variantIndex?: number) => boolean;
}

export interface Coupon {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}
export interface ProductCardProps {
  product: Product;
  className?: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}



// types/product.ts
export interface ProductImage {
  public_id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  _id: string;
}

export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
  sku: string;
  price: number;
  _id: string;
}

export interface ProductSpecifications {
  weight: string;
  dimensions: string;
  warranty: string;
  material: string;
  color: string;
  additional?: Record<string, string>;
}

export interface ProductInventory {
  trackQuantity: boolean;
  quantity: number;
  lowStockAlert: number;
}

export interface ProductShipping {
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  freeShipping: boolean;
}

export interface ProductRatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ProductRating {
  distribution: ProductRatingDistribution;
  average: number;
  count: number;
}

export interface ProductCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  _id?: string;
}



export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  lowStock?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: {
public_id?:string;
url?:string;
  };
  addresses?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}



export interface GuestWishlistItem {
  id: string;
  productId: string;
  product: {
    title: string;
    images: Array<{ url: string; alt?: string }>;
    price: number;
    rating: {
      average: number;
      count: number;
    };
    slug: string;
    inventory: {
      quantity: number;
    };
  };
  addedAt: string;
}


export interface GuestCartItem {
  id?: string;
  _id?: string;



  productId: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  product: {
    title: string;
    images: Array<{ url: string; alt?: string }>;
    inventory: {
      quantity: number;
    };
    slug: string;
  };
}


export interface Address {
  _id: string;
  user: string;
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}


// types/navigation.ts
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    public_id: string;
    url: string;
  };
  parent?: string;
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  productsCount?: number;
  subcategories?: Category[];
}

export interface NavMenuItem {
  id: string;
  label: string;
  type: 'link' | 'dropdown';
  url?: string;
  description?: string;
  icon?: string;
  children?: NavMenuItem[];
  category?: Category;
  featured?: boolean;
}



// types/navigation.ts
export interface CategoryImage {
  url: string;
}



export interface NavMenuItem {
  id: string;
  label: string;
  type: 'link' | 'dropdown';
  url?: string;
  description?: string;
  icon?: string;
  children?: NavMenuItem[];
  category?: Category;
  featured?: boolean;
}



export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}



// types/index.ts
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: {
    public_id: string;
    url: string;
  };
  banner?: {
    public_id: string;
    url: string;
  };
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  categories?: string[] | Category[];
  originCountry?: string;
  foundedYear?: number;
  contactEmail?: string;
  rating: {
    average: number;
    count: number;
  };
  followerCount: number;
  productCount: number;
  story?: string;
  metaTitle?: string;
  metaDescription?: string;
  seo?: {
    canonicalUrl?: string;
    metaRobots?: string;
  };
  createdAt: string;
  updatedAt: string;
}


// types/index.ts - Add these types
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: {
    public_id: string;
    url: string;
  };
  banner?: {
    public_id: string;
    url: string;
  };
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  categories?: string[] | Category[];
  originCountry?: string;
  foundedYear?: number;
  contactEmail?: string;
  rating: {
    average: number;
    count: number;
  };
  followerCount: number;
  productCount: number;
  story?: string;
  metaTitle?: string;
  metaDescription?: string;
  seo?: {
    canonicalUrl?: string;
    metaRobots?: string;
  };
  createdAt: string;
  updatedAt: string;
  isFollowing?: boolean; // For authenticated users
}

export interface BrandsResponse {
  success: boolean;
  data: Brand[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BrandProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
}

// Update User interface
export interface User {
  // ... existing fields
  followedBrands: string[] | Brand[];
}
export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  helpful: number;
}

export interface ProductResponse {
  success: boolean;
  data: {
    product: Product;
    relatedProducts: Product[];
    reviews: Review[];
    reviewStats: Array<{
      _id: number;
      count: number;
    }>;
  };
}

// ... existing types ...

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay';
  brand: string;
  last4?: string;
  expiry: string;
  isDefault: boolean;
  name: string;
  email?: string;
}

export interface SetupIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    setupIntentId: string;
  };
}

export interface AddPaymentMethodData {
  paymentMethodId: string;
  isDefault?: boolean;
  type?: 'card' | 'paypal' | 'apple_pay';
}

export interface PaymentMethodsResponse {
  success: boolean;
  data: PaymentMethod[];
  count: number;
}

export interface PaymentMethodResponse {
  success: boolean;
  data: PaymentMethod;
}

export interface DefaultPaymentMethodResponse {
  success: boolean;
  message: string;
}

export interface DeletePaymentMethodResponse {
  success: boolean;
  message: string;
}

interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  brand?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
  featured?: boolean; // Add featured filter
}
