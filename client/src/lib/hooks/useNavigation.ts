// hooks/useNavigation.ts
import { useGetCategoriesQuery, useGetTopCategoriesQuery } from '@/lib/services/categoriesApi';
import { useGetFeaturedBrandsQuery } from '../services/brandApi';
import { useGetTrendingProductsQuery } from '../services/productsApi';
import { Category, NavMenuItem } from '@/types';

export const useNavigation = () => {
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: topCategoriesData, isLoading: topCategoriesLoading } = useGetTopCategoriesQuery({ limit: 6 });
  const { data: brandsData, isLoading: brandsLoading } = useGetFeaturedBrandsQuery({ limit: 8 });
  const { data: trendingData, isLoading: trendingLoading } = useGetTrendingProductsQuery({ limit: 4 });

  const categories = categoriesData?.data || [];
  const topCategories = topCategoriesData?.data || [];
  const featuredBrands = brandsData?.data || [];
  const trendingProducts = trendingData?.data || [];
  console.log("trendingProducts" , trendingProducts)

  const transformCategoriesToNav = (categories: Category[]): NavMenuItem[] => {
    const mainCategories = categories.filter(cat => !cat.parent && cat.isActive)
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.productsCount || 0) - (a.productsCount || 0);
      })
      .slice(0, 6);

    const shopChildren: NavMenuItem[] = [
      // Top Categories Section
      {
        id: 'featured-header',
        type: 'link',
        label: 'Popular Categories',
        url: '/categories',
        featured: true
      },
      ...mainCategories.map(category => ({
        id: category._id,
        label: category.name,
        type: 'link',
        url: `/category/${category.slug}`,
        description: category.description || `Explore ${category.name}`,
        image: category.image?.url,
        featured: category.featured,
        productsCount: category.productsCount,
      })),
      {
        id: 'view-all',
        type: 'link',
        label: 'All Categories →',
        url: '/categories',
        featured: true
      },
    ];

    return [
      {
        id: 'shop',
        type: 'dropdown',
        label: 'Shop',
        url: '/shop',
        children: shopChildren,
      }
    ];
  };

  const navMenu: NavMenuItem[] = transformCategoriesToNav(categories);

  return {
    navMenu,
    isLoading: categoriesLoading || brandsLoading || trendingLoading || topCategoriesLoading,
    featuredBrands,
    topCategories,
    trendingProducts,
    allCategories: categories,
  };
};
