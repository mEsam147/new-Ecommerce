// // // lib/hooks/useProductFilters.ts
// // 'use client';

// // import { useState, useCallback, useMemo } from 'react';
// // import { useDebounce } from '@/lib/hooks/useDebounce';
// // import { useGetProductsQuery } from '@/lib/services/productsApi';
// // import { Product } from '@/types';

// // interface ProductFilters {
// //   category?: string;
// //   search?: string;
// //   minPrice?: number;
// //   maxPrice?: number;
// //   colors?: string[];
// //   sizes?: string[];
// //   tags?: string[];
// //   brand?: string[];
// //   sortBy?: string;
// //   page?: number;
// //   limit?: number;
// // }

// // interface UseProductFiltersProps {
// //   initialFilters?: Partial<ProductFilters>;
// //   debounceDelay?: number;
// // }

// // export const useProductFilters = ({
// //   initialFilters = {},
// //   debounceDelay = 300 // Faster debounce
// // }: UseProductFiltersProps = {}) => {
// //   const [filters, setFilters] = useState<ProductFilters>({
// //     page: 1,
// //     limit: 12,
// //     sortBy: 'popular',
// //     ...initialFilters
// //   });

// //   const [isFiltering, setIsFiltering] = useState(false);
// //   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

// //   // Faster debounce for better UX
// //   const debouncedFilters = useDebounce(filters, debounceDelay);

// //   // Optimized query with less frequent updates
// //   const {
// //     data: productsResponse,
// //     isLoading: productsLoading,
// //     isFetching: productsFetching,
// //     error: productsError,
// //   } = useGetProductsQuery(debouncedFilters, {
// //     refetchOnMountOrArgChange: true,
// //   });

// //   // Memoized products extraction
// //   const products = useMemo(() => {
// //     if (!productsResponse?.success || !productsResponse.data) {
// //       return [];
// //     }
// //     return Array.isArray(productsResponse.data) ? productsResponse.data : [];
// //   }, [productsResponse]);

// //   // Memoized pagination
// //   const pagination = useMemo(() => {
// //     return productsResponse?.pagination || {
// //       page: filters.page || 1,
// //       limit: filters.limit || 12,
// //       total: products.length,
// //       pages: Math.ceil(products.length / (filters.limit || 12))
// //     };
// //   }, [productsResponse, filters.page, filters.limit, products.length]);

// //   const totalProducts = pagination?.total || 0;
// //   const currentPage = pagination?.page || filters.page || 1;
// //   const totalPages = pagination?.pages || Math.ceil(totalProducts / (filters.limit || 12));
// //   const showingProducts = products.length;

// //   // Optimized filter change handler
// //   const handleFilterChange = useCallback((newFilters: Partial<ProductFilters>) => {
// //     setIsFiltering(true);

// //     const updatedFilters = {
// //       ...filters,
// //       ...newFilters,
// //       page: newFilters.category || newFilters.colors || newFilters.sizes ||
// //             newFilters.tags || newFilters.brand || newFilters.search ||
// //             newFilters.minPrice || newFilters.maxPrice ? 1 : (newFilters.page || filters.page)
// //     };

// //     setFilters(updatedFilters);

// //     // Shorter timeout for better UX
// //     setTimeout(() => setIsFiltering(false), 300);
// //   }, [filters]);

// //   // Clear all filters
// //   const clearAllFilters = useCallback(() => {
// //     setIsFiltering(true);
// //     setFilters({
// //       page: 1,
// //       limit: 12,
// //       sortBy: 'popular'
// //     });
// //     setTimeout(() => setIsFiltering(false), 300);
// //   }, []);

// //   // Manual page change
// //   const handlePageChange = useCallback((page: number) => {

// //     handleFilterChange({ page });
// //     window.scrollTo({
// //       behavior:"smooth",
// //       top:0
// //     })
// //   }, [handleFilterChange]);

// //   // Search handler
// //   const handleSearch = useCallback((searchTerm: string) => {
// //     handleFilterChange({
// //       search: searchTerm,
// //       page: 1
// //     });
// //   }, [handleFilterChange]);

// //   // Active filters
// //   const hasActiveFilters = useMemo(() => {
// //     return Boolean(
// //       filters.category ||
// //       filters.search ||
// //       filters.minPrice ||
// //       filters.maxPrice ||
// //       (filters.colors && filters.colors.length > 0) ||
// //       (filters.sizes && filters.sizes.length > 0) ||
// //       (filters.tags && filters.tags.length > 0) ||
// //       (filters.brand && filters.brand.length > 0) ||
// //       filters.sortBy !== 'popular'
// //     );
// //   }, [filters]);

// //   const activeFiltersCount = useMemo(() => {
// //     return [
// //       filters.category ? 1 : 0,
// //       (filters.minPrice && filters.minPrice > 0) || (filters.maxPrice && filters.maxPrice < 10000) ? 1 : 0,
// //       filters.colors?.length || 0,
// //       filters.sizes?.length || 0,
// //       filters.tags?.length || 0,
// //       filters.brand?.length || 0,
// //       filters.search ? 1 : 0,
// //     ].reduce((a, b) => a + b, 0);
// //   }, [filters]);

// //   return {
// //     // State
// //     filters,
// //     products,
// //     totalProducts,
// //     showingProducts,
// //     viewMode,
// //     currentPage,
// //     totalPages,
// //     pagination,

// //     // Loading states
// //     isLoading: productsLoading,
// //     isFetching: productsFetching,
// //     isFiltering,

// //     // Errors
// //     error: productsError,

// //     // Actions
// //     setFilters: handleFilterChange,
// //     setViewMode,
// //     clearAllFilters,
// //     handlePageChange,
// //     handleSearch,

// //     // Derived state
// //     hasActiveFilters,
// //     activeFiltersCount,
// //   };
// // };

// // lib/hooks/useProductFilters.ts
// 'use client';

// import { useState, useCallback, useMemo, useEffect } from 'react';
// import { useDebounce } from '@/lib/hooks/useDebounce';
// import { useGetProductsQuery } from '@/lib/services/productsApi';
// import { Product } from '@/types';

// interface ProductFilters {
//   category?: string;
//   search?: string;
//   minPrice?: number;
//   maxPrice?: number;
//   colors?: string[];
//   sizes?: string[];
//   tags?: string[];
//   brand?: string[];
//   sortBy?: string;
//   page?: number;
//   limit?: number;
// }

// interface UseProductFiltersProps {
//   initialFilters?: Partial<ProductFilters>;
//   debounceDelay?: number;
// }

// export const useProductFilters = ({
//   initialFilters = {},
//   debounceDelay = 300
// }: UseProductFiltersProps = {}) => {
//   const [filters, setFilters] = useState<ProductFilters>({
//     page: 1,
//     limit: 12,
//     sortBy: 'popular',
//     ...initialFilters
//   });

//   const [isFiltering, setIsFiltering] = useState(false);
//   const [isSearching, setIsSearching] = useState(false); // Add search loading state
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

//   // Separate debounce for search to show loading state
//   const debouncedFilters = useDebounce(filters, debounceDelay);

//   const {
//     data: productsResponse,
//     isLoading: productsLoading,
//     isFetching: productsFetching,
//     error: productsError,
//   } = useGetProductsQuery(debouncedFilters, {
//     refetchOnMountOrArgChange: true,
//   });

//   // Set searching state when search filter changes
//   useEffect(() => {
//     if (filters.search && filters.search.length > 0) {
//       setIsSearching(true);
//       const timer = setTimeout(() => setIsSearching(false), 500);
//       return () => clearTimeout(timer);
//     } else {
//       setIsSearching(false);
//     }
//   }, [filters.search]);

//   // Memoized products extraction
//   const products = useMemo(() => {
//     if (!productsResponse?.success || !productsResponse.data) {
//       return [];
//     }
//     return Array.isArray(productsResponse.data) ? productsResponse.data : [];
//   }, [productsResponse]);

//   // Memoized pagination
//   const pagination = useMemo(() => {
//     return productsResponse?.pagination || {
//       page: filters.page || 1,
//       limit: filters.limit || 12,
//       total: products.length,
//       pages: Math.ceil(products.length / (filters.limit || 12))
//     };
//   }, [productsResponse, filters.page, filters.limit, products.length]);

//   const totalProducts = pagination?.total || 0;
//   const currentPage = pagination?.page || filters.page || 1;
//   const totalPages = pagination?.pages || Math.ceil(totalProducts / (filters.limit || 12));
//   const showingProducts = products.length;

//   // Optimized filter change handler
//   const handleFilterChange = useCallback((newFilters: Partial<ProductFilters>) => {
//     const isSearchChange = 'search' in newFilters;

//     if (isSearchChange) {
//       setIsSearching(true);
//     } else {
//       setIsFiltering(true);
//     }

//     const updatedFilters = {
//       ...filters,
//       ...newFilters,
//       page: newFilters.category || newFilters.colors || newFilters.sizes ||
//             newFilters.tags || newFilters.brand || newFilters.search ||
//             newFilters.minPrice || newFilters.maxPrice ? 1 : (newFilters.page || filters.page)
//     };

//     setFilters(updatedFilters);

//     // Clear loading states after a short delay
//     setTimeout(() => {
//       if (isSearchChange) {
//         setIsSearching(false);
//       } else {
//         setIsFiltering(false);
//       }
//     }, 400);
//   }, [filters]);

//   // Clear all filters
//   const clearAllFilters = useCallback(() => {
//     setIsFiltering(true);
//     setIsSearching(false);
//     setFilters({
//       page: 1,
//       limit: 12,
//       sortBy: 'popular'
//     });
//     setTimeout(() => setIsFiltering(false), 300);
//   }, []);

//   // Manual page change
//   const handlePageChange = useCallback((page: number) => {
//     handleFilterChange({ page });
//     window.scrollTo({
//       behavior: "smooth",
//       top: 0
//     });
//   }, [handleFilterChange]);

//   // Search handler
//   const handleSearch = useCallback((searchTerm: string) => {
//     handleFilterChange({
//       search: searchTerm,
//       page: 1
//     });
//   }, [handleFilterChange]);

//   // Active filters
//   const hasActiveFilters = useMemo(() => {
//     return Boolean(
//       filters.category ||
//       filters.search ||
//       filters.minPrice ||
//       filters.maxPrice ||
//       (filters.colors && filters.colors.length > 0) ||
//       (filters.sizes && filters.sizes.length > 0) ||
//       (filters.tags && filters.tags.length > 0) ||
//       (filters.brand && filters.brand.length > 0) ||
//       filters.sortBy !== 'popular'
//     );
//   }, [filters]);

//   const activeFiltersCount = useMemo(() => {
//     return [
//       filters.category ? 1 : 0,
//       (filters.minPrice && filters.minPrice > 0) || (filters.maxPrice && filters.maxPrice < 10000) ? 1 : 0,
//       filters.colors?.length || 0,
//       filters.sizes?.length || 0,
//       filters.tags?.length || 0,
//       filters.brand?.length || 0,
//       filters.search ? 1 : 0,
//     ].reduce((a, b) => a + b, 0);
//   }, [filters]);

//   return {
//     // State
//     filters,
//     products,
//     totalProducts,
//     showingProducts,
//     viewMode,
//     currentPage,
//     totalPages,
//     pagination,

//     // Loading states
//     isLoading: productsLoading,
//     isFetching: productsFetching,
//     isFiltering,
//     isSearching, // Export search loading state

//     // Errors
//     error: productsError,

//     // Actions
//     setFilters: handleFilterChange,
//     setViewMode,
//     clearAllFilters,
//     handlePageChange,
//     handleSearch,

//     // Derived state
//     hasActiveFilters,
//     activeFiltersCount,
//   };
// };

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useGetProductsQuery } from '@/lib/services/productsApi';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  brand?: string[];
  sort?: string; // Changed from sortBy to sort to match backend
  page?: number;
  limit?: number;
  featured?: boolean;
}

interface UseProductFiltersProps {
  initialFilters?: Partial<ProductFilters>;
  debounceDelay?: number;
}

export const useProductFilters = ({
  initialFilters = {},
  debounceDelay = 300
}: UseProductFiltersProps = {}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Parse URL parameters into filter state
  const parseUrlParams = (): ProductFilters => {
    const params = new URLSearchParams(searchParams);
    const filters: ProductFilters = {
      page: 1,
      limit: 12,
      sort: 'popular', // Changed from sortBy to sort
      ...initialFilters
    };

    // Get sort from URL - parameter name is 'sort'
    const sort = params.get('sort');
    if (sort && ['popular', 'newest', 'price-low', 'price-high', 'rating'].includes(sort)) {
      filters.sort = sort;
    }

    // Get featured from URL
    const featured = params.get('featured');
    if (featured !== null) {
      filters.featured = featured === 'true';
    }

    // Get category from URL
    const category = params.get('category');
    if (category) {
      filters.category = category;
    }

    // Get search from URL
    const search = params.get('search');
    if (search) {
      filters.search = search;
    }

    // Get page from URL
    const page = params.get('page');
    if (page && !isNaN(Number(page))) {
      filters.page = Number(page);
    }

    // Get price filters from URL
    const minPrice = params.get('minPrice');
    if (minPrice && !isNaN(Number(minPrice))) {
      filters.minPrice = Number(minPrice);
    }

    const maxPrice = params.get('maxPrice');
    if (maxPrice && !isNaN(Number(maxPrice))) {
      filters.maxPrice = Number(maxPrice);
    }

    // Get array filters from URL
    const colors = params.get('colors');
    if (colors) {
      filters.colors = colors.split(',');
    }

    const sizes = params.get('sizes');
    if (sizes) {
      filters.sizes = sizes.split(',');
    }

    const tags = params.get('tags');
    if (tags) {
      filters.tags = tags.split(',');
    }

    const brand = params.get('brand');
    if (brand) {
      filters.brand = brand.split(',');
    }

    return filters;
  };

  const [filters, setFilters] = useState<ProductFilters>(parseUrlParams());
  const [isFiltering, setIsFiltering] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Update URL when filters change
  const updateUrlParams = useCallback((filters: ProductFilters) => {
    const params = new URLSearchParams();

    // Only set params that are different from defaults
    if (filters.sort && filters.sort !== 'popular') {
      params.set('sort', filters.sort); // Parameter name is 'sort'
    }

    if (filters.featured) {
      params.set('featured', 'true');
    }

    if (filters.category) {
      params.set('category', filters.category);
    }

    if (filters.search) {
      params.set('search', filters.search);
    }

    if (filters.page && filters.page > 1) {
      params.set('page', filters.page.toString());
    }

    if (filters.minPrice && filters.minPrice > 0) {
      params.set('minPrice', filters.minPrice.toString());
    }

    if (filters.maxPrice && filters.maxPrice < 10000) {
      params.set('maxPrice', filters.maxPrice.toString());
    }

    if (filters.colors && filters.colors.length > 0) {
      params.set('colors', filters.colors.join(','));
    }

    if (filters.sizes && filters.sizes.length > 0) {
      params.set('sizes', filters.sizes.join(','));
    }

    if (filters.tags && filters.tags.length > 0) {
      params.set('tags', filters.tags.join(','));
    }

    if (filters.brand && filters.brand.length > 0) {
      params.set('brand', filters.brand.join(','));
    }

    // Update URL without page refresh
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(`${pathname}${newUrl}`, { scroll: false });
  }, [pathname, router]);

  // Separate debounce for search to show loading state
  const debouncedFilters = useDebounce(filters, debounceDelay);

  const {
    data: productsResponse,
    isLoading: productsLoading,
    isFetching: productsFetching,
    error: productsError,
  } = useGetProductsQuery(debouncedFilters, {
    refetchOnMountOrArgChange: true,
  });

  // Update URL when filters change
  useEffect(() => {
    updateUrlParams(filters);
  }, [filters, updateUrlParams]);

  // Set searching state when search filter changes
  useEffect(() => {
    if (filters.search && filters.search.length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [filters.search]);

  // Memoized products extraction
  const products = useMemo(() => {
    if (!productsResponse?.success || !productsResponse.data) {
      return [];
    }
    return Array.isArray(productsResponse.data) ? productsResponse.data : [];
  }, [productsResponse]);

  // Memoized pagination
  const pagination = useMemo(() => {
    return productsResponse?.pagination || {
      page: filters.page || 1,
      limit: filters.limit || 12,
      total: products.length,
      pages: Math.ceil(products.length / (filters.limit || 12))
    };
  }, [productsResponse, filters.page, filters.limit, products.length]);

  const totalProducts = pagination?.total || 0;
  const currentPage = pagination?.page || filters.page || 1;
  const totalPages = pagination?.pages || Math.ceil(totalProducts / (filters.limit || 12));
  const showingProducts = products.length;

  // Optimized filter change handler
  const handleFilterChange = useCallback((newFilters: Partial<ProductFilters>) => {
    const isSearchChange = 'search' in newFilters;

    if (isSearchChange) {
      setIsSearching(true);
    } else {
      setIsFiltering(true);
    }

    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: newFilters.category || newFilters.colors || newFilters.sizes ||
            newFilters.tags || newFilters.brand || newFilters.search ||
            newFilters.minPrice || newFilters.maxPrice || newFilters.featured ? 1 : (newFilters.page || filters.page)
    };

    setFilters(updatedFilters);

    // Clear loading states after a short delay
    setTimeout(() => {
      if (isSearchChange) {
        setIsSearching(false);
      } else {
        setIsFiltering(false);
      }
    }, 400);
  }, [filters]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setIsFiltering(true);
    setIsSearching(false);
    const clearedFilters = {
      page: 1,
      limit: 12,
      sort: 'popular', // Changed from sortBy to sort
      featured: false,
    };
    setFilters(clearedFilters);
    setTimeout(() => setIsFiltering(false), 300);
  }, []);

  // Manual page change
  const handlePageChange = useCallback((page: number) => {
    handleFilterChange({ page });
    window.scrollTo({
      behavior: "smooth",
      top: 0
    });
  }, [handleFilterChange]);

  // Search handler
  const handleSearch = useCallback((searchTerm: string) => {
    handleFilterChange({
      search: searchTerm,
      page: 1
    });
  }, [handleFilterChange]);

  // Active filters
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.category ||
      filters.search ||
      filters.minPrice ||
      filters.maxPrice ||
      (filters.colors && filters.colors.length > 0) ||
      (filters.sizes && filters.sizes.length > 0) ||
      (filters.tags && filters.tags.length > 0) ||
      (filters.brand && filters.brand.length > 0) ||
      filters.featured ||
      filters.sort !== 'popular' // Changed from sortBy to sort
    );
  }, [filters]);

  const activeFiltersCount = useMemo(() => {
    return [
      filters.category ? 1 : 0,
      (filters.minPrice && filters.minPrice > 0) || (filters.maxPrice && filters.maxPrice < 10000) ? 1 : 0,
      filters.colors?.length || 0,
      filters.sizes?.length || 0,
      filters.tags?.length || 0,
      filters.brand?.length || 0,
      filters.search ? 1 : 0,
      filters.featured ? 1 : 0,
    ].reduce((a, b) => a + b, 0);
  }, [filters]);

  return {
    // State
    filters,
    products,
    totalProducts,
    showingProducts,
    viewMode,
    currentPage,
    totalPages,
    pagination,

    // Loading states
    isLoading: productsLoading,
    isFetching: productsFetching,
    isFiltering,
    isSearching,

    // Errors
    error: productsError,

    // Actions
    setFilters: handleFilterChange,
    setViewMode,
    clearAllFilters,
    handlePageChange,
    handleSearch,

    // Derived state
    hasActiveFilters,
    activeFiltersCount,
  };
};
