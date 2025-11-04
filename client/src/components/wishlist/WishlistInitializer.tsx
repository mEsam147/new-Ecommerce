// components/WishlistInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { fetchWishlist } from '@/lib/features/wishlist/wishlistSlice';

export function WishlistInitializer() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);
  const { loading: wishlistLoading } = useAppSelector((state) => state.wishlist);

  const wishlistLoadedRef = useRef(false);

  useEffect(() => {
    const loadWishlist = async () => {
      // Only load wishlist if authenticated and not already loaded
      if (isAuthenticated && user && token && !wishlistLoading && !wishlistLoadedRef.current) {
        console.log('💝 WishlistInitializer - Loading user wishlist...');
        wishlistLoadedRef.current = true;

        try {
          await dispatch(fetchWishlist()).unwrap();
          console.log('✅ WishlistInitializer - Wishlist loaded successfully');
        } catch (error) {
          console.error('❌ WishlistInitializer - Failed to load wishlist:', error);
          wishlistLoadedRef.current = false; // Reset on error
        }
      }
    };

    const timer = setTimeout(loadWishlist, 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, token, wishlistLoading, dispatch]);

  return null;
}
