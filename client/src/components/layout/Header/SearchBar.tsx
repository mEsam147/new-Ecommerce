// components/layout/SearchBar.tsx
'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  isLoading: boolean;
  variant?: 'default' | 'trigger';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isLoading,
  variant = 'default'
}) => {
  if (isLoading) {
    return <Skeleton className="h-12 w-full rounded-2xl" />;
  }

  if (variant === 'trigger') {
    return (
      <div className={cn(
        "w-full cursor-pointer group",
        "bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm",
        "border-2 border-gray-200/50 hover:border-gray-300/50",
        "transition-all duration-300 hover:shadow-lg"
      )}>
        <div className="flex items-center gap-3 px-4 py-3 text-gray-500 group-hover:text-gray-600">
          <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="text-sm font-medium">Search for products, brands, and more...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full cursor-pointer group",
      "bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm",
      "border-2 border-gray-200/50 hover:border-gray-300/50",
      "transition-all duration-300 hover:shadow-lg"
    )}>
      <div className="flex items-center gap-3 px-4 py-3 text-gray-500 group-hover:text-gray-600">
        <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
        <span className="text-sm font-medium">Search for products, brands, and more...</span>
      </div>
    </div>
  );
};
