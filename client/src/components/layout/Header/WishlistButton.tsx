// components/ui/WishlistNavButton.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WishlistNavButtonProps {
  variant?: 'ghost' | 'outline' | 'secondary' | 'default';
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  showText?: boolean;
  className?: string;
}

export const WishlistNavButton: React.FC<WishlistNavButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  showBadge = true,
  showText = false,
  className,
}) => {
  const router = useRouter();
  const { count } = useWishlist();

  const handleClick = () => {
    router.push('/wishlist');
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-9 px-2';
      case 'lg': return 'h-11 px-4';
      default: return 'h-10 px-3';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 20;
      default: return 18;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      default: return 'text-base';
    }
  };

  const buttonContent = (
    <Button
      variant={variant}
      onClick={handleClick}
      className={cn(
        "relative transition-all duration-200 hover:scale-105",
        getButtonSize(),
        showText && "gap-2",
        className
      )}
    >
      <div className="relative">
        <Heart
          className={cn(
            getTextSize(),
            "transition-colors",
            variant === 'default' ? 'text-white' : 'text-current'
          )}
          size={getIconSize()}
        />
        {showBadge && count > 0 && (
          <Badge
            variant="destructive"
            className={cn(
              "absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center text-xs px-1",
              size === 'sm' ? 'text-[10px] min-w-4 h-4' : ''
            )}
          >
            {count > 99 ? '99+' : count}
          </Badge>
        )}
      </div>

      {showText && (
        <span className={cn("font-medium", getTextSize())}>
          Wishlist
        </span>
      )}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>View your wishlist ({count} items)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Header version for navigation
export const HeaderWishlistButton: React.FC = () => {
  return (
    <WishlistNavButton
      variant="ghost"
      size="sm"
      showBadge={true}
      showText={false}
      className="hover:bg-red-50 hover:text-red-600 transition-colors"
    />
  );
};

// Sidebar version
export const SidebarWishlistButton: React.FC = () => {
  return (
    <WishlistNavButton
      variant="ghost"
      size="md"
      showBadge={true}
      showText={true}
      className="w-full justify-start hover:bg-red-50 hover:text-red-600 transition-colors"
    />
  );
};

// Floating action button
export const FloatingWishlistButton: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <WishlistNavButton
        variant="default"
        size="lg"
        showBadge={true}
        showText={false}
        className="rounded-full shadow-lg hover:shadow-xl bg-red-500 hover:bg-red-600 text-white"
      />
    </div>
  );
};

export default WishlistNavButton;
