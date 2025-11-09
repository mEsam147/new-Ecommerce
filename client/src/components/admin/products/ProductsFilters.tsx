// components/admin/products/ProductsFilters.tsx
'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Product, ProductFilters } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductsFiltersProps {
  filters: ProductFilters;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  onSearch: (searchTerm: string) => void;
  products: Product[];
  categories: { label: string; value: string }[];
  isLoading?: boolean;
}

export function ProductsFilters({
  filters,
  onFilterChange,
  onSearch,
  products,
  categories,
  isLoading = false
}: ProductsFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get unique brands for filters
  const brands = useMemo(() => {
    return [...new Set(products.map(p => p.brand).filter(Boolean))];
  }, [products]);

  const activeFiltersCount = useMemo(() => {
    return Object.keys(filters).filter(key =>
      key !== 'page' && key !== 'limit' && key !== 'sort' &&
      filters[key as keyof ProductFilters] !== undefined
    ).length;
  }, [filters]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    onFilterChange({ [key]: value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      search: undefined,
      category: undefined,
      brand: undefined,
      isActive: undefined,
      inStock: undefined,
      lowStock: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      isFeatured: undefined
    });
    setSearchTerm('');
    setIsFilterOpen(false);
  };

  const clearFilter = (key: keyof ProductFilters) => {
    onFilterChange({ [key]: undefined });
  };

  const getStockFilterValue = () => {
    if (filters.lowStock) return 'low_stock';
    if (filters.inStock === false) return 'out_of_stock';
    if (filters.inStock === true) return 'in_stock';
    return 'all';
  };

  const handleStockFilterChange = (value: string) => {
    if (value === 'low_stock') {
      onFilterChange({ lowStock: true, inStock: undefined });
    } else if (value === 'out_of_stock') {
      onFilterChange({ inStock: false, lowStock: undefined });
    } else if (value === 'in_stock') {
      onFilterChange({ inStock: true, lowStock: undefined });
    } else {
      onFilterChange({ inStock: undefined, lowStock: undefined });
    }
  };

  // Safe category value handling
  const getSafeCategoryValue = () => {
    return filters.category || 'all';
  };

  const handleCategoryChange = (value: string) => {
    handleFilterChange('category', value === 'all' ? undefined : value);
  };

  // Safe status value handling
  const getSafeStatusValue = () => {
    if (filters.isActive === undefined) return 'all';
    return filters.isActive ? 'active' : 'inactive';
  };

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      handleFilterChange('isActive', undefined);
    } else {
      handleFilterChange('isActive', value === 'active');
    }
  };

  // Safe brand value handling
  const getSafeBrandValue = () => {
    return filters.brand || 'all';
  };

  const handleBrandChange = (value: string) => {
    handleFilterChange('brand', value === 'all' ? undefined : value);
  };

  return (
    <div className="space-y-4">
      {/* Search and Main Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search products by name, SKU, category, or brand..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={getSafeCategoryValue()}
            onValueChange={handleCategoryChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={getStockFilterValue()}
            onValueChange={handleStockFilterChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={getSafeStatusValue()}
            onValueChange={handleStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Advanced Filters</h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-auto p-0 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                      value={getSafeBrandValue()}
                      onValueChange={handleBrandChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="minPrice">Min Price</Label>
                      <Input
                        id="minPrice"
                        type="number"
                        placeholder="0"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPrice">Max Price</Label>
                      <Input
                        id="maxPrice"
                        type="number"
                        placeholder="1000"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={filters.isFeatured === true}
                      onCheckedChange={(checked) => handleFilterChange('isFeatured', checked ? true : undefined)}
                    />
                    <Label htmlFor="featured">Featured Only</Label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{filters.search}"
                <button
                  onClick={() => clearFilter('search')}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {filters.category}
                <button
                  onClick={() => clearFilter('category')}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.brand && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Brand: {filters.brand}
                <button
                  onClick={() => clearFilter('brand')}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.isActive !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {filters.isActive ? 'Active' : 'Inactive'}
                <button
                  onClick={() => clearFilter('isActive')}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.isFeatured && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Featured Only
                <button
                  onClick={() => clearFilter('isFeatured')}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Price: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                <button
                  onClick={() => {
                    clearFilter('minPrice');
                    clearFilter('maxPrice');
                  }}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.inStock !== undefined || filters.lowStock) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Stock: {getStockFilterValue().replace('_', ' ')}
                <button
                  onClick={() => {
                    clearFilter('inStock');
                    clearFilter('lowStock');
                  }}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
