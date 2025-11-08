// components/shop/BrandFilter.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface BrandFilterProps {
  availableBrands: string[];
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  onEnterPress?: () => void;
}

const BrandFilter: React.FC<BrandFilterProps> = ({
  availableBrands,
  selectedBrands,
  onBrandsChange,
  onEnterPress
}) => {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasSelection = selectedBrands.length > 0;

  const handleClear = () => {
    onBrandsChange([]);
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onEnterPress?.();
    }
  };

  // Handle Enter key on brand items
  const handleBrandKeyPress = (e: React.KeyboardEvent, brand: string) => {
    if (e.key === 'Enter') {
      toggleBrand(brand);
      onEnterPress?.();
    }
  };

  const toggleBrand = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    onBrandsChange(newBrands);
  };

  // Filter brands based on search
  const filteredBrands = availableBrands.filter(brand =>
    brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show limited brands initially, all when expanded
  const displayBrands = showAll ? filteredBrands : filteredBrands.slice(0, 6);
  const hasMoreBrands = filteredBrands.length > 6;

  return (
    <div className="space-y-3 relative">
      {/* Clear Button - Top Right */}
      {hasSelection && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 z-10"
          title="Clear brands"
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search brands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          className="pl-10 text-sm"
        />
      </div>

      {/* Brands List */}
      <div className="space-y-2 ">
        {displayBrands.map((brand) => {
          const isSelected = selectedBrands.includes(brand);
          return (
            <div
              key={brand}
              tabIndex={0}
              className={cn(
                "flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                isSelected
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50"
              )}
              onClick={() => toggleBrand(brand)}
              onKeyPress={(e) => handleBrandKeyPress(e, brand)}
            >
              <Checkbox
                id={`brand-${brand}`}
                checked={isSelected}
                onCheckedChange={() => toggleBrand(brand)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label
                htmlFor={`brand-${brand}`}
                className={cn(
                  "text-sm font-normal cursor-pointer flex-1",
                  isSelected ? "text-blue-700 font-medium" : "text-gray-700"
                )}
              >
                {brand}
              </Label>
              {isSelected && (
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </div>
          );
        })}

        {filteredBrands.length === 0 && (
          <div className="text-center py-2 text-sm text-gray-500">
            No brands found
          </div>
        )}
      </div>

      {/* Show More/Less Toggle */}
      {hasMoreBrands && (
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
              Show More ({filteredBrands.length - 6} more)
            </>
          )}
        </Button>
      )}

      {/* Selected Count */}
      {selectedBrands.length > 0 && (
        <div className="text-xs text-blue-600 font-medium">
          {selectedBrands.length} brand{selectedBrands.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default BrandFilter;
