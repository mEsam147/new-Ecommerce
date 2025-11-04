// components/cart/CartIcon.tsx
'use client';

import React from 'react';
import { useAppSelector } from '@/lib/hooks/redux';
import { selectCartTotalItems } from '@/lib/features/carts/cartsSlice';
import { cn } from '@/lib/utils';

interface CartIconProps {
  onClick: () => void;
  className?: string;
}

export const CartIcon: React.FC<CartIconProps> = ({ onClick, className }) => {
  const totalItems = useAppSelector(selectCartTotalItems);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group",
        className
      )}
    >
      <svg
        className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>

      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
};
