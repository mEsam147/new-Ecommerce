// // components/ui/PriceRangeSlider.tsx
// 'use client';

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Button } from '@/components/ui/button';
// import { X } from 'lucide-react';

// export interface PriceRange {
//   min: number;
//   max: number;
// }

// interface PriceRangeSliderProps {
//   priceRange: PriceRange;
//   selectedRange: PriceRange;
//   onRangeChange: (range: PriceRange) => void;
//   onApply?: () => void;
//   onClear?: () => void;
//   showApplyButton?: boolean;
//   showClearButton?: boolean;
//   className?: string;
//   currency?: string;
//   step?: number;
//   allowOverlap?: boolean; // New prop to allow min > max scenarios
// }

// export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
//   priceRange,
//   selectedRange,
//   onRangeChange,
//   onApply,
//   onClear,
//   showApplyButton = true,
//   showClearButton = true,
//   className = '',
//   currency = '$',
//   step = 1,
//   allowOverlap = true // Default to true for flexible control
// }) => {
//   const [minValue, setMinValue] = useState(selectedRange.min);
//   const [maxValue, setMaxValue] = useState(selectedRange.max);
//   const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
//   const progressRef = useRef<HTMLDivElement>(null);
//   const sliderRef = useRef<HTMLDivElement>(null);

//   // Update local state when selectedRange prop changes
//   useEffect(() => {
//     setMinValue(selectedRange.min);
//     setMaxValue(selectedRange.max);
//   }, [selectedRange]);

//   // Update progress bar
//   useEffect(() => {
//     if (progressRef.current) {
//       const minPercent = ((minValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100;
//       const maxPercent = ((maxValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100;

//       if (minValue <= maxValue) {
//         // Normal case: min <= max
//         progressRef.current.style.left = `${minPercent}%`;
//         progressRef.current.style.right = `${100 - maxPercent}%`;
//       } else {
//         // Inverted case: min > max (show no progress)
//         progressRef.current.style.left = `${maxPercent}%`;
//         progressRef.current.style.right = `${100 - minPercent}%`;
//         progressRef.current.style.backgroundColor = '#ef4444'; // Red color for invalid range
//       }
//     }
//   }, [minValue, maxValue, priceRange]);

//   const validateAndUpdateRange = useCallback((newMin: number, newMax: number) => {
//     let validatedMin = newMin;
//     let validatedMax = newMax;

//     // Ensure values are within absolute bounds
//     validatedMin = Math.max(priceRange.min, Math.min(validatedMin, priceRange.max));
//     validatedMax = Math.max(priceRange.min, Math.min(validatedMax, priceRange.max));

//     // If allowOverlap is false, enforce min <= max
//     if (!allowOverlap && validatedMin > validatedMax) {
//       if (isDragging === 'min') {
//         validatedMin = validatedMax;
//       } else {
//         validatedMax = validatedMin;
//       }
//     }

//     setMinValue(validatedMin);
//     setMaxValue(validatedMax);
//     onRangeChange({ min: validatedMin, max: validatedMax });
//   }, [priceRange, allowOverlap, isDragging, onRangeChange]);

//   const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = parseInt(e.target.value) || priceRange.min;
//     validateAndUpdateRange(value, maxValue);
//   };

//   const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = parseInt(e.target.value) || priceRange.max;
//     validateAndUpdateRange(minValue, value);
//   };

//   const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = parseInt(e.target.value);
//     setIsDragging('min');
//     validateAndUpdateRange(value, maxValue);
//   };

//   const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = parseInt(e.target.value);
//     setIsDragging('max');
//     validateAndUpdateRange(minValue, value);
//   };

//   const handleSliderMouseUp = () => {
//     setIsDragging(null);
//   };

//   const handleThumbMouseDown = (thumb: 'min' | 'max') => {
//     setIsDragging(thumb);
//   };

//   const handleThumbMouseUp = () => {
//     setIsDragging(null);
//   };

//   // Add mouse up listener to document
//   useEffect(() => {
//     document.addEventListener('mouseup', handleSliderMouseUp);
//     document.addEventListener('touchend', handleSliderMouseUp);
//     return () => {
//       document.removeEventListener('mouseup', handleSliderMouseUp);
//       document.removeEventListener('touchend', handleSliderMouseUp);
//     };
//   }, []);

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 0,
//     }).format(amount).replace('$', currency);
//   };

//   const handleApply = () => {
//     if (onApply) {
//       onApply();
//     }
//   };

//   const handleClear = () => {
//     // Reset to full price range
//     const fullRange = { min: priceRange.min, max: priceRange.max };
//     setMinValue(fullRange.min);
//     setMaxValue(fullRange.max);
//     onRangeChange(fullRange);

//     if (onClear) {
//       onClear();
//     }
//   };

//   const hasCustomRange = minValue > priceRange.min || maxValue < priceRange.max;
//   const isRangeValid = minValue <= maxValue;

//   return (
//     <div className={`space-y-4 ${className}`}>
//       {/* Price Inputs */}
//       <div className="grid grid-cols-2 gap-3">
//         <div className="space-y-1">
//           <label className="text-xs font-medium text-gray-600">Min Price</label>
//           <div className="relative">
//             <input
//               type="number"
//               value={minValue}
//               onChange={handleMinInput}
//               min={priceRange.min}
//               max={priceRange.max}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
//             />
//             <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//               <span className="text-gray-400 text-sm">{currency}</span>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-1">
//           <label className="text-xs font-medium text-gray-600">Max Price</label>
//           <div className="relative">
//             <input
//               type="number"
//               value={maxValue}
//               onChange={handleMaxInput}
//               min={priceRange.min}
//               max={priceRange.max}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
//             />
//             <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//               <span className="text-gray-400 text-sm">{currency}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Slider Container */}
//       <div className="py-4" ref={sliderRef}>
//         {/* Slider Track */}
//         <div className="relative h-2 bg-gray-200 rounded-full">
//           {/* Progress Bar */}
//           <div
//             ref={progressRef}
//             className={`absolute h-2 rounded-full transition-all duration-150 ${
//               isRangeValid ? 'bg-primary' : 'bg-red-500'
//             }`}
//           />

//           {/* Range Inputs */}
//           <div className="relative">
//             <input
//               type="range"
//               min={priceRange.min}
//               max={priceRange.max}
//               value={minValue}
//               step={step}
//               onChange={handleMinSlider}
//               onMouseDown={() => handleThumbMouseDown('min')}
//               onTouchStart={() => handleThumbMouseDown('min')}
//               className="absolute w-full h-2 top-0 opacity-0 cursor-pointer z-20"
//             />
//             <input
//               type="range"
//               min={priceRange.min}
//               max={priceRange.max}
//               value={maxValue}
//               step={step}
//               onChange={handleMaxSlider}
//               onMouseDown={() => handleThumbMouseDown('max')}
//               onTouchStart={() => handleThumbMouseDown('max')}
//               className="absolute w-full h-2 top-0 opacity-0 cursor-pointer z-20"
//             />

//             {/* Custom Thumbs */}
//             <div
//               className={`absolute top-1/2 w-5 h-5 bg-white border-2 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 cursor-grab z-10 transition-all ${
//                 isDragging === 'min'
//                   ? 'scale-125 cursor-grabbing shadow-xl border-primary'
//                   : isRangeValid
//                     ? 'border-primary hover:scale-110'
//                     : 'border-red-500 hover:scale-110'
//               }`}
//               style={{ left: `${((minValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%` }}
//               onMouseDown={() => handleThumbMouseDown('min')}
//               onTouchStart={() => handleThumbMouseDown('min')}
//               onMouseUp={handleThumbMouseUp}
//               onTouchEnd={handleThumbMouseUp}
//             />
//             <div
//               className={`absolute top-1/2 w-5 h-5 bg-white border-2 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 cursor-grab z-10 transition-all ${
//                 isDragging === 'max'
//                   ? 'scale-125 cursor-grabbing shadow-xl border-primary'
//                   : isRangeValid
//                     ? 'border-primary hover:scale-110'
//                     : 'border-red-500 hover:scale-110'
//               }`}
//               style={{ left: `${((maxValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%` }}
//               onMouseDown={() => handleThumbMouseDown('max')}
//               onTouchStart={() => handleThumbMouseDown('max')}
//               onMouseUp={handleThumbMouseUp}
//               onTouchEnd={handleThumbMouseUp}
//             />
//           </div>
//         </div>

//         {/* Price Labels */}
//         <div className="flex justify-between text-xs text-gray-500 mt-2">
//           <span>{formatCurrency(priceRange.min)}</span>
//           <span>{formatCurrency(priceRange.max)}</span>
//         </div>

//         {/* Selected Range Display */}
//         <div className="text-center mt-2">
//           <span className={`text-sm font-medium ${isRangeValid ? 'text-primary' : 'text-red-500'}`}>
//             {formatCurrency(minValue)} - {formatCurrency(maxValue)}
//             {!isRangeValid && (
//               <span className="text-xs text-red-500 ml-1">(Invalid range)</span>
//             )}
//           </span>
//         </div>
//       </div>

//       {/* Validation Message */}
//       {!isRangeValid && (
//         <div className="text-xs text-red-500 text-center bg-red-50 py-1 px-2 rounded border border-red-200">
//           Minimum price cannot be greater than maximum price
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className={`space-y-2 ${showApplyButton || showClearButton ? 'block' : 'hidden'}`}>
//         {showApplyButton && (
//           <Button
//             onClick={handleApply}
//             disabled={!isRangeValid}
//             className="w-full bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Apply Price Filter
//           </Button>
//         )}

//         {showClearButton && hasCustomRange && (
//           <Button
//             variant="outline"
//             onClick={handleClear}
//             className="w-full gap-2"
//           >
//             <X className="w-4 h-4" />
//             Clear Price Filter
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PriceRangeSlider;

// components/ui/PriceRangeSlider.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PriceRange {
  min: number;
  max: number;
}

interface PriceRangeSliderProps {
  priceRange: PriceRange;
  selectedRange: PriceRange;
  onRangeChange: (range: PriceRange) => void;
  onApply?: () => void;
  onClear?: () => void;
  showApplyButton?: boolean;
  showClearButton?: boolean;
  className?: string;
  currency?: string;
  step?: number;
  allowOverlap?: boolean;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  priceRange,
  selectedRange,
  onRangeChange,
  onApply,
  onClear,
  showApplyButton = true,
  showClearButton = true,
  className = '',
  currency = '$',
  step = 1,
  allowOverlap = true
}) => {
  const [minValue, setMinValue] = useState(selectedRange.min);
  const [maxValue, setMaxValue] = useState(selectedRange.max);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Update local state when selectedRange prop changes
  useEffect(() => {
    setMinValue(selectedRange.min);
    setMaxValue(selectedRange.max);
  }, [selectedRange]);

  // Update progress bar
  useEffect(() => {
    if (progressRef.current) {
      const minPercent = ((minValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100;
      const maxPercent = ((maxValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100;

      if (minValue <= maxValue) {
        progressRef.current.style.left = `${minPercent}%`;
        progressRef.current.style.right = `${100 - maxPercent}%`;
        progressRef.current.style.backgroundColor = '';
      } else {
        progressRef.current.style.left = `${maxPercent}%`;
        progressRef.current.style.right = `${100 - minPercent}%`;
        progressRef.current.style.backgroundColor = '#fca5a5';
      }
    }
  }, [minValue, maxValue, priceRange]);

  const validateAndUpdateRange = useCallback((newMin: number, newMax: number) => {
    let validatedMin = Math.max(priceRange.min, Math.min(newMin, priceRange.max));
    let validatedMax = Math.max(priceRange.min, Math.min(newMax, priceRange.max));

    if (!allowOverlap && validatedMin > validatedMax) {
      if (isDragging === 'min') {
        validatedMin = validatedMax;
      } else {
        validatedMax = validatedMin;
      }
    }

    setMinValue(validatedMin);
    setMaxValue(validatedMax);
    onRangeChange({ min: validatedMin, max: validatedMax });
  }, [priceRange, allowOverlap, isDragging, onRangeChange]);

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || priceRange.min;
    validateAndUpdateRange(value, maxValue);
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || priceRange.max;
    validateAndUpdateRange(minValue, value);
  };

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setIsDragging('min');
    validateAndUpdateRange(value, maxValue);
  };

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setIsDragging('max');
    validateAndUpdateRange(minValue, value);
  };

  const handleSliderMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleSliderMouseUp);
    document.addEventListener('touchend', handleSliderMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleSliderMouseUp);
      document.removeEventListener('touchend', handleSliderMouseUp);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount).replace('$', currency);
  };

  const handleApply = () => {
    onApply?.();
  };

  const handleClear = () => {
    const fullRange = { min: priceRange.min, max: priceRange.max };
    setMinValue(fullRange.min);
    setMaxValue(fullRange.max);
    onRangeChange(fullRange);
    onClear?.();
  };

  const hasCustomRange = minValue > priceRange.min || maxValue < priceRange.max;
  const isRangeValid = minValue <= maxValue;

  return (
    <div className={cn("space-y-6 p-1", className)}>
      {/* Price Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Min</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {currency}
            </span>
            <input
              type="number"
              value={minValue}
              onChange={handleMinInput}
              min={priceRange.min}
              max={priceRange.max}
              className={cn(
                "w-full pl-8 pr-3 py-2.5 border rounded-lg text-sm transition-all",
                "bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20",
                !isRangeValid && "border-destructive focus:border-destructive focus:ring-destructive/20"
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Max</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {currency}
            </span>
            <input
              type="number"
              value={maxValue}
              onChange={handleMaxInput}
              min={priceRange.min}
              max={priceRange.max}
              className={cn(
                "w-full pl-8 pr-3 py-2.5 border rounded-lg text-sm transition-all",
                "bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20",
                !isRangeValid && "border-destructive focus:border-destructive focus:ring-destructive/20"
              )}
            />
          </div>
        </div>
      </div>

      {/* Slider Container */}
      <div className="py-2" ref={sliderRef}>
        {/* Slider Track */}
        <div className="relative h-2 bg-muted rounded-full">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className={cn(
              "absolute h-2 rounded-full transition-all duration-200",
              isRangeValid ? "bg-primary" : "bg-destructive"
            )}
          />

          {/* Range Inputs */}
          <div className="relative">
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={minValue}
              step={step}
              onChange={handleMinSlider}
              className="absolute w-full h-2 top-0 opacity-0 cursor-pointer z-20"
            />
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={maxValue}
              step={step}
              onChange={handleMaxSlider}
              className="absolute w-full h-2 top-0 opacity-0 cursor-pointer z-20"
            />

            {/* Custom Thumbs */}
            <div
              className={cn(
                "absolute top-1/2 w-5 h-5 bg-background border-2 rounded-full shadow-lg",
                "transform -translate-y-1/2 -translate-x-1/2 cursor-grab z-10 transition-all",
                "hover:scale-110 active:scale-125 active:cursor-grabbing",
                isDragging === 'min' && "scale-125 cursor-grabbing shadow-xl",
                isRangeValid
                  ? "border-primary shadow-primary/25"
                  : "border-destructive shadow-destructive/25"
              )}
              style={{ left: `${((minValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%` }}
            />
            <div
              className={cn(
                "absolute top-1/2 w-5 h-5 bg-background border-2 rounded-full shadow-lg",
                "transform -translate-y-1/2 -translate-x-1/2 cursor-grab z-10 transition-all",
                "hover:scale-110 active:scale-125 active:cursor-grabbing",
                isDragging === 'max' && "scale-125 cursor-grabbing shadow-xl",
                isRangeValid
                  ? "border-primary shadow-primary/25"
                  : "border-destructive shadow-destructive/25"
              )}
              style={{ left: `${((maxValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%` }}
            />
          </div>
        </div>

        {/* Price Labels */}
        <div className="flex justify-between text-sm text-muted-foreground mt-3">
          <span>{formatCurrency(priceRange.min)}</span>
          <span>{formatCurrency(priceRange.max)}</span>
        </div>

        {/* Selected Range Display */}
        <div className="text-center mt-3">
          <span className={cn(
            "text-sm font-semibold px-3 py-1.5 rounded-full transition-colors",
            isRangeValid
              ? "text-primary bg-primary/10"
              : "text-destructive bg-destructive/10"
          )}>
            {formatCurrency(minValue)} - {formatCurrency(maxValue)}
          </span>
        </div>
      </div>

      {/* Validation Message */}
      {!isRangeValid && (
        <div className="text-sm text-destructive bg-destructive/10 py-2 px-3 rounded-lg border border-destructive/20 text-center">
          ⚠️ Minimum price cannot exceed maximum price
        </div>
      )}

      {/* Action Buttons */}
      <div className={cn(
        "flex gap-2 pt-2",
        !showApplyButton && !showClearButton && "hidden"
      )}>
        {showApplyButton && (
          <Button
            onClick={handleApply}
            disabled={!isRangeValid}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            size="sm"
          >
            Apply Filter
          </Button>
        )}

        {showClearButton && hasCustomRange && (
          <Button
            variant="outline"
            onClick={handleClear}
            className="shrink-0 gap-1.5"
            size="sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default PriceRangeSlider;
