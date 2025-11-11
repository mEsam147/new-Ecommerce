// components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useNavigation } from '@/lib/hooks/useNavigation';
import { cn } from '@/lib/utils';
import { Navigation } from './Navigation';
import { UserMenu } from './UserMenu';
import { CartButton } from './CartButton';
import { MobileMenu } from './MobileMenu';
import { CartDrawer } from '@/components/common/CartDrawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LogIn,
  Search,
  Truck,
  Shield,
  X,
  Clock,
  TrendingUp,
  Sparkles,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import WishlistButton from './WishlistButton';
import { useSearch, useSearchHistory, useSearchNavigation } from '@/lib/hooks/useSearch';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/common/Logo';
import Image from 'next/image';

export const Header: React.FC = () => {
  const { navMenu, isLoading: navLoading } = useNavigation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isTop, setIsTop] = useState<boolean>(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
      setIsTop(scrollY < 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCartClick = (): void => setIsCartOpen(true);
  const handleSearchOpen = (): void => setIsSearchOpen(true);
  const handleSearchClose = (): void => {
    setIsSearchOpen(false);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        handleSearchClose();
      }
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen]);

  return (
    <>
      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-2 px-4 text-center text-sm font-medium relative overflow-hidden">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Free Shipping Over $50</span>
          </div>
          <div className="w-1 h-1 bg-white/50 rounded-full hidden sm:block" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">2-Year Warranty</span>
          </div>
        </div>
      </div>

      <header className={cn(
        "sticky top-0 z-40 w-full transition-all duration-500 ease-out border-b bg-white/95 backdrop-blur-xl",
        scrolled
          ? "border-gray-200/80 shadow-lg shadow-black/5"
          : "border-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left Section: Logo & Navigation */}
            <div className="flex items-center gap-4 lg:gap-8 flex-1">
              {/* Logo */}
              <Link
                href="/"
                className="relative group flex-shrink-0 transform transition-transform duration-300 hover:scale-105"
                aria-label="Home"
              >
                <Logo />
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex">
                <Navigation navMenu={navMenu} isLoading={navLoading} />
              </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Search Button */}
              <button
                onClick={handleSearchOpen}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 group relative"
                aria-label="Search"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
              </button>

              <WishlistButton />

              {/* Cart Button */}
              <CartButton
                isLoading={navLoading}
                onCartClick={handleCartClick}
              />

              {/* Auth Section */}
              {authLoading ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-full" />
                </div>
              ) : isAuthenticated ? (
                <UserMenu
                  isAuthenticated={isAuthenticated}
                  user={user}
                  isLoading={authLoading}
                />
              ) : (
                <Link href="/auth/login">
                  <Button
                    variant="default"
                    size="sm"
                    className="hidden sm:flex items-center gap-2 transition-all duration-300 px-3 py-2 group"
                  >
                    <span className="font-medium uppercase text-xs sm:text-sm">Sign In</span>
                    <LogIn className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1 group-hover:scale-110" />
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <MobileMenu
                navMenu={navMenu}
                isLoading={navLoading}
                isAuthenticated={isAuthenticated}
                user={user}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Custom Search Modal */}
      {isSearchOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in-0 duration-300"
            onClick={handleSearchClose}
          />

          {/* Search Modal - Centered with fade animation */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-4xl max-h-[85vh] animate-in fade-in-0 duration-300">
              <SearchModalContent
                onClose={handleSearchClose}
                isLoading={navLoading}
              />
            </div>
          </div>
        </>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
};

// Search Modal Content Component
interface SearchModalContentProps {
  onClose: () => void;
  isLoading: boolean;
}

const SearchModalContent: React.FC<SearchModalContentProps> = ({ onClose, isLoading }) => {
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery: handleSearchChange,
    searchResults,
    popularSearches,
    searchSuggestions,
    isSearching: showLoading,
    isPopularLoading,
    isSuggestionsLoading,
    hasResults,
    showPopularSearches,
    showSearchResults,
    showSuggestions,
    showNoResults,
    clearSearch,
    activateSearch,
    deactivateSearch
  } = useSearch();
  const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();
  const { navigateToSearch, navigateToSuggestion, navigateToProduct, navigateToCategory, navigateToBrand } = useSearchNavigation();

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when modal opens and activate search
  useEffect(() => {
    activateSearch();
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    return () => deactivateSearch();
  }, [activateSearch, deactivateSearch]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToHistory(searchQuery);
      navigateToSearch(searchQuery);
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: any): void => {
    addToHistory(suggestion.text);
    if (suggestion.url) {
      router.push(suggestion.url);
    } else {
      navigateToSearch(suggestion.text);
    }
    onClose();
  };

  const handleHistoryClick = (term: string): void => {
    handleSearchChange(term);
    addToHistory(term);
    navigateToSearch(term);
    onClose();
  };

  const handleClear = (): void => {
    clearSearch();
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="What are you looking for today?"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={activateSearch}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 text-sm sm:text-base border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium placeholder-gray-500 transition-all duration-300"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  </button>
                )}
              </div>
            </form>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="whitespace-nowrap text-gray-600 hover:text-gray-900 px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium text-sm sm:text-base"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Search Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
        {showLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 sm:h-12 rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : showNoResults ? (
          <NoResults query={searchQuery} />
        ) : showSearchResults ? (
          <SearchResults
            query={searchQuery}
            results={searchResults}
            suggestions={searchSuggestions}
            onSuggestionClick={handleSuggestionClick}
            onProductClick={navigateToProduct}
            onCategoryClick={navigateToCategory}
            onBrandClick={navigateToBrand}
          />
        ) : showSuggestions ? (
          <SearchSuggestions
            suggestions={searchSuggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        ) : showPopularSearches ? (
          <PopularSearches
            popularSearches={popularSearches}
            onClick={(term) => {
              handleSearchChange(term);
              addToHistory(term);
              navigateToSearch(term);
              onClose();
            }}
          />
        ) : (
          <SearchHistorySection
            history={searchHistory}
            onHistoryClick={handleHistoryClick}
            onRemove={removeFromHistory}
            onClear={clearHistory}
          />
        )}
      </div>
    </div>
  );
};

// Search History Section
interface SearchHistorySectionProps {
  history: string[];
  onHistoryClick: (term: string) => void;
  onRemove: (term: string) => void;
  onClear: () => void;
}

const SearchHistorySection: React.FC<SearchHistorySectionProps> = ({
  history,
  onHistoryClick,
  onRemove,
  onClear
}) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No recent searches</p>
        <p className="text-sm text-gray-400 mt-2">Start typing to search for products</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Clock className="w-4 h-4 text-purple-600" />
          Recent Searches
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          Clear All
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {history.map((term, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200"
          >
            <button
              onClick={() => onHistoryClick(term)}
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 transition-all duration-200 group text-left flex-1"
            >
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-blue-600 transition-colors" />
              <span className="font-medium truncate">{term}</span>
            </button>
            <button
              onClick={() => onRemove(term)}
              className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2 transition-colors duration-200 p-1 rounded hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Popular Searches
interface PopularSearchesProps {
  popularSearches: any[];
  onClick: (term: string) => void;
}

const PopularSearches: React.FC<PopularSearchesProps> = ({
  popularSearches,
  onClick
}) => {
  if (!popularSearches || popularSearches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No popular searches available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        Popular Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {popularSearches.map((search, index) => (
          <button
            key={search.term || index}
            onClick={() => onClick(search.term)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 bg-white"
          >
            <span className="font-medium text-sm text-gray-700">{search.term}</span>
            {search.count && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                {search.count}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Search Suggestions
interface SearchSuggestionsProps {
  suggestions: any[];
  onSuggestionClick: (suggestion: any) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSuggestionClick
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Sparkles className="w-4 h-4 text-yellow-500" />
        Suggestions
      </h3>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.text || index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full flex items-center gap-3 p-3 text-sm hover:bg-gray-50 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 group text-left"
          >
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-blue-600 transition-colors" />
            <div className="flex-1 min-w-0 text-left">
              <div className="font-medium truncate text-gray-900">{suggestion.text}</div>
              <div className="text-xs text-gray-500 capitalize flex items-center gap-1 mt-1">
                <span className="bg-gray-100 px-2 py-1 rounded">{suggestion.type}</span>
                {suggestion.brand && <span className="text-gray-400">• {suggestion.brand}</span>}
                {suggestion.category && <span className="text-gray-400">• {suggestion.category}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Search Results
interface SearchResultsProps {
  query: string;
  results: any;
  suggestions: any[];
  onSuggestionClick: (suggestion: any) => void;
  onProductClick: (slug: string) => void;
  onCategoryClick: (slug: string) => void;
  onBrandClick: (slug: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  suggestions,
  onSuggestionClick,
  onProductClick,
  onCategoryClick,
  onBrandClick
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Search className="w-4 h-4 text-blue-600 flex-shrink-0" />
        Results for "{query}"
        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
          {results.products.length + (results.categories?.length || 0) + (results.brands?.length || 0)} found
        </Badge>
      </div>

      {/* Products Section */}
      {results.products?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Products</h4>
          <div className="space-y-2">
            {results.products.map((product: any, index: number) => (
              <button
                key={product._id}
                onClick={() => onProductClick(product.slug)}
                className="w-full p-3 hover:bg-gray-50 rounded-lg text-left transition-all duration-200 border border-transparent hover:border-gray-200 group"
              >
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
                      alt={product.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 group-hover:border-blue-500 transition-colors"
                    />
                    {product.salesCount > 100 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full text-[10px] font-bold">
                        Hot
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate group-hover:text-blue-600 transition-colors text-gray-900">
                      {product.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-green-600">${product.price}</span>
                      {product.comparePrice > product.price && (
                        <span className="text-xs text-gray-500 line-through">${product.comparePrice}</span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating?.average || 0}</span>
                        <span>({product.rating?.count || 0})</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {product.brand} • {product.category}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brands Section */}
      {results.brands?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Brands</h4>
          <div className="flex flex-wrap gap-2">
            {results.brands.map((brand: any, index: number) => (
              <button
                key={brand._id}
                onClick={() => onBrandClick(brand.slug)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 bg-white group"
              >
                {brand.logo?.url && (
                  <Image
                    src={brand.logo.url}
                    alt={brand.name}
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded object-cover"
                  />
                )}
                <span className="font-medium text-sm group-hover:text-blue-600 transition-colors text-gray-900">
                  {brand.name}
                </span>
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                  {brand.productCount}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Suggestions */}
      {suggestions?.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Quick Suggestions</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.text || index}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-3 py-1 rounded-full border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-xs transition-all duration-200 bg-white text-gray-700"
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// No Results
interface NoResultsProps {
  query: string;
}

const NoResults: React.FC<NoResultsProps> = ({ query }) => (
  <div className="text-center py-8">
    <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900">No results found for "{query}"</h3>
    <p className="text-sm text-gray-500 mb-4">Try different keywords or check spelling.</p>
    <Button
      variant="outline"
      onClick={() => window.location.href = '/products'}
      className="border-gray-300 hover:bg-gray-50 text-gray-700"
    >
      Browse All Products
    </Button>
  </div>
);
