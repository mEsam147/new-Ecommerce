// components/shop/ProductGrid.tsx
'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/types';
import ProductCard from '../common/ProductCard';
import { SearchX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isFiltering?: boolean;
  isSearching?: boolean; // Add search loading state
  searchQuery?: string;
  totalProducts?: number;
  showViewToggle?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  isFiltering = false,
  isSearching = false,
  searchQuery,
  totalProducts,
  showViewToggle = false,
  viewMode = 'grid',
  onViewModeChange,
  className
}) => {
  // Show loading skeletons for initial load
  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show search loading state
  if (isSearching) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center py-12 min-h-screen">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Searching products...
          </h3>
          <p className="text-gray-600 text-sm">
            Finding results for "{searchQuery}"
          </p>
        </div>
      </div>
    );
  }

  if (!isLoading && !isSearching && (!products || products.length === 0)) {
    return (
      <div className={className}>
        <div className="text-center py-12">
          <SearchX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No products found' : 'No products available'}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {searchQuery
              ? `No results for "${searchQuery}". Try different keywords.`
              : 'Check back later for new products.'
            }
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => window.location.reload()}>
              Clear Search
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Products Grid */}
      <div className={
        viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          : "grid grid-cols-1 gap-4"
      }>
        {products.map((product, index) => (
          <ProductCard
            key={product._id || `product-${index}`}
            product={product}
            className={
              viewMode === 'list'
                ? "flex flex-row items-stretch h-32"
                : undefined
            }
          />
        ))}
      </div>

      {/* Filter Loading State */}
      {isFiltering && !isSearching && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3 text-blue-600">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-medium">Applying filters...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
