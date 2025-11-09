'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';

interface FeaturedFilterProps {
  featured: boolean;
  onFeaturedChange: (featured: boolean) => void;
}

export const FeaturedFilter: React.FC<FeaturedFilterProps> = ({
  featured,
  onFeaturedChange,
}) => {
  return (
    <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
      <Checkbox
        id="featured"
        checked={featured}
        onCheckedChange={(checked) => onFeaturedChange(checked === true)}
        className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
      />
      <Label
        htmlFor="featured"
        className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
      >
        <Star className="w-4 h-4 text-yellow-500" />
        Featured Products
      </Label>
    </div>
  );
};

export default FeaturedFilter;
