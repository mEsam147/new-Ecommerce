// components/layout/CartButton.tsx
'use client';

import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CartButtonProps {
  isLoading?: boolean;
  onCartClick?: () => void;
}

export const CartButton: React.FC<CartButtonProps> = ({
  isLoading = false,
  onCartClick
}) => {
  const { totalItems, isEmpty } = useCart();

  if (isLoading) {
    return (
      <Skeleton className="w-11 h-11 rounded-2xl" />
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-11 w-11 transition-all duration-500 hover:scale-110 hover:bg-gray-100 group"
      onClick={onCartClick}
      aria-label="Shopping cart"
    >
      {/* Main icon with hover effect */}
      <ShoppingBag className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />

      {/* Sparkle effect on hover */}
      <Sparkles className="absolute w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-500 -top-1 -right-1" />

      {/* Cart Badge with enhanced design */}
      {!isEmpty && totalItems > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-6 min-w-6 px-1.5 text-xs font-bold border-2 border-white shadow-lg animate-pulse"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}

      {/* Enhanced gradient background effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/8 group-hover:via-purple-500/8 group-hover:to-pink-500/8 transition-all duration-500" />

      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/20 group-hover:animate-pulse transition-all duration-300" />
    </Button>
  );
};
