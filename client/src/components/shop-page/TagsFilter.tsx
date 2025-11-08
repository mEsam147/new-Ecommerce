// components/shop/TagsFilter.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagsFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onEnterPress?: () => void;
}

const TagsFilter: React.FC<TagsFilterProps> = ({
  availableTags,
  selectedTags,
  onTagsChange,
  onEnterPress
}) => {
  const [showAll, setShowAll] = useState(false);

  const hasSelection = selectedTags.length > 0;

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    onTagsChange(newTags);
  };

  const handleClear = () => {
    onTagsChange([]);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent, tag: string) => {
    if (e.key === 'Enter') {
      toggleTag(tag);
      onEnterPress?.();
    }
  };

  // Display limited tags initially
  const displayTags = showAll ? availableTags : availableTags.slice(0, 6);
  const hasMoreTags = availableTags.length > 6;

  return (
    <div className="space-y-3 relative">
      {/* Clear Button - Top Right */}
      {hasSelection && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 z-10"
          title="Clear tags"
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              tabIndex={0}
              onClick={() => toggleTag(tag)}
              onKeyPress={(e) => handleTagKeyPress(e, tag)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                isSelected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Show More/Less Toggle */}
      {hasMoreTags && (
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
              Show More ({availableTags.length - 6} more)
            </>
          )}
        </Button>
      )}

      {/* Selected Count */}
      {selectedTags.length > 0 && (
        <div className="text-xs text-blue-600 font-medium">
          {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default TagsFilter;
