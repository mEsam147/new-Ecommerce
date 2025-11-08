// components/shop/SizeFilter.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SizeFilterProps {
  availableSizes: string[];
  selectedSizes: string[];
  onSizesChange: (sizes: string[]) => void;
  onEnterPress?: () => void;
  variant?: 'compact' | 'chip';
}

const SizeFilter: React.FC<SizeFilterProps> = ({
  availableSizes,
  selectedSizes,
  onSizesChange,
  onEnterPress,
  variant = 'chip'
}) => {
  const [showAll, setShowAll] = useState(false);

  const hasSelection = selectedSizes.length > 0;

  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    onSizesChange(newSizes);
  };

  const handleClear = () => {
    onSizesChange([]);
  };

  const handleSizeKeyPress = (e: React.KeyboardEvent, size: string) => {
    if (e.key === 'Enter') {
      toggleSize(size);
      onEnterPress?.();
    }
  };

  // Display limited sizes initially
  const displaySizes = showAll ? availableSizes : availableSizes.slice(0, 8);
  const hasMoreSizes = availableSizes.length > 8;

  // Compact variant for sidebar
  if (variant === 'compact') {
    return (
      <div className="space-y-3 relative">
        {/* Clear Button - Top Right */}
        {hasSelection && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 z-10"
            title="Clear sizes"
          >
            <X className="w-3 h-3" />
          </Button>
        )}

        <div className="grid grid-cols-4 gap-2">
          {displaySizes.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                tabIndex={0}
                onClick={() => toggleSize(size)}
                onKeyPress={(e) => handleSizeKeyPress(e, size)}
                className={cn(
                  " py-1 rounded text-sm font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                  isSelected
                    ? "bg-blue-600 text-white py-1 border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>

        {/* Show More/Less Toggle */}
        {hasMoreSizes && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full text-xs text-gray-600 hover:text-gray-900"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show More ({availableSizes.length - 8} more)
              </>
            )}
          </Button>
        )}

        {/* Selected Count */}
        {selectedSizes.length > 0 && (
          <div className="text-xs text-blue-600 font-medium">
            {selectedSizes.length} size{selectedSizes.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>
    );
  }

  // Chip variant (default)
  return (
    <div className="space-y-3 relative">
      {/* Clear Button - Top Right */}
      {hasSelection && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 z-10"
          title="Clear sizes"
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      <div className="flex flex-wrap gap-2">
        {displaySizes.map((size) => {
          const isSelected = selectedSizes.includes(size);
          return (
            <button
              key={size}
              tabIndex={0}
              onClick={() => toggleSize(size)}
              onKeyPress={(e) => handleSizeKeyPress(e, size)}
              className={cn(
                "px-3 py-1.3 rounded-full text-sm font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                isSelected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              )}
            >
              {size}
            </button>
          );
        })}
      </div>

      {/* Show More/Less Toggle */}
      {hasMoreSizes && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="w-full text-xs text-gray-600 hover:text-gray-900"
        >
          {showAll ? 'Show Less' : `Show More (${availableSizes.length - 8})`}
        </Button>
      )}

      {/* Selected Count */}
      {selectedSizes.length > 0 && (
        <div className="text-xs text-blue-600 font-medium">
          {selectedSizes.length} size{selectedSizes.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default SizeFilter;
