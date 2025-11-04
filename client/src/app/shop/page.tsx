
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useGetProductsQuery } from '@/lib/services/productsApi';
import ShopHeader from '@/components/shop-page/ShopHeader';
import ProductGrid from '@/components/shop-page/ProductGrid';
import ShopFilters from '@/components/shop-page/ShopFilters';
import Pagination from '@/components/shop-page/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get filters from URL search params
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const sortBy = searchParams.get('sort') as any || 'popular';

  // Local filter state
  const [filters, setFilters] = useState({
    category,
    search,
    minPrice: 0,
    maxPrice: 1000,
    colors: [] as string[],
    sizes: [] as string[],
    sortBy,
    page,
    limit: 12,
  });

  // Debounce search to avoid too many requests
  const debouncedSearch = useDebounce(filters.search, 300);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.page > 1) params.set('page', filters.page.toString());
    if (filters.sortBy !== 'popular') params.set('sort', filters.sortBy);

    // Replace URL without causing navigation
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  // Fetch products with current filters
  const { data, isLoading, isFetching, error } = useGetProductsQuery({
    ...filters,
    search: debouncedSearch,
  });

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 when filters change
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Loading sidebar */}
            <div className="lg:w-80">
              <Skeleton className="h-12 w-full rounded-xl mb-4" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>

            {/* Loading content */}
            <div className="flex-1">
              <Skeleton className="h-12 w-full rounded-xl mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <ShopFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              isLoading={isFetching}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <ShopHeader
              filters={filters}
              onFilterChange={handleFilterChange}
              totalProducts={data?.pagination.total || 0}
              showingProducts={data?.data.length || 0}
              currentPage={filters.page}
              isLoading={isFetching}
            />

            {/* Loading overlay */}
            {isFetching && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid
              products={data?.data || []}
              isLoading={isFetching}
            />

            {/* Pagination */}
            {data?.pagination && data.pagination.pages > 1 && (
              <Pagination
                currentPage={data.pagination.page}
                totalPages={data.pagination.pages}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
