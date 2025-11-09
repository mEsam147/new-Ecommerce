// utils/productUtils.ts
import { Product } from '@/types';

export const getStockStatus = (quantity: number, lowStockAlert: number) => {
  if (quantity === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-50' };
  if (quantity <= lowStockAlert) return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' };
  return { status: 'In Stock', color: 'text-green-600 bg-green-50' };
};

export const calculateProductStats = (products: Product[]) => {
  return {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.isActive).length,
    lowStock: products.filter(p =>
      p.inventory.quantity > 0 &&
      p.inventory.quantity <= p.inventory.lowStockAlert
    ).length,
    outOfStock: products.filter(p => p.inventory.quantity === 0).length,
    totalValue: products.reduce((sum, product) => sum + (product.price * product.inventory.quantity), 0),
    totalSales: products.reduce((sum, product) => sum + product.salesCount, 0),
  };
};

export const formatProductForAPI = (product: Partial<Product>): Partial<Product> => {
  // Remove any client-only fields and ensure data is in correct format
  const { id, ...apiProduct } = product;
  return {
    ...apiProduct,
    // Ensure required fields have defaults
    variants: product.variants || [],
    features: product.features || [],
    tags: product.tags || [],
    images: product.images || [],
    coupons: product.coupons || [],
  };
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};
