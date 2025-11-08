// components/shop/ColorFilter.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, CheckCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorFilterProps {
  availableColors: string[];
  selectedColors: string[];
  onColorsChange: (colors: string[]) => void;
  onEnterPress?: () => void;
  variant?: 'compact' | 'grid';
}

// Add the missing colorMap
const colorMap: { [key: string]: { name: string; bg: string; border: string; checkColor: string } } = {
  'red': { name: 'Red', bg: 'bg-red-500', border: 'border-red-600', checkColor: 'text-white' },
  'blue': { name: 'Blue', bg: 'bg-blue-500', border: 'border-blue-600', checkColor: 'text-white' },
  'green': { name: 'Green', bg: 'bg-green-500', border: 'border-green-600', checkColor: 'text-white' },
  'black': { name: 'Black', bg: 'bg-gray-900', border: 'border-gray-900', checkColor: 'text-white' },
  'white': { name: 'White', bg: 'bg-white border-2', border: 'border-gray-400', checkColor: 'text-gray-600' },
  'yellow': { name: 'Yellow', bg: 'bg-yellow-400', border: 'border-yellow-500', checkColor: 'text-gray-800' },
  'purple': { name: 'Purple', bg: 'bg-purple-500', border: 'border-purple-600', checkColor: 'text-white' },
  'pink': { name: 'Pink', bg: 'bg-pink-500', border: 'border-pink-600', checkColor: 'text-white' },
  'orange': { name: 'Orange', bg: 'bg-orange-500', border: 'border-orange-600', checkColor: 'text-white' },
  'brown': { name: 'Brown', bg: 'bg-amber-800', border: 'border-amber-900', checkColor: 'text-white' },
  'gray': { name: 'Gray', bg: 'bg-gray-500', border: 'border-gray-600', checkColor: 'text-white' },
  'navy': { name: 'Navy', bg: 'bg-blue-900', border: 'border-blue-900', checkColor: 'text-white' },
  'teal': { name: 'Teal', bg: 'bg-teal-500', border: 'border-teal-600', checkColor: 'text-white' },
  'indigo': { name: 'Indigo', bg: 'bg-indigo-500', border: 'border-indigo-600', checkColor: 'text-white' },
  'gold': { name: 'Gold', bg: 'bg-yellow-500', border: 'border-yellow-600', checkColor: 'text-gray-800' },
  'silver': { name: 'Silver', bg: 'bg-gray-300', border: 'border-gray-400', checkColor: 'text-gray-600' },
};

const ColorFilter: React.FC<ColorFilterProps> = ({
  availableColors,
  selectedColors,
  onColorsChange,
  onEnterPress,
  variant = 'grid'
}) => {
  const [showAll, setShowAll] = useState(false);

  const hasSelection = selectedColors.length > 0;

  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    onColorsChange(newColors);
  };

  const handleClear = () => {
    onColorsChange([]);
  };

  const handleColorKeyPress = (e: React.KeyboardEvent, color: string) => {
    if (e.key === 'Enter') {
      toggleColor(color);
      onEnterPress?.();
    }
  };

  const getColorInfo = (color: string) => {
    const normalizedColor = color.toLowerCase();
    return colorMap[normalizedColor] || {
      name: color,
      bg: 'bg-gray-400',
      border: 'border-gray-500',
      checkColor: 'text-white'
    };
  };

  // Display limited colors initially
  const displayColors = showAll ? availableColors : availableColors.slice(0, 12);
  const hasMoreColors = availableColors.length > 12;

  return (
    <div className="space-y-3 relative">
      {/* Clear Button - Top Right */}
      {hasSelection && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 z-10"
          title="Clear colors"
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      <div className="grid grid-cols-6 gap-2">
        {displayColors.map((color) => {
          const colorInfo = getColorInfo(color);
          const isSelected = selectedColors.includes(color);

          return (
            <button
              key={color}
              tabIndex={0}
              onClick={() => toggleColor(color)}
              onKeyPress={(e) => handleColorKeyPress(e, color)}
              className={cn(
                "group relative flex flex-col items-center gap-1 p-1 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                isSelected
                  ? <CheckCheck/>
                  : "hover:bg-gray-50"
              )}
              title={colorInfo.name}
            >
              {/* Color Circle */}
              <div className={cn(
                "w-8 h-8 rounded-full border-2 transition-transform",
                colorInfo.bg,
                colorInfo.border,
                isSelected ? "scale-110" : "group-hover:scale-105"
              )}>
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className={cn("w-3 h-3", colorInfo.checkColor)} />
                  </div>
                )}
              </div>

              {/* Color Name */}
              <div className="text-[10px] text-gray-600 font-medium truncate max-w-full opacity-0 group-hover:opacity-100 transition-opacity">
                {colorInfo.name}
              </div>

              {/* Always show name for selected colors */}
              {isSelected && (
                <div className="text-[10px] text-blue-600 font-semibold truncate max-w-full">
                  {colorInfo.name}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Show More/Less Toggle */}
      {hasMoreColors && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="w-full text-xs text-gray-600 hover:text-gray-900"
        >
          {showAll ? 'Show Less' : `Show More Colors (${availableColors.length - 12})`}
        </Button>
      )}

      {/* Selected Count */}
      {selectedColors.length > 0 && (
        <div className="text-xs text-blue-600 font-medium">
          {selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default ColorFilter;
