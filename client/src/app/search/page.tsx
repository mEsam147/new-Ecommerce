'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSearch, useSearchHistory, useSearchNavigation } from '@/lib/hooks/useSearch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  Zap,
  Tag,
  Building,
  Package,
  RotateCcw,
  Star,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import ProductCard from '@/components/common/ProductCard';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Mock filter data
const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Beauty', 'Sports', 'Books'];
const BRANDS = ['Nike', 'Apple', 'Samsung', 'Sony', 'Adidas', 'LG'];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const query = searchParams.get('q') || '';
  const pageNumber = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(pageNumber) ? 1 : Math.max(1, pageNumber);
  const productsPerPage = 12;

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    popularSearches,
    searchSuggestions,
    isSearching,
    showPopularSearches,
    showSearchResults,
    showNoResults,
    showLoading,
    clearSearch,
    activateSearch,
    deactivateSearch
  } = useSearch();

  const { searchHistory, clearHistory, removeFromHistory } = useSearchHistory();
  const { navigateToSearch, navigateToProduct, navigateToCategory, navigateToBrand } = useSearchNavigation();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<string>('relevance');
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    priceRange: [0, 1000] as [number, number],
    inStock: false,
    onSale: false,
    rating: 0
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // === INPUT & URL SYNC (FIXED) ===
  useEffect(() => {
    if (query !== searchQuery) {
      setSearchQuery(query);
    }
  }, [query, searchQuery, setSearchQuery]);

  const updateUrl = useCallback((newQuery: string, newPage?: number) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set('q', newQuery.trim());
    if (newPage && newPage > 1) params.set('page', String(newPage));
    const url = params.toString() ? `/search?${params.toString()}` : '/search';
    router.replace(url, { scroll: false });
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    updateUrl(value, 1);
  };

  const handleClear = () => {
    setSearchQuery('');
    clearSearch();
    deactivateSearch();
    updateUrl('');
    inputRef.current?.focus();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      updateUrl(trimmed, 1);
      navigateToSearch(trimmed);
    }
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    updateUrl(term, 1);
    navigateToSearch(term);
  };

  // === FILTERS & SORTING ===
  const clearAllFilters = () => {
    setActiveFilters({
      categories: [],
      brands: [],
      priceRange: [0, 1000],
      inStock: false,
      onSale: false,
      rating: 0
    });
    setSort('relevance');
  };

  const filteredProducts = useMemo(() => {
    return searchResults.products?.filter(product => {
      if (!product) return false;

      if (activeFilters.categories.length > 0 && product.category && !activeFilters.categories.includes(product.category)) return false;
      if (activeFilters.brands.length > 0 && product.brand && !activeFilters.brands.includes(product.brand)) return false;
      if (product.price < activeFilters.priceRange[0] || product.price > activeFilters.priceRange[1]) return false;
      if (activeFilters.inStock && !(product.inventory?.trackQuantity ? product.inventory.quantity > 0 : true)) return false;
      if (activeFilters.onSale && !(product.comparePrice && product.comparePrice > product.price)) return false;
      if (activeFilters.rating > 0 && (product.rating?.average || 0) < activeFilters.rating) return false;

      return true;
    }) || [];
  }, [searchResults.products, activeFilters]);

  const sortedProducts = useMemo(() => {
    const prods = [...filteredProducts];
    if (sort === 'price-low') prods.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') prods.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') prods.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
    else if (sort === 'new') prods.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    return prods;
  }, [filteredProducts, sort]);

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const displayProducts = sortedProducts.slice((page - 1) * productsPerPage, page * productsPerPage);

  const hasActiveFilters = Object.values(activeFilters).some(f => Array.isArray(f) ? f.length > 0 : f) || sort !== 'relevance';

  const getSuggestionText = (s: any) => typeof s === 'string' ? s : s.text || s.term || s.label || 'Unknown';
  const getSuggestionType = (s: any) => typeof s === 'string' ? 'search' : s.type || 'search';

  const handlePageChange = (newPage: number) => {
    updateUrl(searchQuery, newPage);
  };

  const getPageLinks = () => {
    return Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
      let p = i + 1;
      if (totalPages > 7 && page > 4) {
        if (i === 0) p = 1;
        else if (i === 1) p = -1;
        else if (i === 5) p = totalPages;
        else if (i === 6) p = -1;
        else p = page - 3 + i;
      }
      if (p === -1) return <span key={i} className="px-2">...</span>;
      return (
        <PaginationItem key={p}>
          <PaginationLink
            href="#"
            isActive={p === page}
            onClick={(e) => { e.preventDefault(); handlePageChange(p); }}
          >
            {p}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Sticky Search Header */}
      <div className="   bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="flex-shrink-0">
                <ArrowRight className="h-5 w-5 rotate-180" />
              </Button>
<form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row gap-3 items-center">
  {/* Search Input */}
  <div className="relative flex-1 w-full">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
    <Input
      ref={inputRef}
      type="text"
      placeholder="Search products, brands, categories..."
      value={searchQuery}
      onChange={handleInputChange}
      onFocus={activateSearch}
      autoFocus
      className={cn(
        "pl-11 pr-4 py-2 sm:py-3 text-sm sm:text-base", // ✅ أقل ارتفاع
        "border-2 border-border/50 focus:border-primary",
        "bg-card/80 backdrop-blur-sm",
        "rounded-xl shadow-sm",
        "transition-all duration-200",
        "focus:ring-2 focus:ring-primary/20 focus:shadow-lg",
        "placeholder:text-muted-foreground/60",
        "w-full"
      )}
    />
    {/* Clear Button */}
    {searchQuery && (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleClear}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2",
          "h-7 w-7 rounded-full", // ✅ أصغر
          "hover:bg-muted/80 transition-colors"
        )}
      >
        <X className="h-3 w-3" /> {/* أصغر الأيقونة أيضًا */}
      </Button>
    )}
  </div>

  {/* Search Button */}
  <Button
    type="submit"
    size="lg"
    className={cn(
      "w-full sm:w-auto min-w-[100px]",
      "h-10 sm:h-12 px-4 sm:px-6", // ✅ أصغر ارتفاع
      "bg-gradient-to-r from-primary to-primary/90",
      "hover:from-primary/90 hover:to-primary",
      "text-white font-medium",
      "rounded-xl shadow-md",
      "transition-all duration-200",
      "hover:shadow-lg hover:scale-[1.02]",
      "flex items-center justify-center gap-2"
    )}
  >
    <Search className="h-4 w-4 sm:h-5 sm:w-5" /> {/* أقل ارتفاع */}
    <span className="hidden sm:inline">Search</span>
    <span className="sm:hidden">Go</span>
  </Button>
</form>


              <Sheet open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className={cn("gap-2", hasActiveFilters && "bg-primary/10 border-primary text-primary")}>
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 !">!</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-96 overflow-y-auto">
                  <SheetHeader><SheetTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Filters</SheetTitle></SheetHeader>
                  <div className="space-y-6 mt-6">
                    {/* Price, Categories, Brands, etc. (unchanged) */}
                    {/* ... keep your filter UI here ... */}
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearAllFilters} className="w-full gap-2">
                        <RotateCcw className="h-4 w-4" /> Clear All
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {searchQuery && (
              <div className="flex justify-between items-center mt-4 text-sm">
                <div className="flex items-center gap-4">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium", isSearching ? "bg-blue-500/10 text-blue-600 animate-pulse" : showNoResults ? "bg-muted" : "bg-green-500/10 text-green-600")}>
                    {isSearching ? "Searching..." : showNoResults ? "No results" : `Found ${filteredProducts.length}`}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="new">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex border rounded-lg">
                    <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="rounded-r-none h-8 px-3"><Grid3X3 className="h-4 w-4" /></Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-l-none h-8 px-3"><List className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Popular Searches, History, etc. */}
        {showPopularSearches && (
          <div className="max-w-6xl mx-auto">
            {/* ... your existing popular/history UI ... */}
          </div>
        )}

        {/* Search Results */}
        {showSearchResults && (
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="products" className="mb-8">
              <TabsList className="grid w-full grid-cols-4 max-w-md">
                <TabsTrigger value="products"><Package className="h-4 w-4" /> Products ({filteredProducts.length})</TabsTrigger>
                <TabsTrigger value="categories"><Tag className="h-4 w-4" /> Categories ({searchResults.categories?.length || 0})</TabsTrigger>
                <TabsTrigger value="brands"><Building className="h-4 w-4" /> Brands ({searchResults.brands?.length || 0})</TabsTrigger>
                <TabsTrigger value="suggestions"><Sparkles className="h-4 w-4" /> Suggestions ({searchSuggestions?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="mt-6">
                {displayProducts.length > 0 ? (
                  <>
                    <div className={cn("gap-4", viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid grid-cols-1 lg:grid-cols-2")}>
                      {displayProducts.map(p => (
                        <ProductCard key={p._id} product={p} variant={viewMode === 'list' ? 'compact' : 'default'} className={cn(viewMode === 'list' && '!flex-row')} />
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <Pagination className="mt-8 justify-center">
                        <PaginationContent>
                          <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (page > 1) handlePageChange(page - 1); }} className={page === 1 ? 'opacity-50 pointer-events-none' : ''} /></PaginationItem>
                          {getPageLinks()}
                          <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (page < totalPages) handlePageChange(page + 1); }} className={page === totalPages ? 'opacity-50 pointer-events-none' : ''} /></PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No products match</h3>
                    <Button onClick={clearAllFilters} variant="outline">Clear Filters</Button>
                  </div>
                )}
              </TabsContent>

              {/* Other tabs unchanged */}
            </Tabs>
          </div>
        )}

        {/* Loading, No Results, Empty State */}
        {showLoading && (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6"><div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full animate-pulse"><Search className="h-4 w-4 animate-bounce" /> Searching "{searchQuery}"...</div></div>
            <div className={cn("gap-4", viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid grid-cols-1 lg:grid-cols-2")}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border rounded-xl p-4 space-y-4 animate-pulse">
                  <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        )}

        {showNoResults && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center"><Search className="h-16 w-16 text-muted-foreground" /></div>
            <h2 className="text-3xl font-bold mb-4">No results found</h2>
            <p className="text-lg text-muted-foreground mb-8">Try "<strong>{searchQuery}</strong>" or clear filters.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleClear} variant="outline" size="lg" className="gap-2"><RotateCcw className="h-4 w-4" /> Clear</Button>
              <Button onClick={() => router.push('/shop')} size="lg" className="gap-2"><Eye className="h-4 w-4" /> Browse All</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
