// components/layout/WishlistButton.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface WishlistButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
  showText?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  variant = 'ghost',
  size = 'lg', // Default to large for header
  showBadge = true,
  className,
  showText = false,
}) => {
  const router = useRouter();
  const { items, isLoading } = useWishlist();
  const count = items.length;

  const handleClick = (): void => {
    router.push('/wishlist');
  };

  if (isLoading) {
    return <WishlistButtonSkeleton size={size} />;
  }

  const sizeConfig = {
    sm: {
      button: 'h-10 w-10',
      icon: 'w-5 h-5',
      badge: 'h-5 min-w-5 text-xs -top-1 -right-1',
      padding: 'p-2',
    },
    md: {
      button: 'h-11 w-11',
      icon: 'w-5.5 h-5.5',
      badge: 'h-5 min-w-5 text-xs -top-1.5 -right-1',
      padding: 'p-2.5',
    },
    lg: {
      button: 'h-12 w-12',
      icon: 'w-6 h-6',
      badge: 'h-5 min-w-5 text-xs -top-1.5 -right-1',
      padding: 'p-3',
    },
    xl: {
      button: 'h-14 w-14',
      icon: 'w-7 h-7',
      badge: 'h-6 min-w-6 text-sm -top-2 -right-1.5',
      padding: 'p-3.5',
    },
  };

  const { button, icon, badge, padding } = sizeConfig[size];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="relative"
    >
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        className={cn(
          "relative transition-all duration-200 group",
          "hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20",
          "rounded-xl border-0",
          count > 0 && "text-red-500/90",
          button,
          padding,
          className
        )}
        aria-label={`Wishlist ${count > 0 ? `with ${count} items` : ''}`}
      >
        {/* Larger Heart Icon */}
        <Heart className={cn(
          "transition-transform duration-200 group-hover:scale-110",
          "stroke-[1.5px]", // Thicker stroke for consistency
          "fill-transparent group-hover:fill-red-200",
          icon
        )} />

        {/* Enhanced Hover Overlay */}
        <div className="absolute inset-0 rounded-xl bg-red-500/0 group-hover:bg-red-500/5 transition-colors duration-200" />
      </Button>

      {/* Count Badge */}
      <AnimatePresence>
        {showBadge && count > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 5 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 5 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 15,
              duration: 0.2
            }}
            className={cn(
              "absolute z-10 flex items-center justify-center",
              "bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full",
              "border-2 border-white shadow-lg font-medium select-none",
              badge
            )}
          >
            {count > 99 ? '99+' : count}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Skeleton Component
const WishlistButtonSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'lg' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-11 h-11',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  return (
    <Skeleton
      className={cn(
        "rounded-xl",
        sizeClasses[size]
      )}
    />
  );
};

export default WishlistButton;
