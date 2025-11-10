// lib/hooks/useCartCheckout.ts - SIMPLIFIED VERSION
'use client';

import { useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import {
  clearGuestCart,
  clearAllCarts,
  selectCartItems,
  selectCartTotalItems,
  selectCartSubtotal as selectCartSubtotalRaw
} from '@/lib/features/carts/cartsSlice';
import { removeCoupon } from '@/lib/features/coupon/couponSlice';
import { useToast } from './useToast';
import { cartApi } from '@/lib/services/cartApi';

export const useCartCheckout = () => {
  const dispatch = useAppDispatch();
  const { success, error } = useToast();

  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);

  // Cart Selectors
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectCartTotalItems);
  const cartSubtotal = useAppSelector(selectCartSubtotalRaw);

  // RTK Query mutations
  const [clearCartApi] = cartApi.useClearCartMutation();

  // Calculate totals
  const { subtotal, total, discount, shipping, tax } = useMemo(() => {
    const subtotal = cartSubtotal;
    const discount = 0; // You can add coupon logic if needed
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax
    const total = Math.max(0, subtotal - discount + shipping + tax);

    return {
      subtotal: Number(subtotal.toFixed(2)),
      total: Number(total.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      tax: Number(tax.toFixed(2))
    };
  }, [cartSubtotal]);

  // Enhanced clear cart function
  const clearCart = useCallback(async () => {
    try {
      console.log('🛒 Clearing cart...', { isAuthenticated, itemsCount: items.length });

      if (isAuthenticated && user) {
        // For authenticated users - clear via API
        const result = await clearCartApi().unwrap();
        console.log('✅ API cart cleared:', result);
      } else {
        // For guest users - clear local storage
        dispatch(clearGuestCart());
        console.log('✅ Guest cart cleared');
      }

      // Always remove coupon and clear all cart state
      dispatch(removeCoupon());
      dispatch(clearAllCarts()); // This clears both guest and user carts

      console.log('✅ Cart cleared successfully');
      return true;
    } catch (err: any) {
      console.error('❌ Failed to clear cart:', err);

      // Fallback: clear local cart even if API fails
      dispatch(clearGuestCart());
      dispatch(clearAllCarts());
      dispatch(removeCoupon());

      return false;
    }
  }, [dispatch, isAuthenticated, user, clearCartApi]);

  const isEmpty = useMemo(() => items.length === 0, [items]);

  return {
    items,
    isEmpty,
    subtotal,
    total,
    discount,
    shipping,
    tax,
    totalItems,
    clearCart
  };
};
