// lib/hooks/useSearch.ts
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

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Queries - FIXED: Properly handle API responses
  const {
    data: searchResultsData,
    isLoading: isSearching,
    error: searchError,
    isFetching: isFetchingResults,
  } = useSearchAllQuery(
    { query: debouncedSearch, limit: 10 },
    {
      skip: !debouncedSearch || debouncedSearch.length < 2 || !isSearchActive,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  const {
    data: popularSearchesData,
    isLoading: isPopularLoading,
  } = useGetPopularSearchesQuery({ limit: 8 });

  const {
    data: searchSuggestionsData,
    isLoading: isSuggestionsLoading,
  } = useGetSearchSuggestionsQuery(
    { query: debouncedSearch, limit: 8 },
    {
      skip: !debouncedSearch || debouncedSearch.length < 2,
      refetchOnFocus: false
    }
  );

  // Extract data from API responses - FIXED: Handle the actual response structure
  const searchResults = searchResultsData || {
    products: [],
    categories: [],
    brands: [],
    suggestions: [],
    query: ''
  };

  const popularSearches = popularSearchesData || [];
  const searchSuggestions = searchSuggestionsData || [];

  // Handle input change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowResults(false);
  }, []);

  // Activate search
  const activateSearch = useCallback(() => {
    setIsSearchActive(true);
    if (searchQuery.length >= 2) {
      setShowResults(true);
    }
  }, [searchQuery]);

  // Deactivate search
  const deactivateSearch = useCallback(() => {
    setIsSearchActive(false);
    setShowResults(false);
  }, []);

  // FIXED: Better result checking logic
  const hasProducts = searchResults.products && searchResults.products.length > 0;
  const hasCategories = searchResults.categories && searchResults.categories.length > 0;
  const hasBrands = searchResults.brands && searchResults.brands.length > 0;
  const hasApiSuggestions = searchResults.suggestions && searchResults.suggestions.length > 0;
  const hasSuggestions = searchSuggestions && searchSuggestions.length > 0;

  const hasResults = hasProducts || hasCategories || hasBrands || hasApiSuggestions || hasSuggestions;

  // FIXED: Improved display logic
  const showPopularSearches = isSearchActive && !searchQuery && !isSearching;
  const showSearchResults = showResults && searchQuery.length >= 2 && hasResults && !isSearching;
  const showSuggestionsOnly = showResults && searchQuery.length >= 2 && hasSuggestions && !hasProducts && !hasCategories && !hasBrands;
  const showNoResults = showResults && searchQuery.length >= 2 && !hasResults && !isSearching;
  const showLoading = isSearching && searchQuery.length >= 2;

  console.log('Search State:', {
    searchQuery,
    showPopularSearches,
    showSearchResults,
    showSuggestionsOnly,
    showNoResults,
    showLoading,
    hasProducts,
    hasBrands,
    hasSuggestions,
    popularSearches: popularSearches.length,
    searchSuggestions: searchSuggestions.length
  });

  return {
    // State
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

    // Display conditions
    showPopularSearches,
    showSearchResults,
    showSuggestions: showSuggestionsOnly,
    showNoResults,
    showLoading,

    // Actions
    clearSearch,
    activateSearch,
    deactivateSearch,
    setShowResults
  };
};

export const useLazySearch = () => {
  const [triggerSearchAll, searchAllResult] = useLazySearchAllQuery();
  const [triggerSearchSuggestions, searchSuggestionsResult] = useLazyGetSearchSuggestionsQuery();

  const searchAll = useCallback(async (query: string, limit: number = 10) => {
    if (!query || query.length < 2) return null;
    try {
      const result = await triggerSearchAll({ query, limit }).unwrap();
      return result.data;
    } catch (error) {
      console.error('Search error:', error);
      return null;
    }
  }, [triggerSearchAll]);

  const getSuggestions = useCallback(async (query: string, limit: number = 8) => {
    if (!query || query.length < 2) return [];
    try {
      const result = await triggerSearchSuggestions({ query, limit }).unwrap();
      return result.data;
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }, [triggerSearchSuggestions]);

  return {
    searchAll,
    getSuggestions,
    searchAllResult,
    searchSuggestionsResult,
  };
};

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
    setSearchHistory(prev => {
      const filtered = prev.filter(item =>
        item.toLowerCase() !== trimmedQuery.toLowerCase()
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
    setSearchHistory(prev => {
      const newHistory = prev.filter(item => item !== query);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
};

export const useSearchNavigation = () => {
  const router = useRouter();

  // FIXED: Use the correct router paths from your application
  const navigateToSearch = useCallback((query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [router]);

  const navigateToSuggestion = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.url) {
      router.push(suggestion.url);
    } else {
      navigateToSearch(suggestion.text);
    }
  }, [navigateToSearch, router]);

  // FIXED: Use the correct product path - choose one based on your app structure
  const navigateToProduct = useCallback((slug: string) => {
    // Try both common patterns - adjust based on your actual routes
    router.push(`/shop/product/${slug}`);
    // OR if you have shop structure:
    // router.push(`/shop/product/${slug}`);
  }, [router]);

  const navigateToCategory = useCallback((slug: string) => {
    router.push(`/categories/${slug}`);
  }, [router]);

  const navigateToBrand = useCallback((slug: string) => {
    router.push(`/brands/${slug}`);
  }, [router]);

  return {
    navigateToSearch,
    navigateToSuggestion,
    navigateToProduct,
    navigateToCategory,
    navigateToBrand
  };
};
