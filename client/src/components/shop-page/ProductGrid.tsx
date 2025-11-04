// components/shop/ProductGrid.tsx
'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/types';
import ProductCard from '../common/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { SearchX, Filter, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
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
  searchQuery,
  totalProducts,
  showViewToggle = false,
  viewMode = 'grid',
  onViewModeChange,
  className
}) => {
  console.log("Products loaded:", products.length, products);

  // Enhanced loading skeleton that matches the product card structure
  if (isLoading) {
    return (
      <div className={className}>
        {/* Loading Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          {showViewToggle && (
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-32" />
            </div>
          )}
        </div>

        {/* Loading Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-0">
                <div className="space-y-4">
                  {/* Image Skeleton */}
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />

                  {/* Content Skeleton */}
                  <div className="space-y-3 p-4">
                    {/* Category */}
                    <Skeleton className="h-3 w-16" />

                    {/* Title */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Skeleton key={starIndex} className="h-3 w-3 rounded-full" />
                        ))}
                      </div>
                      <Skeleton className="h-3 w-12" />
                    </div>

                    {/* Brand */}
                    <Skeleton className="h-3 w-20" />

                    {/* Stock */}
                    <Skeleton className="h-3 w-24" />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between p-4 pt-0">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-9 w-28 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Enhanced empty state
  if (products.length === 0) {
    return (
      <div className={className}>
        <Card className="text-center py-16 border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
          <CardContent className="space-y-6 max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
              <SearchX className="w-12 h-12 text-muted-foreground/60" />
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-foreground">
                {searchQuery ? 'No products found' : 'No products available'}
              </h3>

              <p className="text-muted-foreground text-lg leading-relaxed">
                {searchQuery
                  ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search terms or browse our categories.`
                  : 'Check back later for new arrivals or explore our featured categories.'
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button variant="default" className="gap-2">
                <Filter className="w-4 h-4" />
                Browse All Categories
              </Button>
              {searchQuery && (
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with results count and view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              Products
            </h2>
            {totalProducts !== undefined && (
              <Badge variant="secondary" className="text-sm font-semibold">
                {totalProducts} {totalProducts === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </div>

          {searchQuery && (
            <p className="text-muted-foreground text-sm">
              Showing results for "<span className="font-semibold text-foreground">{searchQuery}</span>"
            </p>
          )}
        </div>

        {/* View Mode Toggle */}
        {showViewToggle && onViewModeChange && (
          <Tabs
            value={viewMode}
            onValueChange={(value) => onViewModeChange(value as 'grid' | 'list')}
            className="w-auto"
          >
            <TabsList className="grid w-24 grid-cols-2">
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid3X3 className="w-3 h-3" />
                <span className="sr-only sm:not-sr-only sm:inline">Grid</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="w-3 h-3" />
                <span className="sr-only sm:not-sr-only sm:inline">List</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Products Grid */}
      <div className={
        viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          : "grid grid-cols-1 gap-6"
      }>
        {products.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            className={
              viewMode === 'list'
                ? "flex flex-row items-stretch h-48"
                : undefined
            }
          />
        ))}
      </div>

      {/* Load More Indicator (optional) */}
      {totalProducts && products.length < totalProducts && (
        <div className="text-center mt-8 pt-6 border-t">
          <p className="text-muted-foreground text-sm">
            Showing {products.length} of {totalProducts} products
          </p>
        </div>
      )}
    </div>
  );
};

// Additional utility component for grid variations
export const ProductGridSections: React.FC<{
  sections: {
    title: string;
    subtitle?: string;
    products: Product[];
    viewAllHref?: string;
  }[];
  isLoading?: boolean;
}> = ({ sections, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-12">
        {sections.map((_, index) => (
          <div key={index} className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <ProductGrid products={[]} isLoading={true} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {sections.map((section, index) => (
        <section key={index} className="space-y-6">
          {/* Section Header */}
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-muted-foreground text-lg">
                  {section.subtitle}
                </p>
              )}
            </div>

            {section.viewAllHref && (
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All →
              </Button>
            )}
          </div>

          {/* Products Grid */}
          <ProductGrid
            products={section.products}
            isLoading={false}
          />
        </section>
      ))}
    </div>
  );
};

export default ProductGrid;
