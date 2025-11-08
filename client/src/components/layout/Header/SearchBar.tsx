// 'use client';

// import React from 'react';
// import { Search, Clock, TrendingUp, X, Loader2 } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { cn } from '@/lib/utils';
// import { useSearch, useSearchNavigation, useSearchHistory } from '@/hooks/useSearch';

// interface SearchBarProps {
//   isLoading: boolean;
//   variant?: 'default' | 'trigger';
//   onSearchOpen?: (isOpen: boolean) => void;
// }

// export const SearchBar: React.FC<SearchBarProps> = ({
// isLoading,
//   variant = 'default',
//   onClick
// }) => {

//   const {
//     searchQuery,
//     setSearchQuery,
//     searchResults,
//     popularSearches,
//     searchSuggestions,
//     isSearching,
//     isPopularLoading,
//     hasResults,
//     isSearchActive,
//     clearSearch,
//     activateSearch,
//     deactivateSearch,
//     showPopularSearches,
//     showSearchResults,
//     showNoResults
//   } = useSearch();

//   const { navigateToSearch, navigateToSuggestion, navigateToProduct, navigateToCategory, navigateToBrand } = useSearchNavigation();
//   const { searchHistory, addToHistory, removeFromHistory } = useSearchHistory();

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       addToHistory(searchQuery);
//       navigateToSearch(searchQuery);
//     }
//   };

//   const handleSuggestionClick = (suggestion: any) => {
//     if (suggestion.type === 'product' && suggestion.slug) {
//       navigateToProduct(suggestion.slug);
//     } else if (suggestion.type === 'category' && suggestion.slug) {
//       navigateToCategory(suggestion.slug);
//     } else if (suggestion.type === 'brand' && suggestion.slug) {
//       navigateToBrand(suggestion.slug);
//     } else {
//       navigateToSuggestion(suggestion);
//     }
//     deactivateSearch();
//   };

//   const handleHistoryClick = (query: string) => {
//     setSearchQuery(query);
//     addToHistory(query);
//     navigateToSearch(query);
//     deactivateSearch();
//   };

//   const handleInputFocus = () => {
//     activateSearch();
//     onSearchOpen?.(true);
//   };
//   if (isLoading) {
//     return <Skeleton className="h-12 w-full rounded-2xl" />;
//   }

//   const handleInputBlur = () => {
//     // Delay deactivation to allow click events
//     setTimeout(() => {
//       deactivateSearch();
//       onSearchOpen?.(false);
//     }, 200);
//   };

//   if (isLoading) {
//     return <Skeleton className="h-12 w-full rounded-2xl" />;
//   }

//   if (variant === 'trigger') {
//     return (
//       <div
//         className={cn(
//           "w-full cursor-pointer group",
//           "bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm",
//           "border-2 border-gray-200/50 hover:border-gray-300/50",
//           "transition-all duration-300 hover:shadow-lg"
//         )}
//         onClick={() => {
//           activateSearch();
//           onSearchOpen?.(true);
//         }}
//       >
//         <div className="flex items-center gap-3 px-4 py-3 text-gray-500 group-hover:text-gray-600">
//           <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
//           <span className="text-sm font-medium">Search for products, brands, and more...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full">
//       <form onSubmit={handleSearch}>
//         <div className={cn(
//           "w-full group relative",
//           "bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm",
//           "border-2 border-gray-200/50 focus-within:border-blue-500/50",
//           "transition-all duration-300 focus-within:shadow-lg"
//         )}>
//           <div className="flex items-center gap-3 px-4 py-3">
//             <Search className="w-5 h-5 text-gray-400 transition-transform group-hover:scale-110" />
//             <input
//               type="search"
//               placeholder="Search for products, brands, and more..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               onFocus={handleInputFocus}
//               onBlur={handleInputBlur}
//               className="flex-1 bg-transparent border-0 focus:ring-0 text-sm font-medium placeholder-gray-500 outline-none"
//             />
//             {isSearching && (
//               <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
//             )}
//             {searchQuery && !isSearching && (
//               <button
//                 type="button"
//                 onClick={clearSearch}
//                 className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <X className="w-4 h-4 text-gray-400" />
//               </button>
//             )}
//           </div>
//         </div>
//       </form>

//       {/* Search Results Dropdown */}
//       {isSearchActive && (
//         <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200/50 backdrop-blur-xl z-50 max-h-96 overflow-y-auto">
//           {showPopularSearches && (
//             <PopularSearches
//               popularSearches={popularSearches || []}
//               searchHistory={searchHistory}
//               onSearchClick={handleHistoryClick}
//               onRemoveHistory={removeFromHistory}
//               isLoading={isPopularLoading}
//             />
//           )}

//           {showSearchResults && searchResults && (
//             <SearchResultsContent
//               results={searchResults}
//               onSuggestionClick={handleSuggestionClick}
//               searchQuery={searchQuery}
//             />
//           )}

//           {showSearchResults && searchSuggestions && searchSuggestions.length > 0 && (
//             <SearchSuggestions
//               suggestions={searchSuggestions}
//               onSuggestionClick={handleSuggestionClick}
//             />
//           )}

//           {showNoResults && (
//             <NoResults searchQuery={searchQuery} />
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // Sub-components
// const PopularSearches = ({
//   popularSearches,
//   searchHistory,
//   onSearchClick,
//   onRemoveHistory,
//   isLoading
// }: any) => (
//   <div className="p-4 space-y-4">
//     {/* Recent Searches */}
//     {searchHistory.length > 0 && (
//       <div>
//         <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
//           <Clock className="w-3 h-3" />
//           Recent Searches
//         </h3>
//         <div className="space-y-1">
//           {searchHistory.map((query: string, index: number) => (
//             <button
//               key={index}
//               onClick={() => onSearchClick(query)}
//               className="w-full flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
//             >
//               <div className="flex items-center gap-3">
//                 <Clock className="w-4 h-4 text-gray-400" />
//                 <span>{query}</span>
//               </div>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onRemoveHistory(query);
//                 }}
//                 className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
//               >
//                 <X className="w-3 h-3" />
//               </button>
//             </button>
//           ))}
//         </div>
//       </div>
//     )}

//     {/* Popular Searches */}
//     {!isLoading && popularSearches.length > 0 && (
//       <div>
//         <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
//           <TrendingUp className="w-3 h-3" />
//           Popular Searches
//         </h3>
//         <div className="flex flex-wrap gap-2">
//           {popularSearches.map((search: any, index: number) => (
//             <button
//               key={index}
//               onClick={() => onSearchClick(search.term)}
//               className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
//             >
//               {search.term}
//             </button>
//           ))}
//         </div>
//       </div>
//     )}
//   </div>
// );

// const SearchResultsContent = ({ results, onSuggestionClick, searchQuery }: any) => {
//   const { products, categories, brands } = results;

//   return (
//     <div className="p-4 space-y-4">
//       {/* Products */}
//       {products.length > 0 && (
//         <SearchSection
//           title="Products"
//           items={products}
//           onItemClick={onSuggestionClick}
//           renderItem={(product) => ({
//             type: 'product',
//             text: product.title,
//             slug: product.slug,
//             image: product.images?.[0]?.url,
//             price: product.price,
//             rating: product.rating?.average
//           })}
//         />
//       )}

//       {/* Categories */}
//       {categories.length > 0 && (
//         <SearchSection
//           title="Categories"
//           items={categories}
//           onItemClick={onSuggestionClick}
//           renderItem={(category) => ({
//             type: 'category',
//             text: category.name,
//             slug: category.slug,
//             count: category.productsCount
//           })}
//         />
//       )}

//       {/* Brands */}
//       {brands.length > 0 && (
//         <SearchSection
//           title="Brands"
//           items={brands}
//           onItemClick={onSuggestionClick}
//           renderItem={(brand) => ({
//             type: 'brand',
//             text: brand.name,
//             slug: brand.slug,
//             logo: brand.logo?.url,
//             count: brand.productCount
//           })}
//         />
//       )}

//       {/* View All Results */}
//       {(products.length > 0 || categories.length > 0 || brands.length > 0) && (
//         <div className="pt-2 border-t border-gray-200">
//           <button
//             onClick={() => onSuggestionClick({ text: searchQuery })}
//             className="w-full flex items-center justify-center gap-2 p-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//           >
//             <Search className="w-4 h-4" />
//             View all results for "{searchQuery}"
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// const SearchSection = ({ title, items, onItemClick, renderItem }: any) => (
//   <div>
//     <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
//       {title}
//     </h3>
//     <div className="space-y-2">
//       {items.slice(0, 3).map((item: any, index: number) => {
//         const suggestion = renderItem(item);
//         return (
//           <button
//             key={index}
//             onClick={() => onItemClick(suggestion)}
//             className="w-full flex items-center gap-3 p-2 text-sm hover:bg-gray-50 rounded-lg transition-colors text-left"
//           >
//             {suggestion.image && (
//               <img
//                 src={suggestion.image}
//                 alt={suggestion.text}
//                 className="w-8 h-8 rounded-lg object-cover"
//               />
//             )}
//             {suggestion.logo && (
//               <img
//                 src={suggestion.logo}
//                 alt={suggestion.text}
//                 className="w-8 h-8 rounded-lg object-cover"
//               />
//             )}
//             {!suggestion.image && !suggestion.logo && (
//               <div className={cn(
//                 "w-8 h-8 rounded-lg flex items-center justify-center",
//                 suggestion.type === 'category' ? "bg-blue-100 text-blue-600" :
//                 suggestion.type === 'brand' ? "bg-green-100 text-green-600" :
//                 "bg-gray-100 text-gray-600"
//               )}>
//                 <span className="text-xs font-medium">
//                   {suggestion.type === 'category' ? 'C' :
//                    suggestion.type === 'brand' ? 'B' : 'P'}
//                 </span>
//               </div>
//             )}
//             <div className="flex-1 min-w-0">
//               <div className="font-medium text-gray-900 truncate">{suggestion.text}</div>
//               <div className="text-xs text-gray-500 flex items-center gap-2">
//                 {suggestion.price && <span>${suggestion.price}</span>}
//                 {suggestion.rating > 0 && (
//                   <>
//                     <span>•</span>
//                     <span>⭐ {suggestion.rating.toFixed(1)}</span>
//                   </>
//                 )}
//                 {suggestion.count > 0 && (
//                   <>
//                     <span>•</span>
//                     <span>{suggestion.count} products</span>
//                   </>
//                 )}
//               </div>
//             </div>
//           </button>
//         );
//       })}
//     </div>
//   </div>
// );

// const SearchSuggestions = ({ suggestions, onSuggestionClick }: any) => (
//   <div className="p-4">
//     <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
//       Suggestions
//     </h3>
//     <div className="space-y-1">
//       {suggestions.map((suggestion: any, index: number) => (
//         <button
//           key={index}
//           onClick={() => onSuggestionClick(suggestion)}
//           className="w-full flex items-center gap-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
//         >
//           <Search className="w-4 h-4 text-gray-400" />
//           <div>
//             <div className="font-medium">{suggestion.text}</div>
//             {suggestion.category && (
//               <div className="text-xs text-gray-500 capitalize">{suggestion.category}</div>
//             )}
//           </div>
//         </button>
//       ))}
//     </div>
//   </div>
// );

// const NoResults = ({ searchQuery }: { searchQuery: string }) => (
//   <div className="text-center py-8">
//     <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
//     <p className="text-gray-500 text-sm">No results found for "{searchQuery}"</p>
//     <p className="text-gray-400 text-xs mt-1">Try different keywords or check spelling</p>
//   </div>
// );

// components/layout/SearchBar.tsx
'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  isLoading: boolean;
  variant?: 'default' | 'trigger';
  onClick?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isLoading,
  variant = 'default',
  onClick
}) => {
  if (isLoading) {
    return <Skeleton className="h-12 w-full rounded-2xl" />;
  }

  return (
    <div
      className={cn(
        "w-full cursor-pointer group",
        "bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm",
        "border-2 border-gray-200/50 hover:border-gray-300/50",
        "transition-all duration-300 hover:shadow-lg"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 px-4 py-3 text-gray-500 group-hover:text-gray-600">
        <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
        <span className="text-sm font-medium">Search for products, brands, and more...</span>
      </div>
    </div>
  );
};
