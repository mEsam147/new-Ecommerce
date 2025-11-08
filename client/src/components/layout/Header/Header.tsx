// // components/layout/Header.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useAuth } from '@/lib/hooks/useAuth';
// import { useNavigation } from '@/lib/hooks/useNavigation';
// import { cn } from '@/lib/utils';
// import { Navigation } from './Navigation';
// import { SearchBar } from './SearchBar';
// import { UserMenu } from './UserMenu';
// import { CartButton } from './CartButton';
// import { MobileMenu } from './MobileMenu';
// import { CartDrawer } from '@/components/common/CartDrawer';
// import { Button } from '@/components/ui/button';
// import { Skeleton } from '@/components/ui/skeleton';
// import {
//   Dialog,
//   DialogContent,
// } from "@/components/ui/dialog";
// import {
//   LogIn,
//   Search,
//   Truck,
//   Shield,
//   X
// } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import WishlistButton from './WishlistButton';
// import { PopularSearch, SearchResult, SearchSuggestion } from '@/lib/services/searchApi';
// import { useSearch, useSearchHistory, useSearchNavigation } from '@/lib/hooks/useSearch';
// import { Badge } from '@/components/ui/badge';
// import Logo from '@/components/common/Logo';

// export const Header: React.FC = () => {
//   const { navMenu, isLoading: navLoading } = useNavigation();
//   const { user, isAuthenticated, isLoading: authLoading } = useAuth();

//   const [scrolled, setScrolled] = useState(false);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const [isTop, setIsTop] = useState(true);

//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollY = window.scrollY;
//       setScrolled(scrollY > 20);
//       setIsTop(scrollY < 10);
//     };

//     window.addEventListener('scroll', handleScroll, { passive: true });
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const handleCartClick = () => setIsCartOpen(true);
//   const handleSearchOpen = () => setIsSearchOpen(true);
//   const handleSearchClose = () => setIsSearchOpen(false);

//   return (
//     <>
//       {/* Promo Banner */}
//       <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-2 px-4 text-center text-sm font-medium relative overflow-hidden">
//         <div className="flex items-center justify-center gap-4">
//           <div className="flex items-center gap-2">
//             <Truck className="w-4 h-4" />
//             <span>Free Shipping Over $50</span>
//           </div>
//           <div className="w-1 h-1 bg-white/50 rounded-full" />
//           <div className="flex items-center gap-2">
//             <Shield className="w-4 h-4" />
//             <span>2-Year Warranty</span>
//           </div>
//         </div>
//       </div>

//       <header className={cn(
//         "sticky top-0 z-50 w-full transition-all duration-500 ease-out border-b bg-white/95 backdrop-blur-xl",
//         scrolled
//           ? "border-gray-200/80 shadow-lg shadow-black/5"
//           : "border-transparent"
//       )}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16 lg:h-20">

//             {/* Left Section: Logo & Navigation */}
//             <div className="flex items-center gap-8 flex-1">
//               {/* Logo */}
//               <Link
//                 href="/"
//                 className="relative group flex-shrink-0 transform transition-transform duration-300 hover:scale-105"
//               >
//                 <Logo/>
//               </Link>

//               {/* Desktop Navigation */}
//               <div className="hidden lg:flex">
//                 <Navigation navMenu={navMenu} isLoading={navLoading} />
//               </div>
//             </div>

//             {/* Center Section: Search Bar - Now opens modal */}
//             {/* <div className="hidden lg:flex flex-1 max-w-lg mx-8">
//               <SearchBar
//                 isLoading={navLoading}
//                 variant="trigger"
//                 onClick={handleSearchOpen}
//               />
//             </div> */}

//             {/* Right Section: Actions */}
//             <div className="flex items-center gap-2 flex-shrink-0">

//               {/* Search Button - Visible on ALL devices */}
//               <button
//                 onClick={handleSearchOpen}
//                 className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 group relative"
//                 aria-label="Search"
//               >
//                 <Search className="w-7 h-7 transition-transform group-hover:scale-110" />
//               </button>

//               <WishlistButton />

//               {/* Cart Button */}
//               <CartButton
//                 isLoading={navLoading}
//                 onCartClick={handleCartClick}
//               />

//               {/* Auth Section */}
//               {authLoading ? (
//                 <div className="flex items-center gap-2">
//                   <Skeleton className="w-9 h-9 rounded-full" />
//                 </div>
//               ) : isAuthenticated ? (
//                 <UserMenu
//                   isAuthenticated={isAuthenticated}
//                   user={user}
//                   isLoading={authLoading}
//                 />
//               ) : (
//                 <Link href="/auth/login">
//                   <Button
//                     variant="default"
//                     size="sm"
//                     className="hidden sm:flex items-center gap-2 transition-all duration-300 px-4 py-2  group"
//                   >
//                     <span className="font-medium uppercase">Sign In</span>

//                     <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:scale-110" />
//                   </Button>
//                 </Link>
//               )}

//               {/* Mobile Menu Button */}
//               <MobileMenu
//                 navMenu={navMenu}
//                 isLoading={navLoading}
//                 isAuthenticated={isAuthenticated}
//                 user={user}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Search Modal */}
//         <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
//           <DialogContent className="sm:max-w-4xl p-6 gap-0 bg-transparent border-none shadow-none max-h-[85vh] overflow-hidden [&>button]:hidden">
//             <SearchModalContent
//               onClose={handleSearchClose}
//               isLoading={navLoading}
//             />
//           </DialogContent>
//         </Dialog>
//       </header>

//       <CartDrawer
//         isOpen={isCartOpen}
//         onClose={() => setIsCartOpen(false)}
//       />
//     </>
//   );
// };

// // Search Modal Content Component
// interface SearchModalContentProps {
//   onClose: () => void;
//   isLoading: boolean;
// }

// const SearchModalContent: React.FC<SearchModalContentProps> = ({ onClose, isLoading }) => {
//   const router = useRouter();
//   const {
//     searchQuery,
//     setSearchQuery: handleSearchChange,
//     searchResults,
//     popularSearches,
//     searchSuggestions,
//     isSearching: showLoading,
//     isPopularLoading,
//     isSuggestionsLoading,
//     hasResults,
//     showPopularSearches,
//     showSearchResults,
//     showSuggestions,
//     showNoResults,
//     clearSearch,
//     activateSearch,
//     deactivateSearch
//   } = useSearch();
//   const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();
//   const { navigateToSearch, navigateToSuggestion, navigateToProduct, navigateToCategory, navigateToBrand } = useSearchNavigation();

//   const inputRef = React.useRef<HTMLInputElement>(null);

//   // Focus input when modal opens and activate search
//   useEffect(() => {
//     activateSearch();
//     if (inputRef.current) {
//       setTimeout(() => {
//         inputRef.current?.focus();
//       }, 100);
//     }
//     return () => deactivateSearch();
//   }, []);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       addToHistory(searchQuery);
//       navigateToSearch(searchQuery);
//       onClose();
//     }
//   };

//   const handleSuggestionClick = (suggestion: SearchSuggestion) => {
//     addToHistory(suggestion.text);
//     navigateToSuggestion(suggestion);
//     onClose();
//   };

//   const handleHistoryClick = (term: string) => {
//     handleSearchChange(term);
//     addToHistory(term); // Refresh position in history
//     navigateToSearch(term);
//     onClose();
//   };

//   const handleClear = () => {
//     clearSearch();
//     inputRef.current?.focus();
//   };

//   return (
//     <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
//       {/* Search Header */}
//       <div className="p-6 border-b border-gray-200/30 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
//         <div className="flex items-center gap-4">
//           <div className="flex-1">
//             <form onSubmit={handleSubmit} className="relative">
//               <div className="relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
//                 <input
//                   ref={inputRef}
//                   type="text"
//                   placeholder="What are you looking for today?"
//                   value={searchQuery}
//                   onChange={(e) => handleSearchChange(e.target.value)}
//                   onFocus={activateSearch}
//                   className="w-full pl-12 pr-12 h-14 text-base border-0 bg-white shadow-inner rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 font-medium placeholder-gray-500 transition-all duration-300"
//                   autoFocus
//                 />
//                 {searchQuery && (
//                   <button
//                     type="button"
//                     onClick={handleClear}
//                     className="absolute right-4 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center"
//                   >
//                     <X className="h-4 w-4 text-gray-500" />
//                   </button>
//                 )}
//               </div>
//             </form>
//           </div>
//           <Button
//             variant="ghost"
//             onClick={onClose}
//             className="whitespace-nowrap text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium"
//           >
//             Cancel
//           </Button>
//         </div>
//       </div>

//       {/* Search Content */}
//       <div className="max-h-[50vh] overflow-y-auto p-6">
//         {isLoading || showLoading || isPopularLoading || isSuggestionsLoading ? (
//           <div className="space-y-3">
//             {Array.from({ length: 5 }).map((_, i) => (
//               <Skeleton key={i} className="h-12 rounded-xl" />
//             ))}
//           </div>
//         ) : showNoResults ? (
//           <NoResults query={searchQuery} />
//         ) : showSearchResults ? (
//           <SearchResults
//             query={searchQuery}
//             results={searchResults}
//             suggestions={searchSuggestions}
//             onSuggestionClick={handleSuggestionClick}
//             onProductClick={navigateToProduct}
//             onCategoryClick={navigateToCategory}
//             onBrandClick={navigateToBrand}
//           />
//         ) : showSuggestions ? (
//           <SearchSuggestions
//             suggestions={searchSuggestions}
//             onSuggestionClick={handleSuggestionClick}
//           />
//         ) : showPopularSearches ? (
//           <PopularSearches
//             popularSearches={popularSearches}
//             onClick={(term) => {
//               handleSearchChange(term);
//               navigateToSearch(term);
//               onClose();
//             }}
//           />
//         ) : (
//           <SearchHistorySection
//             history={searchHistory}
//             onHistoryClick={handleHistoryClick}
//             onRemove={removeFromHistory}
//             onClear={clearHistory}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// // Search History Section
// const SearchHistorySection = ({
//   history,
//   onHistoryClick,
//   onRemove,
//   onClear
// }: {
//   history: string[];
//   onHistoryClick: (term: string) => void;
//   onRemove: (term: string) => void;
//   onClear: () => void;
// }) => {
//   if (history.length === 0) return null;

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//           <span className="text-purple-500">🕒</span>
//           Recent Searches
//         </h3>
//         <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-red-500">
//           Clear All
//         </Button>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//         {history.map((term, index) => (
//           <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//             <button
//               onClick={() => onHistoryClick(term)}
//               className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 transition-all duration-200 group text-left flex-1"
//             >
//               <Search className="w-4 h-4 text-gray-400" />
//               <span className="font-medium">{term}</span>
//             </button>
//             <button onClick={() => onRemove(term)} className="text-gray-400 hover:text-red-500">
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Popular Searches
// const PopularSearches = ({
//   popularSearches,
//   onClick
// }: {
//   popularSearches: PopularSearch[];
//   onClick: (term: string) => void;
// }) => {
//   return (
//     <div className="space-y-6">
//       <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
//         <span className="text-blue-500">🔥</span>
//         Popular Searches
//       </h3>
//       <div className="flex flex-wrap gap-2">
//         {popularSearches.map((search) => (
//           <button
//             key={search.term}
//             onClick={() => onClick(search.term)}
//             className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
//           >
//             <span className="font-medium text-xs">{search.term}</span>
//             <Badge variant="secondary" className="text-xs">{search.count}</Badge>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Search Suggestions
// const SearchSuggestions = ({
//   suggestions,
//   onSuggestionClick
// }: {
//   suggestions: SearchSuggestion[];
//   onSuggestionClick: (suggestion: SearchSuggestion) => void;
// }) => {
//   return (
//     <div className="space-y-4">
//       <h3 className="text-sm font-semibold text-gray-700">Suggestions</h3>
//       <div className="space-y-2">
//         {suggestions.map((suggestion) => (
//           <button
//             key={suggestion.text}
//             onClick={() => onSuggestionClick(suggestion)}
//             className="w-full flex items-center gap-3 p-3 text-sm hover:bg-gray-50 rounded-lg transition-all duration-200 group text-left"
//           >
//             <Search className="w-4 h-4 text-gray-400" />
//             <div className="flex-1">
//               <div className="font-medium">{suggestion.text}</div>
//               <div className="text-xs text-gray-500 capitalize">{suggestion.type}</div>
//             </div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Search Results
// const SearchResults = ({
//   query,
//   results,
//   suggestions,
//   onSuggestionClick,
//   onProductClick,
//   onCategoryClick,
//   onBrandClick
// }: {
//   query: string;
//   results: SearchResult;
//   suggestions: SearchSuggestion[];
//   onSuggestionClick: (suggestion: SearchSuggestion) => void;
//   onProductClick: (slug: string) => void;
//   onCategoryClick: (slug: string) => void;
//   onBrandClick: (slug: string) => void;
// }) => {
//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//         <Search className="w-4 h-4 text-blue-500" />
//         Results for "{query}"
//       </div>

//       {/* Suggestions Section */}
//       {suggestions?.length > 0 && (
//         <div className="space-y-2">
//           <h4 className="text-xs font-semibold text-gray-600 mb-2">Quick Suggestions</h4>
//           {suggestions.map((suggestion) => (
//             <button
//               key={suggestion.text}
//               onClick={() => onSuggestionClick(suggestion)}
//               className="w-full flex items-center gap-3 p-2 text-sm hover:bg-gray-50 rounded-lg"
//             >
//               <Search className="w-4 h-4 text-gray-400" />
//               <span>{suggestion.text} ({suggestion.type})</span>
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Products Section */}
//       {results.products?.length > 0 && (
//         <div>
//           <h4 className="text-xs font-semibold text-gray-600 mb-2">Products</h4>
//           <div className="space-y-2">
//             {results.products.map((product) => (
//               <button
//                 key={product._id}
//                 onClick={() => onProductClick(product.slug)}
//                 className="w-full p-3 hover:bg-gray-50 rounded-lg text-left"
//               >
//                 <div className="flex gap-3">
//                   <img src={product.images[0]?.url} alt={product.title} className="w-12 h-12 rounded object-cover" />
//                   <div>
//                     <div className="font-medium text-sm">{product.title}</div>
//                     <div className="text-xs text-gray-500">${product.price} - {product.brand}</div>
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Categories Section */}
//       {results.categories?.length > 0 && (
//         <div>
//           <h4 className="text-xs font-semibold text-gray-600 mb-2">Categories</h4>
//           <div className="flex flex-wrap gap-2">
//             {results.categories.map((category) => (
//               <button
//                 key={category._id}
//                 onClick={() => onCategoryClick(category.slug)}
//                 className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-blue-50"
//               >
//                 {category.name} ({category.productsCount})
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Brands Section */}
//       {results.brands?.length > 0 && (
//         <div>
//           <h4 className="text-xs font-semibold text-gray-600 mb-2">Brands</h4>
//           <div className="flex flex-wrap gap-2">
//             {results.brands.map((brand) => (
//               <button
//                 key={brand._id}
//                 onClick={() => onBrandClick(brand.slug)}
//                 className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-blue-50"
//               >
//                 {brand.name} ({brand.productCount})
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // No Results
// const NoResults = ({ query }: { query: string }) => (
//   <div className="text-center py-8">
//     <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//     <h3 className="text-lg font-semibold mb-2">No results found for "{query}"</h3>
//     <p className="text-sm text-gray-500">Try different keywords or check spelling.</p>
//   </div>
// );

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
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  LogIn,
  Search,
  Truck,
  Shield,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import WishlistButton from './WishlistButton';
import { PopularSearch, SearchResult, SearchSuggestion } from '@/lib/services/searchApi';
import { useSearch, useSearchHistory, useSearchNavigation } from '@/lib/hooks/useSearch';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/common/Logo';

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
  const handleSearchClose = (): void => setIsSearchOpen(false);

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
        "sticky top-0 z-50 w-full transition-all duration-500 ease-out border-b bg-white/95 backdrop-blur-xl",
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

        {/* Search Modal */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="sm:max-w-4xl p-4 sm:p-6 gap-0 bg-transparent border-none shadow-none max-h-[85vh] overflow-hidden [&>button]:hidden">
            <SearchModalContent
              onClose={handleSearchClose}
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

  const handleSuggestionClick = (suggestion: SearchSuggestion): void => {
    addToHistory(suggestion.text);
    navigateToSuggestion(suggestion);
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
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
      {/* Search Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200/30 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="What are you looking for today?"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={activateSearch}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 text-sm sm:text-base border-0 bg-white shadow-inner rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 font-medium placeholder-gray-500 transition-all duration-300"
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
      <div className="max-h-[50vh] overflow-y-auto p-4 sm:p-6">
        {isLoading || showLoading || isPopularLoading || isSuggestionsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 sm:h-12 rounded-xl" />
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
  if (history.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span className="text-purple-500">🕒</span>
          Recent Searches
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-red-500">
          Clear All
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {history.map((term, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <button
              onClick={() => onHistoryClick(term)}
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 transition-all duration-200 group text-left flex-1"
            >
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium truncate">{term}</span>
            </button>
            <button
              onClick={() => onRemove(term)}
              className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2"
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
  popularSearches: PopularSearch[];
  onClick: (term: string) => void;
}

const PopularSearches: React.FC<PopularSearchesProps> = ({
  popularSearches,
  onClick
}) => {
  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
        <span className="text-blue-500">🔥</span>
        Popular Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {popularSearches.map((search) => (
          <button
            key={search.term}
            onClick={() => onClick(search.term)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
          >
            <span className="font-medium text-xs">{search.term}</span>
            <Badge variant="secondary" className="text-xs">{search.count}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
};

// Search Suggestions
interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSuggestionClick
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Suggestions</h3>
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.text}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full flex items-center gap-3 p-3 text-sm hover:bg-gray-50 rounded-lg transition-all duration-200 group text-left"
          >
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{suggestion.text}</div>
              <div className="text-xs text-gray-500 capitalize">{suggestion.type}</div>
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
  results: SearchResult;
  suggestions: SearchSuggestion[];
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
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
        <Search className="w-4 h-4 text-blue-500 flex-shrink-0" />
        Results for "{query}"
      </div>

      {/* Suggestions Section */}
      {suggestions?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">Quick Suggestions</h4>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.text}
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full flex items-center gap-3 p-2 text-sm hover:bg-gray-50 rounded-lg"
            >
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{suggestion.text} ({suggestion.type})</span>
            </button>
          ))}
        </div>
      )}

      {/* Products Section */}
      {results.products?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2">Products</h4>
          <div className="space-y-2">
            {results.products.map((product) => (
              <button
                key={product._id}
                onClick={() => onProductClick(product.slug)}
                className="w-full p-3 hover:bg-gray-50 rounded-lg text-left"
              >
                <div className="flex gap-3">
                  <img
                    src={product.images[0]?.url}
                    alt={product.title}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{product.title}</div>
                    <div className="text-xs text-gray-500 truncate">${product.price} - {product.brand}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories Section */}
      {results.categories?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {results.categories.map((category) => (
              <button
                key={category._id}
                onClick={() => onCategoryClick(category.slug)}
                className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-blue-50 text-xs"
              >
                {category.name} ({category.productsCount})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brands Section */}
      {results.brands?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2">Brands</h4>
          <div className="flex flex-wrap gap-2">
            {results.brands.map((brand) => (
              <button
                key={brand._id}
                onClick={() => onBrandClick(brand.slug)}
                className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-blue-50 text-xs"
              >
                {brand.name} ({brand.productCount})
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
    <h3 className="text-base sm:text-lg font-semibold mb-2">No results found for "{query}"</h3>
    <p className="text-sm text-gray-500">Try different keywords or check spelling.</p>
  </div>
);
