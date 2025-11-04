// components/shop/ShopHeader.tsx
'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ShopHeaderProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  totalProducts: number;
  showingProducts: number;
  currentPage: number;
  isLoading: boolean;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  filters,
  onFilterChange,
  totalProducts,
  showingProducts,
  currentPage,
  isLoading,
}) => {
  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
      {/* Results Count */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {filters.category ? `${filters.category} Products` : 'All Products'}
        </h1>
        <p className="text-gray-600">
          Showing {showingProducts} of {totalProducts} products
          {filters.search && ` for "${filters.search}"`}
        </p>
      </div>

      {/* Sort & View Options */}
      <div className="flex items-center gap-4">
        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="w-48 bg-white border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;
