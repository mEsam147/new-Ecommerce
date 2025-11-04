// lib/hooks/useCartSync.ts
'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { fetchCart } from '@/lib/features/carts/cartsSlice';

export const useCartSync = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);

  const syncCart = useCallback(async () => {
    if (!isAuthenticated || !user || !token) {
      console.log('🛒 useCartSync - Not authenticated, skipping sync');
      return false;
    }

    console.log('🛒 useCartSync - Syncing cart for user:', user.email);

    try {
      const result = await dispatch(fetchCart()).unwrap();
      console.log('✅ useCartSync - Cart synced successfully:', {
        itemsCount: result.items?.length
      });
      return true;
    } catch (error) {
      console.error('❌ useCartSync - Failed to sync cart:', error);
      return false;
    }
  }, [dispatch, isAuthenticated, user, token]);

  return { syncCart };
};
