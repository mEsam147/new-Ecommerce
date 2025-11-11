'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Star,
  Zap,
  TrendingUp,
  Clock,
  Shield,
  Truck,
  CheckCircle,
  Sparkles,
  Tag,
  Grid3X3
} from 'lucide-react';
import { useGetProductsByCategoryQuery } from '@/lib/services/productsApi';
import { useGetCategoryBySlugQuery } from '@/lib/services/categoriesApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/common/ProductCard';
import Image from 'next/image';

interface CategoryContentProps {
  params: {
    slug: string;
  };
  searchParams: {
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    brand?: string;
  };
}

export function CategoryContent({ params, searchParams }: CategoryContentProps) {
  const router = useRouter();
  const { slug } = params;
  const {
    sort = 'featured',
    page = '1',
    minPrice,
    maxPrice,
    brand
  } = searchParams;

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(brand ? brand.split(',') : []);
  const [priceRange, setPriceRange] = useState({
    min: minPrice ? parseInt(minPrice) : 0,
    max: maxPrice ? parseInt(maxPrice) : 1000
  });

  // Fetch category data
  const { data: categoryData, isLoading: categoryLoading } = useGetCategoryBySlugQuery(slug);

  // Build filters for products query
  const filters = {
    sort: sort as any,
    page: parseInt(page),
    limit: 12,
    minPrice: priceRange.min > 0 ? priceRange.min : undefined,
    maxPrice: priceRange.max < 1000 ? priceRange.max : undefined,
    brand: selectedBrands.length > 0 ? selectedBrands : undefined,
  };

  // Fetch products
  const { data: productsData, isLoading: productsLoading, error } = useGetProductsByCategoryQuery(
    { categorySlug: slug, ...filters },
    { skip: !slug }
  );

  const category = categoryData?.data?.category;
  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination;
  const featuredProducts = categoryData?.data?.featuredProducts || [];

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (sort !== 'featured') {
      params.set('sort', sort);
    }
    if (page !== '1') {
      params.set('page', page);
    }
    if (priceRange.min > 0) {
      params.set('minPrice', priceRange.min.toString());
    }
    if (priceRange.max < 1000) {
      params.set('maxPrice', priceRange.max.toString());
    }
    if (selectedBrands.length > 0) {
      params.set('brand', selectedBrands.join(','));
    }

    const newUrl = `/categories/${slug}${params.toString() ? `?${params.toString()}` : ''}`;
    if (window.location.search !== `?${params.toString()}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [slug, sort, page, priceRange, selectedBrands, router]);

  const handleBrandToggle = (brandName: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandName)
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName]
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 1000 });
  };

  const hasActiveFilters = selectedBrands.length > 0 || priceRange.min > 0 || priceRange.max < 1000;

  // Get unique brands from products
  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
  const availablePriceRange = {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Category Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the category you're looking for. It might have been moved or doesn't exist.
          </p>
          <Button
            onClick={() => router.push('/categories')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Browse All Categories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Category Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {categoryLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : category ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                {category.image?.url && (
                  <Image
                  width={100}
                  height={100}
                    src={category.image.url}
                    alt={category.name}
                    className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-lg"
                  />
                )}
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="text-gray-600 text-lg mt-2 max-w-2xl mx-auto">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Category Stats */}
              <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                  <Grid3X3 className="w-4 h-4 text-blue-500" />
                  <span>{pagination?.total || 0} products</span>
                </div>
                {category.productsCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Popular category</span>
                  </div>
                )}
                {category.featured && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span>Featured</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent capitalize">
                {slug.split('-').join(' ')}
              </h1>
              <p className="text-gray-600 text-lg mt-2">
                Explore our collection of {slug.split('-').join(' ')} products
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Featured Products Banner */}
      {featuredProducts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-300" />
                <div>
                  <h3 className="font-bold text-lg">Featured Picks</h3>
                  <p className="text-blue-100 text-sm">Handpicked products from this category</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {featuredProducts.length} featured
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={cn(
            "w-80 flex-shrink-0 space-y-6 transition-all duration-300",
            "lg:block",
            showFilters ? "block fixed inset-0 z-50 bg-white p-6 overflow-auto shadow-2xl" : "hidden"
          )}>
            {/* Mobile Header */}
            {showFilters && (
              <div className="flex items-center justify-between mb-8 lg:hidden pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                  <p className="text-sm text-gray-500 mt-1">Refine your results</p>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}

            {/* Filter Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Brands Filter */}
            {availableBrands.length > 0 && (
              <FilterSection title="Brands" icon="🏷️">
                {availableBrands.map((brandName) => (
                  <label key={brandName} className="flex items-center gap-3 py-3 px-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors group">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brandName)}
                      onChange={() => handleBrandToggle(brandName)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transform group-hover:scale-110 transition-transform"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {brandName}
                    </span>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {products.filter(p => p.brand === brandName).length}
                    </Badge>
                  </label>
                ))}
              </FilterSection>
            )}

            {/* Price Filter */}
            <FilterSection title="Price Range" icon="💰">
              <div className="space-y-4 p-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Min Price</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={priceRange.min || ''}
                      onChange={(e) => setPriceRange(prev => ({
                        ...prev,
                        min: parseInt(e.target.value) || 0
                      }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Max Price</label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={priceRange.max || ''}
                      onChange={(e) => setPriceRange(prev => ({
                        ...prev,
                        max: parseInt(e.target.value) || 1000
                      }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                {products.length > 0 && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                    Price range: <span className="font-semibold text-green-600">
                      ${availablePriceRange.min} - ${availablePriceRange.max}
                    </span>
                  </div>
                )}
              </div>
            </FilterSection>

            {/* Category Info */}
            {category && (
              <FilterSection title="About This Category" icon="ℹ️">
                <div className="space-y-3 p-2">
                  {category.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Total Products</span>
                    <span className="font-semibold">{pagination?.total || 0}</span>
                  </div>
                  {category.featured && (
                    <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg">
                      <Sparkles className="w-3 h-3" />
                      Featured Category
                    </div>
                  )}
                </div>
              </FilterSection>
            )}

            {/* Mobile Apply Button */}
            {showFilters && (
              <Button
                onClick={() => setShowFilters(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg mt-6"
              >
                Apply Filters
              </Button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-white shadow-sm hover:shadow-md border-gray-300 hover:border-blue-500 transition-all duration-200"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {selectedBrands.length + (priceRange.min > 0 ? 1 : 0) + (priceRange.max < 1000 ? 1 : 0)}
                    </Badge>
                  )}
                </Button>

                {/* Results Count */}
                {!productsLoading && (
                  <div className="text-sm text-gray-600">
                    Showing {pagination?.total ? Math.min(products.length, pagination.total) : products.length} of {pagination?.total || 0} products
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      viewMode === 'grid'
                        ? "bg-white shadow-lg text-blue-600 scale-105"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    )}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      viewMode === 'list'
                        ? "bg-white shadow-lg text-blue-600 scale-105"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    )}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams);
                    params.set('sort', e.target.value);
                    router.replace(`/categories/${slug}?${params.toString()}`);
                  }}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value="featured">✨ Featured</option>
                  <option value="newest">🆕 Newest</option>
                  <option value="price-low">💰 Price: Low to High</option>
                  <option value="price-high">💎 Price: High to Low</option>
                  <option value="popular">🔥 Most Popular</option>
                  <option value="rating">⭐ Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                  <Filter className="w-4 h-4" />
                  Active filters:
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedBrands.map(brand => (
                    <Badge key={brand} variant="secondary" className="flex items-center gap-1 bg-white border-blue-200 text-blue-700 shadow-sm">
                      🏷️ {brand}
                      <button
                        onClick={() => handleBrandToggle(brand)}
                        className="ml-1 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}

                  {(priceRange.min > 0 || priceRange.max < 1000) && (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-white border-green-200 text-green-700 shadow-sm">
                      💰 ${priceRange.min} - ${priceRange.max}
                      <button
                        onClick={() => setPriceRange({ min: 0, max: 1000 })}
                        className="ml-1 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear all
                  </Button>
                </div>
              </div>
            )}

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  Featured Products
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.slice(0, 4).map((product: any) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      className="border-2 border-yellow-200 hover:border-yellow-300"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Products Grid */}
            {productsLoading ? (
              <div className={cn(
                "grid gap-6 animate-in fade-in-0 duration-500",
                viewMode === 'grid'
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}>
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={cn(
                  "grid gap-6 animate-in fade-in-0 duration-500",
                  viewMode === 'grid'
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                )}>
                  {products.map((product: any, index: number) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      className="hover:shadow-2xl hover:scale-105 transition-all duration-500"
                      priority={index < 8}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-16">
                    <Button
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', (pagination.page - 1).toString());
                        router.replace(`/categories/${slug}?${params.toString()}`);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 hover:border-blue-500 transition-all duration-200"
                    >
                      ← Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const pageNum = i + 1;
                        const isCurrent = pagination.page === pageNum;
                        return (
                          <Button
                            key={pageNum}
                            variant={isCurrent ? "default" : "outline"}
                            onClick={() => {
                              const params = new URLSearchParams(searchParams);
                              params.set('page', pageNum.toString());
                              router.replace(`/categories/${slug}?${params.toString()}`);
                            }}
                            className={cn(
                              "w-12 h-12 p-0 rounded-xl font-semibold transition-all duration-200",
                              isCurrent && "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg scale-110"
                            )}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', (pagination.page + 1).toString());
                        router.replace(`/categories/${slug}?${params.toString()}`);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 hover:border-blue-500 transition-all duration-200"
                    >
                      Next →
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <NoProducts categoryName={category?.name || slug.split('-').join(' ')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Section Component
function FilterSection({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

// Skeleton Loader
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded-full w-10"></div>
        </div>
      </div>
    </div>
  );
}

// No Products Component
function NoProducts({ categoryName }: { categoryName: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
        <Tag className="w-16 h-16 text-gray-400" />
      </div>
      <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        No Products Found
      </h2>
      <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
        We couldn't find any products in the <span className="font-semibold text-blue-600">{categoryName}</span> category matching your filters.
      </p>

      <div className="space-y-6 max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Suggestions
          </h3>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li>• Try adjusting your filters or search terms</li>
            <li>• Browse other related categories</li>
            <li>• Check back later for new arrivals</li>
            <li>• Contact us for specific product requests</li>
          </ul>
        </div>

        <Button
          onClick={() => window.location.href = '/categories'}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        >
          Browse All Categories
        </Button>
      </div>
    </div>
  );
}
