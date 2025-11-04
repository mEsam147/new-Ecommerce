// components/layout/HeaderWishlist.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function HeaderWishlist() {
  const { totalItems, loading } = useWishlist();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            asChild
          >
            <Link href="/wishlist">
              <Heart className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </Badge>
              )}
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Wishlist ({totalItems})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
