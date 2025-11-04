// components/CartStateMonitor.tsx
'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks/redux';

export function CartStateMonitor() {
  const auth = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart);

  useEffect(() => {
    console.log('🔍 CartStateMonitor - Current state:', {
      auth: {
        isAuthenticated: auth.isAuthnticated,
        user: auth.user?.email,
        hasToken: !!auth.token
      },
      cart: {
        userCartItems: cart.userCart.length,
        guestCartItems: cart.guestCart.length,
        loading: cart.loading,
        lastSyncedAt: cart.lastSyncedAt
      }
    });
  }, [auth, cart]);

  return null;
}
