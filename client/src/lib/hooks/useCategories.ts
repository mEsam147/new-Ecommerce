// lib/hooks/useCategories.ts
import { useGetCategoriesQuery } from '@/lib/services/categoriesApi';
import { Category, NavMenuItem } from '@/types/navbar.types';

export const useCategories = () => {
  // This will use the cached data and only fetch once per 5 minutes
  const { data: categoriesData, isLoading, error, refetch } = useGetCategoriesQuery(undefined, {
    // Optional: You can add more specific caching options here
    refetchOnMountOrArgChange: false, // Don't refetch when component mounts if data exists
    refetchOnFocus: false, // Don't refetch when window gains focus
    refetchOnReconnect: false, // Don't refetch when regaining network connection
  });

  const transformCategoriesToNavMenu = (categories: Category[]): NavMenuItem[] => {
    const mainCategories = categories.filter(cat => !cat.parent);

    return mainCategories.map(category => ({
      id: category._id,
      label: category.name,
      type: 'MenuList',
      url: `/shop?category=${category.slug}`,
      description: category.description,
      category: category,
      children: categories
        .filter(subCat => subCat.parent === category._id)
        .map(subCategory => ({
          id: subCategory._id,
          label: subCategory.name,
          type: 'MenuItem',
          url: `/shop?category=${subCategory.slug}`,
          description: subCategory.description,
          category: subCategory,
        })),
    }));
  };

  const navMenu: NavMenuItem[] = [
    ...transformCategoriesToNavMenu(categoriesData?.data || []),
    {
      id: 'sale',
      type: 'MenuItem',
      label: 'On Sale',
      url: '/shop?onSale=true',
      children: [],
    },
    {
      id: 'new-arrivals',
      type: 'MenuItem',
      label: 'New Arrivals',
      url: '/shop?newArrivals=true',
      children: [],
    },
    {
      id: 'brands',
      type: 'MenuItem',
      label: 'Brands',
      url: '/shop#brands',
      children: [],
    },
  ];

  return {
    categories: categoriesData?.data || [],
    navMenu,
    isLoading,
    error,
    refetch, // Optional: if you need to manually refetch
  };
};
