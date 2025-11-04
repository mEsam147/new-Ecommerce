// lib/utils/navigationUtils.ts
import { NavMenuItem } from '@/types';

export const transformCategoriesToNavMenu = (categories: any[]): NavMenuItem[] => {
  const mainCategories = categories.filter(cat => !cat.parent && cat.isActive);

  return mainCategories.map(category => ({
    id: category._id,
    label: category.name,
    type: category.subcategories && category.subcategories.length > 0 ? 'dropdown' : 'link',
    url: `/category/${category.slug}`,
    description: category.description,
    image: category.image?.url,
    featured: category.featured,
    children: category.subcategories?.map((sub: any) => ({
      id: sub._id,
      label: sub.name,
      url: `/category/${sub.slug}`,
      description: sub.description || `Shop the best ${sub.name} collection`,
      image: sub.image?.url,
      featured: sub.featured,
      productsCount: sub.productsCount
    })) || []
  }));
};

export const getCategoryIcon = (categoryName: string) => {
  const icons: { [key: string]: string } = {
    'Beauty': '💄',
    'Skincare': '✨',
    'Makeup': '🎨',
    'Electronics': '📱',
    'Smartphones': '📱',
    'Laptops': '💻',
    'Headphones': '🎧',
    'Fashion': '👕',
    'Shoes': '👟',
    'T-Shirts': '👚',
    'Home & Living': '🏠',
    'Furniture': '🛋️',
    'Sports': '⚽',
    'Running': '🏃',
    'Yoga': '🧘',
    'Brands': '🏆',
  };
  return icons[categoryName] || '🛍️';
};
