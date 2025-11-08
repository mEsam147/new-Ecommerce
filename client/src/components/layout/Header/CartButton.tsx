// components/layout/CartButton.tsx
'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CartButtonProps {
  isLoading?: boolean;
  onCartClick?: () => void;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
}

export const CartButton: React.FC<CartButtonProps> = ({
  isLoading = false,
  onCartClick,
  variant = 'ghost',
  size = 'md',
  showBadge = true,
  className,
}) => {
  const { totalItems, isEmpty, isLoading: cartLoading } = useCart();

  // Loading state
  if (isLoading || cartLoading) {
    return <CartButtonSkeleton size={size} />;
  }

  return (
    <CartButtonContent
      totalItems={totalItems}
      isEmpty={isEmpty}
      onCartClick={onCartClick}
      variant={variant}
      size={size}
      showBadge={showBadge}
      className={className}
    />
  );
};

// Skeleton Component
interface CartButtonSkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const CartButtonSkeleton: React.FC<CartButtonSkeletonProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16'
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

// Main Button Content Component
interface CartButtonContentProps {
  totalItems: number;
  isEmpty: boolean;
  onCartClick?: () => void;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
}

const CartButtonContent: React.FC<CartButtonContentProps> = ({
  totalItems,
  isEmpty,
  onCartClick,
  variant = 'ghost',
  size = 'md',
  showBadge = true,
  className,
}) => {
  const sizeConfig = {
    sm: {
      button: 'h-10 w-10',
      icon: 'w-5 h-5',
      badge: 'h-5 min-w-5 text-xs -top-1 -right-1',
      padding: 'p-2',
    },
    md: {
      button: 'h-12 w-12',
      icon: 'w-6 h-6',
      badge: 'h-5 min-w-5 text-xs -top-1.5 -right-1',
      padding: 'p-2.5',
    },
    lg: {
      button: 'h-14 w-14',
      icon: 'w-7 h-7',
      badge: 'h-6 min-w-6 text-sm -top-2 -right-1.5',
      padding: 'p-3',
    },
    xl: {
      button: 'h-16 w-16',
      icon: 'w-8 h-8',
      badge: 'h-7 min-w-7 text-sm -top-2.5 -right-2',
      padding: 'p-4',
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
        className={cn(
          "relative transition-all duration-200 group",
          "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          "rounded-xl border-0", // Larger border radius for better appearance
          !isEmpty && "text-primary/90",
          button,
          padding,
          className
        )}
        onClick={onCartClick}
        aria-label={`Shopping cart ${!isEmpty ? `with ${totalItems} items` : ''}`}
      >
        {/* Larger Cart Icon */}
        <ShoppingCart className={cn(
          "transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[-5deg]",
          "stroke-[1.5px]", // Thicker stroke for better visibility
          icon
        )} />

        {/* Enhanced Hover Overlay */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/8 group-hover:to-blue-500/5 transition-all duration-300"
          whileHover={{
            backgroundColor: ['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.08)'],
          }}
        />
      </Button>

      {/* Enhanced Items Count Badge */}
      <AnimatePresence>
        {showBadge && !isEmpty && totalItems > 0 && (
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
              "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full",
              "border-2 border-white shadow-lg font-medium select-none",
              "backdrop-blur-sm", // Subtle blur effect
              badge
            )}
            whileHover={{ scale: 1.1 }}
          >
            {totalItems > 99 ? '99+' : totalItems}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Header-optimized version with larger icons
export const HeaderCartButton: React.FC<Omit<CartButtonProps, 'size'>> = (props) => (
  <CartButton {...props} size="lg" />
);

// Compact version for tight spaces (but still with larger icon)
export const CompactCartButton: React.FC<Omit<CartButtonProps, 'size'>> = (props) => (
  <CartButton {...props} size="sm" />
);

// Extra large version for prominent placement
export const XLCartButton: React.FC<Omit<CartButtonProps, 'size'>> = (props) => (
  <CartButton {...props} size="xl" />
);

// Primary action version with default styling
export const PrimaryCartButton: React.FC<Omit<CartButtonProps, 'variant'>> = (props) => (
  <CartButton {...props} variant="default" />
);

// Enhanced version with pulse animation when items change
export const AnimatedCartButton: React.FC<CartButtonProps> = (props) => {
  const { totalItems } = useCart();

  return (
    <motion.div
      key={totalItems} // Re-trigger animation when items change
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.3 }}
    >
      <CartButton {...props} />
    </motion.div>
  );
};

export default CartButton;
