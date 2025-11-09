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
import { Search, Star } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-40" />
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      {/* Results Count */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">
          {filters.featured ? (
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Featured Products
            </span>
          ) : filters.category ? (
            `${filters.category}`
          ) : (
            'All Products'
          )}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          <span>{showingProducts} of {totalProducts} products</span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
              <Search className="w-3 h-3" />
              "{filters.search}"
            </span>
          )}
          {filters.featured && (
            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
              <Star className="w-3 h-3 fill-yellow-500" />
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 whitespace-nowrap">Sort:</span>
        <Select
          value={filters.sort} // Changed from filters.sortBy to filters.sort
          onValueChange={(value) => onFilterChange({ sort: value })} // Changed from sortBy to sort
        >
          <SelectTrigger className="w-40 bg-white">
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
  );
};

export default ShopHeader;
