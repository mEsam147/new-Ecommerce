// app/shop/page.tsx
'use client';

import React, { useState } from 'react';
import { ShopHeader } from '@/components/shop-page/ShopHeader';
import { ProductGrid } from '@/components/shop-page/ProductGrid';
import { ShopFilters } from '@/components/shop-page/ShopFilters';
import { useProductFilters } from '@/lib/hooks/useProductFilters';
import Pagination from '@/components/shop-page/Pagination';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ShopPage() {
  const {
    filters,
    products,
    totalProducts,
    showingProducts,
    viewMode,
    isLoading,
    isFiltering,
    isSearching,
    setFilters,
    setViewMode,
    clearAllFilters,
    currentPage,
    totalPages,
    handlePageChange,
    hasActiveFilters,
    activeFiltersCount,
  } = useProductFilters();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-4">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4">
              <ShopFilters
                filters={filters}
                onFilterChange={setFilters}
                isFiltering={isFiltering}
                isSearching={isSearching}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Dialog */}
            <Dialog open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
              <div className="lg:hidden flex items-center gap-2 mb-4">
                <DialogTrigger asChild>
                  <Button className="flex items-center w-full gap-2" size="sm">
                    <Filter className="w-4 h-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    size="sm"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <DialogContent className="sm:max-w-[425px] h-[90vh] p-0 flex flex-col">
                <DialogHeader className="px-6 py-4 border-b bg-white">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-lg font-semibold">Filters</DialogTitle>
                    <div className="flex items-center gap-2">
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          onClick={clearAllFilters}
                          size="sm"
                          className="text-xs"
                        >
                          Clear All
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="h-8 w-8"
                      >
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                  <ShopFilters
                    filters={filters}
                    onFilterChange={(newFilters) => {
                      setFilters(newFilters);
                      // Auto-close dialog when filters are applied on mobile
                      if (newFilters.category || newFilters.search || newFilters.colors?.length || newFilters.sizes?.length) {
                        setIsMobileFiltersOpen(false);
                      }
                    }}
                    isFiltering={isFiltering}
                    isSearching={isSearching}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <ShopHeader
              filters={filters}
              onFilterChange={setFilters}
              totalProducts={totalProducts}
              showingProducts={showingProducts}
              currentPage={currentPage}
              isLoading={isLoading}
            />

            <ProductGrid
              products={products}
              isLoading={isLoading}
              isFiltering={isFiltering}
              isSearching={isSearching}
              searchQuery={filters.search}
              totalProducts={totalProducts}
              showViewToggle={true}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* No Results */}
            {!isLoading && products.length === 0 && (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <div className="max-w-md mx-auto">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                    <Filter className="w-6 h-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {hasActiveFilters
                      ? "Try adjusting your filters or search terms."
                      : "No products available at the moment."
                    }
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onClick={clearAllFilters}
                      size="sm"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
