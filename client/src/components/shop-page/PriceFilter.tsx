// components/shop/PriceFilter.tsx
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PriceFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (minPrice?: number, maxPrice?: number) => void;
  isFiltering?: boolean;
  onEnterPress?: () => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({
  minPrice,
  maxPrice,
  onPriceChange,
  isFiltering = false,
  onEnterPress
}) => {
  const [values, setValues] = useState([minPrice || 0, maxPrice || 1000]);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const sliderRef = useRef<HTMLDivElement>(null);

  const hasSelection = (minPrice && minPrice > 0) || (maxPrice && maxPrice < 1000);

  const handleChange = useCallback((newValues: number[]) => {
    setValues(newValues);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onPriceChange(newValues[0], newValues[1]);
    }, 400);
  }, [onPriceChange]);

  const handleClear = () => {
    setValues([0, 1000]);
    onPriceChange(undefined, undefined);
  };

  // Handle Enter key on the slider container
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onEnterPress?.();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={sliderRef}
      tabIndex={0}
      onKeyPress={handleKeyPress}
      className="space-y-3 focus:outline-none relative"
    >
      {/* Clear Button - Top Right */}
      {hasSelection && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 z-10"
          title="Clear price range"
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      {/* Price Display */}
      <div className="text-center py-2 bg-gray-50 rounded">
        <div className="text-sm font-semibold text-gray-900">
          ${values[0]} - ${values[1]}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Press Enter to apply
        </div>
      </div>

      {/* Slider */}
      <Slider
        value={values}
        min={0}
        max={1000}
        step={10}
        onValueChange={handleChange}
      />

      {/* Loading State */}
      {isFiltering && (
        <div className="text-center text-xs text-blue-600">
          Applying price filter...
        </div>
      )}
    </div>
  );
};

export default PriceFilter;
