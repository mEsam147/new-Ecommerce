// lib/hooks/useFilterOptions.ts
'use client';

import { useGetFilterOptionsQuery } from '@/lib/services/productsApi';

// Fallback data in case API fails
const fallbackFilterOptions = {
  categories: [
    { name: 'Electronics', count: 0 },
    { name: 'Fashion', count: 0 },
    { name: 'Home', count: 0 },
    { name: 'Beauty', count: 0 },
    { name: 'Sports', count: 0 },
  ],
  brands: [
    { name: 'Nike', count: 0 },
    { name: 'Adidas', count: 0 },
    { name: 'Apple', count: 0 },
    { name: 'Samsung', count: 0 },
    { name: 'Sony', count: 0 },
  ],
  tags: [
    { name: 'New', count: 0 },
    { name: 'Sale', count: 0 },
    { name: 'Popular', count: 0 },
    { name: 'Featured', count: 0 },
  ],
  colors: [
    { name: 'red', count: 0 },
    { name: 'blue', count: 0 },
    { name: 'green', count: 0 },
    { name: 'black', count: 0 },
    { name: 'white', count: 0 },
  ],
  sizes: [
    { name: 'XS', count: 0 },
    { name: 'S', count: 0 },
    { name: 'M', count: 0 },
    { name: 'L', count: 0 },
    { name: 'XL', count: 0 },
    { name: 'XXL', count: 0 },
  ],
  priceRange: {
    min: 0,
    max: 1000,
  },
};

export const useFilterOptions = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
    isError
  } = useGetFilterOptionsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    // Optional: Skip the query if you want to conditionally fetch
    // skip: !shouldFetch,
  });

  // Use actual data if available, otherwise use fallback
  const filterOptions = data?.data || (isError ? fallbackFilterOptions : null);

  return {
    filterOptions,
    isLoading,
    error: error ?
      (typeof error === 'object' && 'data' in error
        ? (error.data as any)?.message || 'Failed to fetch filter options'
        : 'Failed to fetch filter options'
      ) : null,
    refetch,
    isError,
  };
};
