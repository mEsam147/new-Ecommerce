// components/CartSessionManager.tsx
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { clearAllCarts } from '@/lib/features/carts/cartsSlice';

export function CartSessionManager() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { userCart, guestCart } = useAppSelector((state) => state.cart);

  useEffect(() => {
    console.log('🔄 CartSessionManager - Monitoring auth state:', {
      isAuthenticated,
      userId: user?._id,
      userCartItems: userCart.length,
      guestCartItems: guestCart.length
    });

    // If user logs out, clear carts immediately
    if (!isAuthenticated && (userCart.length > 0 || guestCart.length > 0)) {
      console.log('🔄 CartSessionManager - User logged out, clearing carts');
      dispatch(clearAllCarts());
    }
  }, [isAuthenticated, user, userCart.length, guestCart.length, dispatch]);

  return null;
}
