// components/ui/PriceRangeSlider.tsx
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface PriceRange {
  min: number;
  max: number;
}

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: PriceRange;
  onChange: (value: PriceRange) => void;
  className?: string;
  step?: number;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  className,
  step = 1,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<'min' | 'max' | null>(null);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate positions
  const getPositionFromValue = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const getValueFromPosition = useCallback((position: number) => {
    let newValue = min + (position / 100) * (max - min);
    newValue = Math.round(newValue / step) * step; // Snap to step
    return Math.max(min, Math.min(max, newValue));
  }, [min, max, step]);

  // Handle drag start
  const handleDragStart = useCallback((thumb: 'min' | 'max', clientX: number) => {
    isDraggingRef.current = thumb;
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('touchend', handleDragEnd);
  }, []);

  // Handle drag
  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const trackRect = trackRef.current.getBoundingClientRect();
    const position = ((clientX - trackRect.left) / trackRect.width) * 100;
    const clampedPosition = Math.max(0, Math.min(100, position));
    const newValue = getValueFromPosition(clampedPosition);

    if (isDraggingRef.current === 'min') {
      // Ensure min doesn't exceed max
      const constrainedValue = Math.min(newValue, value.max - step);
      onChange({ ...value, min: constrainedValue });
    } else {
      // Ensure max doesn't go below min
      const constrainedValue = Math.max(newValue, value.min + step);
      onChange({ ...value, max: constrainedValue });
    }
  }, [value, onChange, getValueFromPosition, step]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = null;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDrag);
    document.removeEventListener('touchend', handleDragEnd);
  }, [handleDrag]);

  // Mouse event handlers
  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(thumb, e.clientX);
  };

  // Touch event handlers
  const handleTouchStart = (thumb: 'min' | 'max') => (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(thumb, touch.clientX);
  };

  // Click on track to move closest thumb
  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current || isDraggingRef.current) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const position = ((e.clientX - trackRect.left) / trackRect.width) * 100;
    const clickedValue = getValueFromPosition(position);

    // Determine which thumb is closer
    const minDistance = Math.abs(clickedValue - value.min);
    const maxDistance = Math.abs(clickedValue - value.max);

    if (minDistance <= maxDistance) {
      // Move min thumb
      const newMin = Math.min(clickedValue, value.max - step);
      onChange({ ...value, min: newMin });
    } else {
      // Move max thumb
      const newMax = Math.max(clickedValue, value.min + step);
      onChange({ ...value, max: newMax });
    }
  };

  // Calculate positions for rendering
  const minPosition = getPositionFromValue(value.min);
  const maxPosition = getPositionFromValue(value.max);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDrag, handleDragEnd]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Price Display */}
      <div className="flex items-center justify-between px-1">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Min</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(value.min)}
          </div>
        </div>

        <div className="w-4 h-px bg-gray-300 mx-4" />

        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Max</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(value.max)}
          </div>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative h-10 flex items-center">
        {/* Background Track */}
        <div
          ref={trackRef}
          className="absolute h-2 w-full bg-gray-200 rounded-full cursor-pointer"
          onClick={handleTrackClick}
        />

        {/* Selected Range */}
        <motion.div
          className="absolute h-2 bg-blue-500 rounded-full"
          style={{
            left: `${minPosition}%`,
            width: `${maxPosition - minPosition}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Min Thumb */}
        <motion.div
          className={cn(
            "absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full shadow-lg",
            "cursor-grab active:cursor-grabbing z-10 flex items-center justify-center",
            "hover:scale-110 active:scale-90 transition-transform"
          )}
          style={{
            left: `calc(${minPosition}% - 12px)`,
          }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </motion.div>

        {/* Max Thumb */}
        <motion.div
          className={cn(
            "absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full shadow-lg",
            "cursor-grab active:cursor-grabbing z-10 flex items-center justify-center",
            "hover:scale-110 active:scale-90 transition-transform"
          )}
          style={{
            left: `calc(${maxPosition}% - 12px)`,
          }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </motion.div>
      </div>

      {/* Range Labels */}
      <div className="flex justify-between text-sm text-gray-500 px-1">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
