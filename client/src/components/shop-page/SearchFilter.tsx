// components/shop/SearchFilter.tsx
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (search: string) => void;
  placeholder?: string;
  isSearching?: boolean; // Add loading state prop
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search products...",
  isSearching = false
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with parent state
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced search with immediate feedback
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    setIsTyping(true);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Faster debounce for better UX (300ms)
    timeoutRef.current = setTimeout(() => {
      onSearchChange(value);
      setIsTyping(false);
    }, 600);
  }, [onSearchChange]);

  const handleClear = useCallback(() => {
    setLocalSearch('');
    setIsTyping(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSearchChange(''); // Immediate clear
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [onSearchChange]);

  // Show loading when either typing (debounce) or actual search is happening
  const showLoading = isTyping || isSearching;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        ref={inputRef}
        type="text"
        value={localSearch}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-10"
        disabled={isSearching} // Disable input while searching
      />

      {/* Loading Spinner or Clear Button */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {showLoading ? (
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
        ) : localSearch ? (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default SearchFilter;
