'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import PriceFilter from './PriceFilter';
import TagsFilter from './TagsFilter';
import BrandFilter from './BrandFilter';
import ColorFilter from './ColorFilter';
import SizeFilter from './SizeFilter';
import CategoryFilter from './CategoryFilter';
import SearchFilter from './SearchFilter';
import FeaturedFilter from './FeaturedFilter';
import { cn } from '@/lib/utils';
import { Filter, X, RotateCcw, Check } from 'lucide-react';
import { useFilterOptions } from '@/lib/hooks/useFilterOptions';

interface Filters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  brand?: string[];
  sort?: string; // Changed from sortBy to sort
  page?: number;
  limit?: number;
  featured?: boolean;
}

interface ShopFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  isFiltering?: boolean;
  isSearching?: boolean;
  isMobile?: boolean;
}

const defaultFilterOptions = {
  categories: ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'],
  brands: ['Nike', 'Adidas', 'Apple', 'Samsung', 'Sony'],
  tags: ['New', 'Sale', 'Popular', 'Featured'],
  colors: ['red', 'blue', 'green', 'black', 'white'],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
};

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  filters,
  onFilterChange,
  isFiltering = false,
  isSearching = false,
  isMobile = false,
}) => {
  const [localFilters, setLocalFilters] = useState<Partial<Filters>>(filters);
  const { filterOptions } = useFilterOptions();
  const filterContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle search changes immediately with debounce
  const handleSearchChange = useCallback((search: string) => {
    const newFilters = { ...localFilters, search, page: 1 };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  }, [localFilters, onFilterChange]);

  // Handle other filter changes
  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    const updatedFilters = { ...localFilters, ...newFilters, page: 1 };
    setLocalFilters(updatedFilters);

    // For mobile, apply filters immediately for better UX
    if (isMobile) {
      onFilterChange(updatedFilters);
    }
  }, [localFilters, isMobile, onFilterChange]);

  const handleApplyFilters = useCallback(() => {
    onFilterChange({ ...localFilters, page: 1 });
  }, [localFilters, onFilterChange]);

  // Global Enter key handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && filterContainerRef.current?.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' || (target as HTMLInputElement).type !== 'text') {
          handleApplyFilters();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [localFilters]);

  // Get available options with limits
  const availableCategories = filterOptions?.categories?.slice(0, 8).map(cat => cat.name) || defaultFilterOptions.categories;
  const availableBrands = filterOptions?.brands?.slice(0, 8).map(brand => brand.name) || defaultFilterOptions.brands;
  const availableTags = filterOptions?.tags?.slice(0, 6).map(tag => tag.name) || defaultFilterOptions.tags;
  const availableColors = filterOptions?.colors?.slice(0, 8).map(color => color.name) || defaultFilterOptions.colors;
  const availableSizes = filterOptions?.sizes?.slice(0, 6).map(size => size.name) || defaultFilterOptions.sizes;

  // Clear all filters
  const handleClearAll = useCallback(() => {
    const clearedFilters = {
      category: '',
      search: '',
      minPrice: undefined,
      maxPrice: undefined,
      colors: [],
      sizes: [],
      tags: [],
      brand: [],
      featured: false,
      page: 1
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  }, [onFilterChange]);

  // Active filters count - UPDATED with featured
  const activeFiltersCount = [
    localFilters.category ? 1 : 0,
    (localFilters.minPrice && localFilters.minPrice > 0) || (localFilters.maxPrice && localFilters.maxPrice < 10000) ? 1 : 0,
    localFilters.colors?.length || 0,
    localFilters.sizes?.length || 0,
    localFilters.tags?.length || 0,
    localFilters.brand?.length || 0,
    localFilters.search ? 1 : 0,
    localFilters.featured ? 1 : 0,
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
    <div className={cn("space-y-3", className)}>
      <h3 className="font-semibold text-gray-900 text-sm">
        {title}
      </h3>
      {children}
    </div>
  );

  const FilterContent = () => (
    <div ref={filterContainerRef} className="space-y-6">
      {/* Header - Only show on desktop or when not in mobile dialog */}
      {!isMobile && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-900">Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-gray-500 hover:text-gray-700 h-7 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}

      <div className={cn("space-y-8", isMobile && "px-2")}>
        {/* Search Filter */}
        <FilterSection title="Search">
          <SearchFilter
            searchQuery={localFilters.search || ''}
            onSearchChange={handleSearchChange}
            placeholder="Search products..."
            isSearching={isSearching}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Search updates automatically
            </p>
            {isSearching && (
              <div className="flex items-center gap-1 text-blue-600 text-xs">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Searching...</span>
              </div>
            )}
          </div>
        </FilterSection>

        {/* Featured Filter */}
        <FilterSection title="Featured">
          <FeaturedFilter
            featured={localFilters.featured || false}
            onFeaturedChange={(featured) => handleFilterChange({ featured })}
          />
        </FilterSection>

        {/* Categories */}
        <FilterSection title="Category">
          <CategoryFilter
            categories={availableCategories}
            selectedCategory={localFilters.category || 'All'}
            onCategoryChange={(category) => handleFilterChange({ category })}
          />
        </FilterSection>

        {/* Price Filter */}
        <FilterSection title="Price Range">
          <PriceFilter
            minPrice={localFilters.minPrice}
            maxPrice={localFilters.maxPrice}
            onPriceChange={(minPrice, maxPrice) => handleFilterChange({ minPrice, maxPrice })}
            isFiltering={isFiltering}
          />
        </FilterSection>

        {/* Brands Filter */}
        <FilterSection title="Brands">
          <BrandFilter
            availableBrands={availableBrands}
            selectedBrands={localFilters.brand || []}
            onBrandsChange={(brand) => handleFilterChange({ brand })}
          />
        </FilterSection>

        {/* Colors Filter */}
        <FilterSection title="Colors">
          <ColorFilter
            availableColors={availableColors}
            selectedColors={localFilters.colors || []}
            onColorsChange={(colors) => handleFilterChange({ colors })}
            variant="compact"
          />
        </FilterSection>

        {/* Sizes Filter */}
        <FilterSection title="Sizes">
          <SizeFilter
            availableSizes={availableSizes}
            selectedSizes={localFilters.sizes || []}
            onSizesChange={(sizes) => handleFilterChange({ sizes })}
            variant="compact"
          />
        </FilterSection>

        {/* Tags Filter */}
        <FilterSection title="Tags">
          <TagsFilter
            availableTags={availableTags}
            selectedTags={localFilters.tags || []}
            onTagsChange={(tags) => handleFilterChange({ tags })}
          />
        </FilterSection>
      </div>

      {/* Apply Filters Button - Only show on desktop */}
      {!isMobile && (
        <div className="pt-4 border-t">
          <Button
            onClick={handleApplyFilters}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isFiltering || isSearching}
          >
            <Check className="w-4 h-4 mr-2" />
            {isFiltering || isSearching ? 'Applying...' : 'Apply Filters'}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Search works automatically • Press Enter for other filters
          </p>
        </div>
      )}
    </div>
  );

  // Mobile version - just the filter content
  if (isMobile) {
    return (
      <ScrollArea className="h-full px-2">
        <FilterContent />
      </ScrollArea>
    );
  }

  // Desktop version
  return (
    <div className="bg-white rounded-lg border p-4">
      <FilterContent />
    </div>
  );
};

export default ShopFilters;
