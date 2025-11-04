// lib/hooks/useAuthListener.ts
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import { fetchCart } from '@/lib/features/carts/cartsSlice';

export const useAuthListener = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);
  const { userCart } = useAppSelector((state) => state.cart);

  useEffect(() => {
    const loadUserCart = async () => {
      // Only fetch cart if we have all auth credentials and user cart is empty
      if (isAuthenticated && user && token && userCart.length === 0) {
        console.log('🔄 AuthListener: User authenticated, fetching cart...');
        try {
          await dispatch(fetchCart()).unwrap();
          console.log('✅ AuthListener: User cart loaded successfully');
        } catch (error) {
          console.error('❌ AuthListener: Failed to fetch user cart:', error);
        }
      }
    };

    loadUserCart();
  }, [isAuthenticated, user, token, dispatch, userCart.length]);
};
