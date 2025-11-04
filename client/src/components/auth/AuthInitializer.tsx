// components/AuthInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { fetchCart } from '@/lib/features/carts/cartsSlice';

export function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);
  const { loading: cartLoading } = useAppSelector((state) => state.cart);

  const lastCartFetchRef = useRef<number>(0);

  useEffect(() => {
    const loadCart = async () => {
      // Only load if authenticated and not currently loading
      if (isAuthenticated && user && token && !cartLoading) {
        const now = Date.now();
        // Prevent fetching too frequently (min 2 seconds between fetches)
        if (now - lastCartFetchRef.current < 2000) {
          console.log('🛒 AuthInitializer - Skipping cart fetch, too recent');
          return;
        }

        console.log('🛒 AuthInitializer - Fetching cart for:', user.email);
        lastCartFetchRef.current = now;

        try {
          const result = await dispatch(fetchCart()).unwrap();
          console.log('✅ AuthInitializer - Cart fetched successfully:', {
            itemsCount: result.items?.length
          });
        } catch (error) {
          console.error('❌ AuthInitializer - Cart fetch failed:', error);
          lastCartFetchRef.current = 0; // Reset on error to allow retry
        }
      }
    };

    // Use a timeout to ensure the auth state is settled
    const timer = setTimeout(loadCart, 200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, token, cartLoading, dispatch]);

  return null;
}
