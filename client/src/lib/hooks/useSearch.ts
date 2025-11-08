// // lib/hooks/useSearch.ts
// import { useState, useCallback, useEffect } from 'react';
// import { useDebounce } from './useDebounce';
// import {
//   useSearchAllQuery,
//   useLazySearchAllQuery,
//   useGetSearchSuggestionsQuery,
//   useLazyGetSearchSuggestionsQuery,
//   useGetPopularSearchesQuery,
//   SearchResult,
//   SearchSuggestion
// } from '@/lib/services/searchApi';

// export const useSearch = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isSearchActive, setIsSearchActive] = useState(false);
//   const [showResults, setShowResults] = useState(false);
//   const debouncedSearch = useDebounce(searchQuery, 300);

//   // Queries
//   const {
//     data: searchResults,
//     isLoading: isSearching,
//     error: searchError,
//     isFetching: isFetchingResults
//   } = useSearchAllQuery(
//     { query: debouncedSearch, limit: 5 },
//     {
//       skip: !debouncedSearch || debouncedSearch.length < 2 || !isSearchActive,
//       refetchOnFocus: false,
//       refetchOnReconnect: false
//     }
//   );

//   const {
//     data: popularSearches,
//     isLoading: isPopularLoading
//   } = useGetPopularSearchesQuery({ limit: 8 });

//   const {
//     data: searchSuggestions,
//     isLoading: isSuggestionsLoading
//   } = useGetSearchSuggestionsQuery(
//     { query: debouncedSearch, limit: 5 },
//     { skip: !debouncedSearch || debouncedSearch.length < 2 }
//   );

//   // Handle search input change
//   const handleSearchChange = useCallback((query: string) => {
//     setSearchQuery(query);
//     if (query.length >= 2) {
//       setShowResults(true);
//     } else {
//       setShowResults(false);
//     }
//   }, []);

//   // Clear search
//   const clearSearch = useCallback(() => {
//     setSearchQuery('');
//     setShowResults(false);
//   }, []);

//   // Activate search (when input is focused)
//   const activateSearch = useCallback(() => {
//     setIsSearchActive(true);
//     if (searchQuery.length >= 2) {
//       setShowResults(true);
//     }
//   }, [searchQuery]);

//   // Deactivate search (when input loses focus)
//   const deactivateSearch = useCallback(() => {
//     // Delay hiding results to allow click events
//     setTimeout(() => {
//       setIsSearchActive(false);
//       setShowResults(false);
//     }, 200);
//   }, []);

//   // Check if we have any results
//   const hasResults = searchResults && (
//     searchResults.products.length > 0 ||
//     searchResults.categories.length > 0 ||
//     searchResults.brands.length > 0 ||
//     searchResults.suggestions.length > 0
//   );

//   // Determine what to show
//   const showPopularSearches = isSearchActive && !searchQuery && !isSearching;
//   const showSearchResults = showResults && searchQuery.length >= 2 && hasResults;
//   const showSuggestions = showResults && searchQuery.length >= 2 && searchSuggestions && searchSuggestions.length > 0;
//   const showNoResults = showResults && searchQuery.length >= 2 && !hasResults && !isSearching;
//   const showLoading = isSearching && searchQuery.length >= 2;

//   return {
//     // State
//     searchQuery,
//     setSearchQuery: handleSearchChange,
//     searchResults,
//     popularSearches,
//     searchSuggestions,

//     // Loading states
//     isSearching: showLoading,
//     isPopularLoading,
//     isSuggestionsLoading,
//     isFetchingResults,

//     // Status
//     hasResults,
//     isSearchActive,
//     searchError,
//     showResults,

//     // Display conditions
//     showPopularSearches,
//     showSearchResults,
//     showSuggestions,
//     showNoResults,
//     showLoading,

//     // Actions
//     clearSearch,
//     activateSearch,
//     deactivateSearch,
//     setShowResults
//   };
// };

// export const useLazySearch = () => {
//   const [triggerSearchAll, searchAllResult] = useLazySearchAllQuery();
//   const [triggerSearchSuggestions, searchSuggestionsResult] = useLazyGetSearchSuggestionsQuery();

//   const searchAll = useCallback(async (query: string, limit: number = 5) => {
//     if (!query || query.length < 2) return null;

//     try {
//       const result = await triggerSearchAll({ query, limit }).unwrap();
//       return result;
//     } catch (error) {
//       console.error('Search error:', error);
//       return null;
//     }
//   }, [triggerSearchAll]);

//   const getSuggestions = useCallback(async (query: string, limit: number = 5) => {
//     if (!query || query.length < 2) return [];

//     try {
//       const result = await triggerSearchSuggestions({ query, limit }).unwrap();
//       return result;
//     } catch (error) {
//       console.error('Suggestions error:', error);
//       return [];
//     }
//   }, [triggerSearchSuggestions]);

//   return {
//     // Search functions
//     searchAll,
//     getSuggestions,

//     // Results
//     searchAllResult: {
//       data: searchAllResult.data,
//       isLoading: searchAllResult.isLoading,
//       error: searchAllResult.error,
//       isFetching: searchAllResult.isFetching
//     },
//     searchSuggestionsResult: {
//       data: searchSuggestionsResult.data,
//       isLoading: searchSuggestionsResult.isLoading,
//       error: searchSuggestionsResult.error
//     }
//   };
// };

// export const useSearchHistory = () => {
//   const [searchHistory, setSearchHistory] = useState<string[]>([]);

//   useEffect(() => {
//     // Load search history from localStorage
//     const savedHistory = localStorage.getItem('searchHistory');
//     if (savedHistory) {
//       try {
//         setSearchHistory(JSON.parse(savedHistory));
//       } catch (error) {
//         console.error('Error loading search history:', error);
//       }
//     }
//   }, []);

//   const addToHistory = useCallback((query: string) => {
//     if (!query.trim()) return;

//     const trimmedQuery = query.trim();
//     setSearchHistory(prev => {
//       const filtered = prev.filter(item =>
//         item.toLowerCase() !== trimmedQuery.toLowerCase()
//       );
//       const newHistory = [trimmedQuery, ...filtered].slice(0, 10);

//       localStorage.setItem('searchHistory', JSON.stringify(newHistory));
//       return newHistory;
//     });
//   }, []);

//   const clearHistory = useCallback(() => {
//     setSearchHistory([]);
//     localStorage.removeItem('searchHistory');
//   }, []);

//   const removeFromHistory = useCallback((query: string) => {
//     setSearchHistory(prev => {
//       const newHistory = prev.filter(item => item !== query);
//       localStorage.setItem('searchHistory', JSON.stringify(newHistory));
//       return newHistory;
//     });
//   }, []);

//   return {
//     searchHistory,
//     addToHistory,
//     clearHistory,
//     removeFromHistory
//   };
// };

// export const useSearchNavigation = () => {
//   const navigateToSearch = useCallback((query: string) => {
//     if (query.trim()) {
//       window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
//     }
//   }, []);

//   const navigateToSuggestion = useCallback((suggestion: SearchSuggestion) => {
//     if (suggestion.url) {
//       window.location.href = suggestion.url;
//     } else {
//       navigateToSearch(suggestion.text);
//     }
//   }, [navigateToSearch]);

//   const navigateToProduct = useCallback((productSlug: string) => {
//     window.location.href = `/products/${productSlug}`;
//   }, []);

//   const navigateToCategory = useCallback((categorySlug: string) => {
//     window.location.href = `/categories/${categorySlug}`;
//   }, []);

//   const navigateToBrand = useCallback((brandSlug: string) => {
//     window.location.href = `/brands/${brandSlug}`;
//   }, []);

//   return {
//     navigateToSearch,
//     navigateToSuggestion,
//     navigateToProduct,
//     navigateToCategory,
//     navigateToBrand
//   };
// };



import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import {
  useSearchAllQuery,
  useLazySearchAllQuery,
  useGetSearchSuggestionsQuery,
  useLazyGetSearchSuggestionsQuery,
  useGetPopularSearchesQuery,
  SearchSuggestion,
} from '@/lib/services/searchApi';
import { useRouter } from 'next/navigation';

/* -------------------------------------------------------------------------- */
/*                                useSearch Hook                               */
/* -------------------------------------------------------------------------- */
export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Queries
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    isFetching: isFetchingResults,
  } = useSearchAllQuery(
    { query: debouncedSearch, limit: 5 },
    {
      skip: !debouncedSearch || debouncedSearch.length < 2 || !isSearchActive,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  const {
    data: popularSearches,
    isLoading: isPopularLoading,
  } = useGetPopularSearchesQuery({ limit: 8 });

  const {
    data: searchSuggestions,
    isLoading: isSuggestionsLoading,
  } = useGetSearchSuggestionsQuery(
    { query: debouncedSearch, limit: 5 },
    { skip: !debouncedSearch || debouncedSearch.length < 2 }
  );

  // Handle input change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setShowResults(query.length >= 2);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowResults(false);
  }, []);

  // Activate search
  const activateSearch = useCallback(() => {
    setIsSearchActive(true);
    if (searchQuery.length >= 2) setShowResults(true);
  }, [searchQuery]);

  // Deactivate search
  const deactivateSearch = useCallback(() => {
    setTimeout(() => {
      setIsSearchActive(false);
      setShowResults(false);
    }, 200);
  }, []);

  // Has results
  const hasResults =
    searchResults &&
    (searchResults.products.length > 0 ||
      searchResults.categories.length > 0 ||
      searchResults.brands.length > 0 ||
      searchResults.suggestions.length > 0);

  // Display logic
  const showPopularSearches = isSearchActive && !searchQuery && !isSearching;
  const showSearchResults = showResults && searchQuery.length >= 2 && hasResults;
  const showSuggestions =
    showResults &&
    searchQuery.length >= 2 &&
    searchSuggestions &&
    searchSuggestions.length > 0;
  const showNoResults =
    showResults && searchQuery.length >= 2 && !hasResults && !isSearching;
  const showLoading = isSearching && searchQuery.length >= 2;

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    searchResults,
    popularSearches,
    searchSuggestions,

    // Loading states
    isSearching: showLoading,
    isPopularLoading,
    isSuggestionsLoading,
    isFetchingResults,

    // Status
    hasResults,
    isSearchActive,
    searchError,
    showResults,

    // Display
    showPopularSearches,
    showSearchResults,
    showSuggestions,
    showNoResults,
    showLoading,

    // Actions
    clearSearch,
    activateSearch,
    deactivateSearch,
    setShowResults,
  };
};

/* -------------------------------------------------------------------------- */
/*                              useLazySearch Hook                             */
/* -------------------------------------------------------------------------- */
export const useLazySearch = () => {
  const [triggerSearchAll, searchAllResult] = useLazySearchAllQuery();
  const [triggerSearchSuggestions, searchSuggestionsResult] =
    useLazyGetSearchSuggestionsQuery();

  const searchAll = useCallback(
    async (query: string, limit: number = 5) => {
      if (!query || query.length < 2) return null;
      try {
        const result = await triggerSearchAll({ query, limit }).unwrap();
        return result;
      } catch (error) {
        console.error('Search error:', error);
        return null;
      }
    },
    [triggerSearchAll]
  );

  const getSuggestions = useCallback(
    async (query: string, limit: number = 5) => {
      if (!query || query.length < 2) return [];
      try {
        const result = await triggerSearchSuggestions({ query, limit }).unwrap();
        return result;
      } catch (error) {
        console.error('Suggestions error:', error);
        return [];
      }
    },
    [triggerSearchSuggestions]
  );

  return {
    searchAll,
    getSuggestions,
    searchAllResult,
    searchSuggestionsResult,
  };
};

/* -------------------------------------------------------------------------- */
/*                            useSearchHistory Hook                            */
/* -------------------------------------------------------------------------- */
export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    const trimmedQuery = query.trim();
    setSearchHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== trimmedQuery.toLowerCase()
      );
      const newHistory = [trimmedQuery, ...filtered].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    setSearchHistory((prev) => {
      const newHistory = prev.filter((item) => item !== query);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
};

/* -------------------------------------------------------------------------- */
/*                         useSearchNavigation Hook (router)                   */
/* -------------------------------------------------------------------------- */
export const useSearchNavigation = () => {
  const router = useRouter();

  const navigateToSearch = useCallback(
    (query: string) => {
      if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    },
    [router]
  );

  const navigateToSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      if (suggestion.url) router.push(suggestion.url);
      else navigateToSearch(suggestion.text);
    },
    [router, navigateToSearch]
  );

  const navigateToProduct = useCallback(
    (slug: string) => router.push(`/shop/product/${slug}`),
    [router]
  );

  const navigateToCategory = useCallback(
    (slug: string) => router.push(`/categories/${slug}`),
    [router]
  );

  const navigateToBrand = useCallback(
    (slug: string) => router.push(`/brands/${slug}`),
    [router]
  );

  const navigateToCart = useCallback(() => router.push('/cart'), [router]);
  const navigateToWishlist = useCallback(() => router.push('/wishlist'), [router]);

  return {
    navigateToSearch,
    navigateToSuggestion,
    navigateToProduct,
    navigateToCategory,
    navigateToBrand,
    navigateToCart,
    navigateToWishlist,
  };
};

