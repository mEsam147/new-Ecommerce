// components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useNavigation } from '@/lib/hooks/useNavigation';
import { cn } from '@/lib/utils';
import { Navigation } from './Navigation';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { CartButton } from './CartButton';
import { MobileMenu } from './MobileMenu';
import { CartDrawer } from '@/components/common/CartDrawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  LogIn,
  Search,
  Sparkles,
  Truck,
  Shield,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import WishlistButton from './WishlistButton';

export const Header: React.FC = () => {
  const { navMenu, isLoading: navLoading } = useNavigation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
      setIsTop(scrollY < 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCartClick = () => setIsCartOpen(true);

  return (
    <>
      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-2 px-4 text-center text-sm font-medium relative overflow-hidden">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Free Shipping Over $50</span>
          </div>
          <div className="w-1 h-1 bg-white/50 rounded-full" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>2-Year Warranty</span>
          </div>
        </div>
      </div>

      <header className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 ease-out border-b bg-white/95 backdrop-blur-xl",
        scrolled
          ? "border-gray-200/80 shadow-lg shadow-black/5"
          : "border-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Left Section: Logo & Navigation */}
            <div className="flex items-center gap-8 flex-1">
              {/* Logo */}
              <Link
                href="/"
                className="relative group flex-shrink-0 transform transition-transform duration-300 hover:scale-105"
              >
                <div className="relative flex items-center gap-2">
                  <div className="relative">
                    <Sparkles className="w-6 h-6 text-blue-500 absolute -left-6 -top-1" />
                    <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent font-sans tracking-tighter">
                      STYLESHOP
                    </span>
                  </div>
                  <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 group-hover:w-full transition-all duration-500" />
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex">
                <Navigation navMenu={navMenu} isLoading={navLoading} />
              </div>
            </div>

            {/* Center Section: Search Bar - Now opens modal */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <div
                className="w-full cursor-pointer"
                onClick={() => setIsSearchOpen(true)}
              >
                <SearchBar
                  isLoading={navLoading}
                  variant="trigger"
                />
              </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {/* Search Button - Mobile */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 group relative"
                aria-label="Search"
              >
                <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
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
                  <Skeleton className="w-9 h-9 rounded-full" />
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
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 px-4 py-2 rounded-xl group"
                  >
                    <LogIn className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span className="font-medium">Sign In</span>
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button - FIXED: Ensure it's properly placed */}
              <MobileMenu
                navMenu={navMenu}
                isLoading={navLoading}
                isAuthenticated={isAuthenticated}
                user={user}
              />
            </div>
          </div>
        </div>

        {/* Search Modal */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="sm:max-w-4xl p-6 gap-0 bg-transparent border-none shadow-none max-h-[85vh] overflow-hidden [&>button]:hidden">
            <SearchModalContent
              onClose={() => setIsSearchOpen(false)}
              isLoading={navLoading}
            />
          </DialogContent>
        </Dialog>
      </header>

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
  const [query, setQuery] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    onClose();
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
      {/* Search Header */}
      <div className="p-6 border-b border-gray-200/30 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                <input
                  ref={inputRef}
                  type="search"
                  placeholder="What are you looking for today?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-12 h-14 text-base border-0 bg-white shadow-inner rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 font-medium placeholder-gray-500 transition-all duration-300"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
            </form>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="whitespace-nowrap text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Search Content */}
      <div className="max-h-[50vh] overflow-y-auto p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : !query ? (
          <SearchSuggestions onSuggestionClick={handleSuggestionClick} />
        ) : (
          <SearchResults query={query} onSuggestionClick={handleSuggestionClick} />
        )}
      </div>
    </div>
  );
};

// Search Suggestions Component
const SearchSuggestions = ({ onSuggestionClick }: { onSuggestionClick: (term: string) => void }) => {
  const trendingCategories = [
    { id: 1, name: "Gaming", count: "1.2k", icon: "🎮" },
    { id: 2, name: "Fitness", count: "893", icon: "💪" },
    { id: 3, name: "Smart Home", count: "756", icon: "🏠" },
    { id: 4, name: "Laptops", count: "1.5k", icon: "💻" },
  ];

  const recentSearches = [
    { id: 1, term: "iPhone 15", category: "Mobile" },
    { id: 2, term: "Running Shoes", category: "Sports" },
    { id: 3, term: "Home Decor", category: "Living" },
    { id: 4, term: "Wireless Earbuds", category: "Audio" },
  ];

  return (
    <div className="space-y-6">
      {/* Trending Categories */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <span className="text-blue-500">🔥</span>
          Trending Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {trendingCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSuggestionClick(category.name)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
            >
              <span className="text-sm">{category.icon}</span>
              <span className="font-medium text-xs">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <span className="text-purple-500">🕒</span>
          Recent Searches
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {recentSearches.map((recent) => (
            <button
              key={recent.id}
              onClick={() => onSuggestionClick(recent.term)}
              className="flex items-center gap-3 p-3 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 group text-left"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <div className="flex-1">
                <div className="font-medium">{recent.term}</div>
                <div className="text-xs text-gray-500">{recent.category}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Search Results Component
const SearchResults = ({ query, onSuggestionClick }: { query: string, onSuggestionClick: (term: string) => void }) => {
  const searchResults = [
    { id: 1, term: "Wireless Headphones", category: "Audio", matches: true },
    { id: 2, term: "Gaming Headphones", category: "Audio", matches: true },
    { id: 3, term: "Noise Cancelling Headphones", category: "Audio", matches: true },
    { id: 4, term: "Bluetooth Headphones", category: "Audio", matches: true },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Search className="w-4 h-4 text-blue-500" />
        Search results for "{query}"
      </div>
      <div className="space-y-2">
        {searchResults.map((result) => (
          <button
            key={result.id}
            onClick={() => onSuggestionClick(result.term)}
            className="w-full flex items-center gap-3 p-3 text-sm hover:bg-gray-50 rounded-lg transition-all duration-200 group text-left"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {result.term}
              </div>
              <div className="text-xs text-gray-500">
                in {result.category}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
