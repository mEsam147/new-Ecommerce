// components/providers/CartSyncProvider.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';

export const CartSyncProvider = () => {
  const { isAuthenticated, user } = useAuth();
  const { refreshCart, userCart } = useCart();

  useEffect(() => {
    // Auto-load user cart when page loads and user is authenticated
    if (isAuthenticated && user && userCart.length === 0) {
      console.log('🛒 CartSyncProvider - Auto-loading user cart on page load');
      const timer = setTimeout(() => {
        refreshCart();
      }, 1500); // Wait a bit longer on page load

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, userCart.length, refreshCart]);

  return null;
};

// Use this in your app/layout.tsx
// <CartSyncProvider />
