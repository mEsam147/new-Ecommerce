'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Loader2,
  Sparkles,
  Zap
} from 'lucide-react';
import { useSearchProductsQuery } from '@/lib/services/searchApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/common/ProductCard';

export function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort') || 'relevance';
  const page = searchParams.get('page') || '1';

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(category ? category.split(',') : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(brand ? brand.split(',') : []);
  const [priceRange, setPriceRange] = useState({
    min: minPrice ? parseInt(minPrice) : 0,
    max: maxPrice ? parseInt(maxPrice) : 1000
  });

  // Build filters object
  const filters = {
    category: selectedCategories.length > 0 ? selectedCategories : undefined,
    brand: selectedBrands.length > 0 ? selectedBrands : undefined,
    minPrice: priceRange.min > 0 ? priceRange.min : undefined,
    maxPrice: priceRange.max < 1000 ? priceRange.max : undefined,
    sort: sort as any,
    page: parseInt(page),
    limit: 12
  };

  const { data, isLoading, error, isFetching } = useSearchProductsQuery(
    { query, filters },
    {
      skip: !query || query.length < 2,
      refetchOnMountOrArgChange: true
    }
  );

  console.log("Search Results Data:", data);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('q', query);

    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','));
    }
    if (selectedBrands.length > 0) {
      params.set('brand', selectedBrands.join(','));
    }
    if (priceRange.min > 0) {
      params.set('minPrice', priceRange.min.toString());
    }
    if (priceRange.max < 1000) {
      params.set('maxPrice', priceRange.max.toString());
    }
    if (sort !== 'relevance') {
      params.set('sort', sort);
    }
    if (page !== '1') {
      params.set('page', page);
    }

    const newUrl = `/search?${params.toString()}`;
    if (window.location.search !== `?${params.toString()}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [query, selectedCategories, selectedBrands, priceRange, sort, page, router]);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleBrandToggle = (brandName: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandName)
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 1000 });
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 ||
                          priceRange.min > 0 || priceRange.max < 1000;

  if (error) {
    console.error('Search error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Search Error</h2>
          <p className="text-gray-600 mb-6">
            We encountered an error while searching. Please check your connection and try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  Search Results
                </h1>
                {isFetching && (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                )}
              </div>

              {query && (
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-gray-600">
                    {data?.pagination?.total ? (
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{data.pagination.total}</span>
                        results for
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          "{query}"
                        </span>
                      </span>
                    ) : isLoading ? (
                      <span className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching for "{query}"...
                      </span>
                    ) : (
                      <span className="text-gray-500">No results found for "{query}"</span>
                    )}
                  </p>

                  {/* Quick Stats */}
                  {data?.pagination && (
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Page {data.pagination.page} of {data.pagination.pages}</span>
                      {data.pagination.total > 0 && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          {Math.ceil(data.pagination.total / data.pagination.limit)} pages
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Results count and loading */}
              {(isLoading || isFetching) && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-full">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading results...</span>
                </div>
              )}

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
                  router.replace(`/search?${params.toString()}`);
                }}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <option value="relevance">✨ Relevance</option>
                <option value="newest">🆕 Newest</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
                <option value="popular">🔥 Most Popular</option>
                <option value="rating">⭐ Highest Rated</option>
              </select>

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
                    {selectedCategories.length + selectedBrands.length +
                     (priceRange.min > 0 ? 1 : 0) + (priceRange.max < 1000 ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-3 mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                <Filter className="w-4 h-4" />
                Active filters:
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedCategories.map(category => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1 bg-white border-blue-200 text-blue-700 shadow-sm">
                    📁 {category}
                    <button
                      onClick={() => handleCategoryToggle(category)}
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}

                {selectedBrands.map(brand => (
                  <Badge key={brand} variant="secondary" className="flex items-center gap-1 bg-white border-purple-200 text-purple-700 shadow-sm">
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Enhanced Sidebar Filters */}
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
                  <p className="text-sm text-gray-500 mt-1">Refine your search results</p>
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
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
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

            {/* Categories Filter */}
            {data?.filters?.categories && data.filters.categories.length > 0 && (
              <FilterSection title="Categories" icon="📁">
                {data.filters.categories.map((category: any) => (
                  <label key={category._id} className="flex items-center gap-3 py-3 px-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => handleCategoryToggle(category.name)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transform group-hover:scale-110 transition-transform"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {category.name}
                    </span>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {category.count}
                    </Badge>
                  </label>
                ))}
              </FilterSection>
            )}

            {/* Brands Filter */}
            {data?.filters?.brands && data.filters.brands.length > 0 && (
              <FilterSection title="Brands" icon="🏷️">
                {data.filters.brands.map((brandItem: any) => (
                  <label key={brandItem.name} className="flex items-center gap-3 py-3 px-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors group">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brandItem.name)}
                      onChange={() => handleBrandToggle(brandItem.name)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 transform group-hover:scale-110 transition-transform"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {brandItem.name}
                    </span>
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      {brandItem.count}
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
                {data?.filters?.priceRange && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                    Available range: <span className="font-semibold text-green-600">
                      ${data.filters.priceRange.min} - ${data.filters.priceRange.max}
                    </span>
                  </div>
                )}
              </div>
            </FilterSection>

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

          {/* Main Content */}
          <div className="flex-1">
            {isLoading ? (
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
            ) : data?.data && data.data.length > 0 ? (
              <>
                {/* Products Grid with Enhanced ProductCard */}
                <div className={cn(
                  "grid gap-6 animate-in fade-in-0 duration-500",
                  viewMode === 'grid'
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                )}>
                  {data.data.map((product: any, index: number) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      className="hover:shadow-2xl hover:scale-105 transition-all duration-500"
                      priority={index < 4} // Priority loading for first 4 images
                    />
                  ))}
                </div>

                {/* Enhanced Pagination */}
                {data.pagination && data.pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-16">
                    <Button
                      variant="outline"
                      disabled={data.pagination.page === 1}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', (data.pagination.page - 1).toString());
                        router.replace(`/search?${params.toString()}`);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 hover:border-blue-500 transition-all duration-200"
                    >
                      ← Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                        const pageNum = i + 1;
                        const isCurrent = data.pagination.page === pageNum;
                        return (
                          <Button
                            key={pageNum}
                            variant={isCurrent ? "default" : "outline"}
                            onClick={() => {
                              const params = new URLSearchParams(searchParams);
                              params.set('page', pageNum.toString());
                              router.replace(`/search?${params.toString()}`);
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
                      disabled={data.pagination.page === data.pagination.pages}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', (data.pagination.page + 1).toString());
                        router.replace(`/search?${params.toString()}`);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 hover:border-blue-500 transition-all duration-200"
                    >
                      Next →
                    </Button>
                  </div>
                )}
              </>
            ) : query && query.length >= 2 ? (
              <NoResults query={query} />
            ) : (
              <EmptySearch />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Filter Section Component
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

// Enhanced Skeleton Loader
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

// Enhanced No Results Component
function NoResults({ query }: { query: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
        <Search className="w-16 h-16 text-gray-400" />
      </div>
      <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        No Results Found
      </h2>
      <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
        We couldn't find any matches for "<span className="font-semibold text-blue-600">{query}</span>"
      </p>

      <div className="space-y-6 max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Search Tips
          </h3>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li>• Check for spelling errors or typos</li>
            <li>• Try more general or broader keywords</li>
            <li>• Use fewer filters to expand your results</li>
            <li>• Browse by category instead of searching</li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-500">Try searching for:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {['electronics', 'smartphones', 'laptops', 'headphones', 'cameras'].map((term) => (
              <Button
                key={term}
                variant="outline"
                onClick={() => window.location.href = `/search?q=${term}`}
                className="rounded-full px-6 py-2 border-2 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Empty Search Component
function EmptySearch() {
  return (
    <div className="text-center py-20">
      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <Search className="w-16 h-16 text-blue-500" />
      </div>
      <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Start Exploring
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        Enter a search term to discover amazing products
      </p>
      <div className="max-w-md mx-auto bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
        <p className="text-sm text-gray-600">
          💡 <strong>Pro tip:</strong> Use specific keywords like "wireless headphones" or "gaming laptop" for better results
        </p>
      </div>
    </div>
  );
}
