// components/shop/ShopFilters.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PriceRangeSlider, PriceRange } from '@/components/ui/PriceRangeSlider';
import { cn } from '@/lib/utils';
import { Check, FileSliders, X } from 'lucide-react';
import { FiSliders } from 'react-icons/fi';

interface Filters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
}

interface ShopFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  isLoading?: boolean;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  filters,
  onFilterChange,
  isLoading = false,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState<PriceRange>({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 1000
  });

  // Sync local price range with filters
  useEffect(() => {
    setLocalPriceRange({
      min: filters.minPrice || 0,
      max: filters.maxPrice || 1000
    });
  }, [filters.minPrice, filters.maxPrice]);

  const colors = [
    { name: 'Black', value: 'black', class: 'bg-black' },
    { name: 'White', value: 'white', class: 'bg-white border border-gray-300' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-400' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
    { name: 'Gray', value: 'gray', class: 'bg-gray-500' },
    { name: 'Brown', value: 'brown', class: 'bg-amber-800' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  const categories = [
    'All Categories',
    'Electronics',
    'Fashion',
    'Home & Living',
    'Beauty',
    'Sports',
    'Books',
    'Toys',
    'Automotive'
  ];

  const handlePriceRangeChange = (range: PriceRange) => {
    setLocalPriceRange(range);
    onFilterChange({
      minPrice: range.min,
      maxPrice: range.max
    });
  };

  const handleColorSelect = (color: string) => {
    const currentColors = filters.colors || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter(c => c !== color)
      : [...currentColors, color];

    onFilterChange({ colors: newColors });
  };

  const handleSizeSelect = (size: string) => {
    const currentSizes = filters.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];

    onFilterChange({ sizes: newSizes });
  };

  const handleCategorySelect = (category: string) => {
    onFilterChange({
      category: category === 'All Categories' ? '' : category
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      category: '',
      minPrice: 0,
      maxPrice: 1000,
      colors: [],
      sizes: [],
    });
    setLocalPriceRange({ min: 0, max: 1000 });
  };

  const activeFiltersCount = [
    filters.category ? 1 : 0,
    (filters.minPrice && filters.minPrice > 0) || (filters.maxPrice && filters.maxPrice < 1000) ? 1 : 0,
    filters.colors?.length || 0,
    filters.sizes?.length || 0,
  ].reduce((a, b) => a + b, 0);

  const FilterSection = ({
    title,
    children,
    className
  }: {
    title: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-semibold text-foreground text-base">{title}</h3>
      {children}
    </div>
  );

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Active Filters Badge */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
          <span className="text-sm font-medium text-foreground">
            {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Categories */}
      <FilterSection title="Categories">
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                filters.category === (category === 'All Categories' ? '' : category)
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <PriceRangeSlider
          priceRange={{ min: 0, max: 1000 }}
          selectedRange={localPriceRange}
          onRangeChange={handlePriceRangeChange}
          showApplyButton={false}
          showClearButton={false}
          className="px-1"
        />
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Colors">
        <div className="grid grid-cols-5 gap-3">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorSelect(color.value)}
              className={cn(
                "group relative aspect-square rounded-lg flex items-center justify-center",
                "transition-all duration-200 hover:scale-110 active:scale-95",
                color.class,
                "border-2 border-transparent",
                filters.colors?.includes(color.value)
                  ? "ring-2 ring-primary ring-offset-2 scale-110"
                  : "hover:ring-2 hover:ring-primary/50 hover:ring-offset-2"
              )}
              title={color.name}
            >
              {filters.colors?.includes(color.value) && (
                <Check className="w-3 h-3 text-white drop-shadow-md" />
              )}

              {/* Tooltip on hover */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                  {color.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Sizes">
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeSelect(size)}
              className={cn(
                "px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:scale-105 active:scale-95",
                filters.sizes?.includes(size)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-background rounded-2xl border p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <>
      {/* Mobile Filter Dialog */}
      <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="lg:hidden w-full flex items-center justify-center gap-2 h-11"
          >
            <FileSliders className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-1 h-5 min-w-5 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">Filters</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-2">
            <FilterContent />
          </ScrollArea>

          <div className="p-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex-1"
                disabled={activeFiltersCount === 0}
              >
                Clear All
              </Button>
              <Button
                onClick={() => setIsMobileOpen(false)}
                className="flex-1"
              >
                Show Results
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Desktop Filters */}
      <div className="hidden lg:block bg-background rounded-2xl border p-6 space-y-6  ">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiSliders className="text-lg text-muted-foreground" />
            <h2 className="font-bold text-foreground text-lg">Filters</h2>
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              Clear all
            </Button>
          )}
        </div>

        <FilterContent />
      </div>
    </>
  );
};

export default ShopFilters;
