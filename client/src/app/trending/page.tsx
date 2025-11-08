// app/trending/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useGetTrendingProductsQuery } from '@/lib/services/productsApi';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  TrendingUp,
  Zap,
  Star,
  Flame,
  Grid3X3,
  List,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/common/ProductCard';
import Pagination from '@/components/shop-page/Pagination';

type SortOption = 'trending' | 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';
type ViewMode = 'grid' | 'list';

interface TrendingCategory {
  category: string;
  count: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  limit: number;
}

interface TrendingResponse {
  products: Product[];
  pagination: PaginationInfo;
}

const PRODUCTS_PER_PAGE = 12;

export default function TrendingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch trending products with pagination
  const { data: trendingResponse, isLoading, error } = useGetTrendingProductsQuery({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
    category: activeCategory !== 'all' ? activeCategory : undefined,
    sort: sortBy
  });

  const trendingData: TrendingResponse | undefined = trendingResponse?.data;
  const products: Product[] = trendingData?.products || [];
  const pagination: PaginationInfo | undefined = trendingData?.pagination;

  // Client-side search filtering only (since pagination is handled by backend)
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;

    return products.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Reset to first page when filters change (except search which is client-side)
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, sortBy]);

  // Get unique categories from all products (you might want a separate endpoint for this)
  const categories = useMemo(() => {
    // For now, we'll use the current page's products
    // In a real app, you'd want a separate endpoint to get all categories
    const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return ['all', ...uniqueCategories];
  }, [products]);

  // Get trending stats from current page data
  const trendingStats = useMemo(() => {
    const pageProducts = products;
    const totalProducts = pagination?.totalProducts || 0;
    const averageRating = pageProducts.length > 0
      ? pageProducts.reduce((acc, product) => acc + (product.rating?.average || 0), 0) / pageProducts.length
      : 0;
    const totalSales = pageProducts.reduce((acc, product) => acc + (product.salesCount || 0), 0);
    const totalViews = pageProducts.reduce((acc, product) => acc + (product.viewCount || 0), 0);

    return {
      totalProducts,
      averageRating,
      totalSales,
      totalViews,
      currentPageProducts: pageProducts.length
    };
  }, [products, pagination]);

  // Get top trending categories with counts (from current page data)
  const trendingCategories = useMemo((): TrendingCategory[] => {
    const categoryCounts = products.reduce((acc, product) => {
      if (product.category) {
        acc[product.category] = (acc[product.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([category, count]) => ({ category, count }));
  }, [products]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Unable to Load Trending Products</h1>
          <p className="text-muted-foreground mb-6">
            There was an error loading the trending products. Please check your connection and try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/shop">
                Browse All Products
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-100 via-red-100 to-pink-200 text-primary py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
              <Flame className="w-5 h-5 animate-pulse" />
              <span className="font-semibold text-sm tracking-wider">TRENDING NOW</span>
            </div>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
            Hot & Trending
          </h1>

          <p className="text-xl lg:text-2xl text-primary/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover what&apos;s popular right now. Shop the most wanted products
            that everyone is talking about this week.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-2xl lg:text-3xl font-bold mb-1">
                {isLoading ? '...' : trendingStats.totalProducts}
              </div>
              <div className="text-white/80 text-sm">Trending Items</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-2xl lg:text-3xl font-bold mb-1 flex items-center justify-center gap-1">
                {isLoading ? '...' : trendingStats.averageRating.toFixed(1)}
                <Star className="w-4 h-4 fill-current" />
              </div>
              <div className="text-white/80 text-sm">Avg Rating</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-2xl lg:text-3xl font-bold mb-1">
                {isLoading ? '...' : (trendingStats.totalSales / 1000).toFixed(1)}K+
              </div>
              <div className="text-white/80 text-sm">Total Sales</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-2xl lg:text-3xl font-bold mb-1">
                {isLoading ? '...' : (trendingStats.totalViews / 1000).toFixed(1)}K+
              </div>
              <div className="text-white/80 text-sm">Total Views</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b supports-backdrop-blur:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search trending products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>

              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center justify-between w-full">
                        <span>{category === 'all' ? 'All Categories' : category}</span>
                        {category !== 'all' && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {products.filter((p: Product) => p.category === category).length}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      Trending
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Most Popular
                    </div>
                  </SelectItem>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Newest First
                    </div>
                  </SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Highest Rated
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg p-1 bg-muted/50">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8"
                >
                  <List className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1 pl-3 pr-2 py-1">
                Search: &quot;{searchQuery}&quot;
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              </Badge>
            )}
            {activeCategory !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1 pl-3 pr-2 py-1">
                Category: {activeCategory}
                <button
                  onClick={() => setActiveCategory('all')}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              </Badge>
            )}
            {(searchQuery || activeCategory !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="h-6 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold">
              Trending Products
            </h2>
            <p className="text-muted-foreground mt-1">
              {isLoading ? 'Loading trending products...' :
                filteredProducts.length === 0 ? 'No products found' :
                `Showing ${filteredProducts.length} of ${pagination?.totalProducts || 0} trending products`
              }
              {!isLoading && filteredProducts.length > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  (Page {currentPage} of {pagination?.totalPages || 1})
                </span>
              )}
            </p>
          </div>

          {!isLoading && filteredProducts.length > 0 && (
            <Button variant="outline" asChild>
              <Link href="/shop" className="flex items-center gap-2">
                Browse All Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <ProductGridSkeleton viewMode={viewMode} />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No trending products found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || activeCategory !== 'all'
                ? 'No products match your current filters. Try adjusting your search or category filter.'
                : 'There are currently no trending products. Check back later for updates!'
              }
            </p>
            {(searchQuery || activeCategory !== 'all') && (
              <Button onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className={cn(
              "gap-6 mb-12",
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "flex flex-col gap-6"
            )}>
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  className={cn(
                    viewMode === 'list' && "flex-row h-64",
                    "animate-in fade-in-0 zoom-in-95"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />

                <div className="text-center mt-4 text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * PRODUCTS_PER_PAGE) + 1} to{' '}
                  {Math.min(currentPage * PRODUCTS_PER_PAGE, pagination.totalProducts)} of{' '}
                  {pagination.totalProducts} products
                </div>
              </div>
            )}

            {pagination && currentPage === pagination.totalPages && (
              <div className="text-center mt-12">
                <div className="bg-muted/30 rounded-2xl p-8 max-w-2xl mx-auto">
                  <h3 className="text-xl font-semibold mb-3">Want to see more?</h3>
                  <p className="text-muted-foreground mb-6">
                    You&apos;ve reached the end of trending products. Explore our full collection for more amazing finds.
                  </p>
                  <Button asChild size="lg">
                    <Link href="/shop" className="flex items-center gap-2">
                      Browse All Products
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!isLoading && trendingCategories.length > 0 && (
        <section className="bg-muted/30 py-16 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Hot Categories</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Explore the most popular categories that are trending right now
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {trendingCategories.map(({ category, count }) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className="h-16 text-sm font-medium capitalize hover:scale-105 transition-all duration-200 relative group"
                >
                  <span>{category}</span>
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 text-xs bg-orange-500 text-white"
                  >
                    {count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

const ProductGridSkeleton = ({ viewMode }: { viewMode: ViewMode }) => (
  <div className={cn(
    "gap-6",
    viewMode === 'grid'
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "flex flex-col gap-6"
  )}>
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={index}
        className={cn(
          "border rounded-lg overflow-hidden bg-card",
          viewMode === 'list' && "flex h-64"
        )}
      >
        <div className={cn(
          "p-4 space-y-4",
          viewMode === 'list' && "flex gap-4 flex-1"
        )}>
          <Skeleton className={cn(
            "rounded-lg",
            viewMode === 'list' ? "w-48 h-48" : "aspect-square w-full"
          )} />

          <div className={cn(
            "space-y-3 flex-1",
            viewMode === 'list' && "flex flex-col justify-between py-2"
          )}>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
