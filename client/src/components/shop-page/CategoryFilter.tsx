// components/shop/CategoryFilter.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onEnterPress?: () => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onEnterPress
}) => {
  // Fix: Check if there's an actual selection (not empty and not 'All')
  const hasSelection = selectedCategory && selectedCategory !== 'All' && selectedCategory !== '';

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category);
    // Don't auto-apply on category select, let user press Enter or Apply button
  };

  const handleClear = () => {
    onCategoryChange('All');
  };

  const handleKeyPress = (e: React.KeyboardEvent, category: string) => {
    if (e.key === 'Enter') {
      handleCategorySelect(category);
      onEnterPress?.(); // Apply filters when Enter is pressed
    }
  };

  // Fix: Ensure 'All' category is always included and properly handled
  const displayCategories = categories.includes('All') ? categories : ['All', ...categories];

  return (
    <div className="space-y-3 relative">
      {/* Clear Button - Top Right */}
      {hasSelection && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 z-10"
          title="Clear category"
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      <div className="grid grid-cols-2 gap-2">
        {displayCategories.map((category) => {
          // Fix: Proper selection logic for "All" category
          const isSelected = category === 'All'
            ? !selectedCategory || selectedCategory === 'All' || selectedCategory === ''
            : selectedCategory === category;

          return (
            <button
              key={category}
              tabIndex={0}
              onClick={() => handleCategorySelect(category)}
              onKeyPress={(e) => handleKeyPress(e, category)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                isSelected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              )}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
