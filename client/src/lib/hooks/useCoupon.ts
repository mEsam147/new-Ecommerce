// lib/hooks/useCoupon.ts - FIXED VERSION
'use client';

import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import { useToast } from './useToast';
import { validateCoupon, removeCoupon, clearValidationError, selectAppliedCoupon, selectCouponValidationLoading, selectCouponValidationError } from '@/lib/features/coupon/couponSlice';
import { selectCartItems, selectCartSubtotal } from '@/lib/features/cart/cartSlice';

export const useCoupon = () => {
  const dispatch = useAppDispatch();
  const { success, error } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [localError, setLocalError] = useState('');

  // Selectors - FIXED: Using proper selectors
  const appliedCoupon = useAppSelector(selectAppliedCoupon);
  const validationLoading = useAppSelector(selectCouponValidationLoading);
  const validationError = useAppSelector(selectCouponValidationError);
  const cartItems = useAppSelector(selectCartItems);
  const cartSubtotal = useAppSelector(selectCartSubtotal); // This is the key fix

  const handleApplyCoupon = useCallback(async (code?: string) => {
    const couponToApply = code || couponCode;

    if (!couponToApply.trim()) {
      const errorMsg = 'Please enter a coupon code';
      setLocalError(errorMsg);
      error(errorMsg);
      return false;
    }

    // Clear previous errors
    setLocalError('');
    dispatch(clearValidationError());

    try {
      console.log('🎫 useCoupon - Applying coupon:', couponToApply);

      // Prepare cart data for validation
      const products = cartItems.map(item => ({
        productId: item.productId || item.product?._id,
        product: item.product,
        quantity: item.quantity,
        price: item.price || item.product?.price
      }));

      const result = await dispatch(validateCoupon({
        code: couponToApply.toUpperCase().trim(),
        cartAmount: cartSubtotal, // Using the subtotal selector
        products
      })).unwrap();

      if (result.success) {
        const successMsg = result.message || `Coupon ${couponToApply} applied successfully!`;
        success(successMsg);
        setCouponCode(''); // Clear input on success
        return true;
      } else {
        throw new Error(result.message || 'Failed to apply coupon');
      }
    } catch (err: any) {
      console.error('🎫 useCoupon - Error applying coupon:', err);

      const errorMsg = err.message || 'Invalid coupon code';
      setLocalError(errorMsg);
      error(errorMsg);
      return false;
    }
  }, [dispatch, couponCode, cartItems, cartSubtotal, success, error]);

  const handleRemoveCoupon = useCallback(() => {
    dispatch(removeCoupon());
    setCouponCode('');
    setLocalError('');
    success('Coupon removed');
  }, [dispatch, success]);

  const clearError = useCallback(() => {
    setLocalError('');
    dispatch(clearValidationError());
  }, [dispatch]);

  return {
    // State
    couponCode,
    setCouponCode,
    couponError: localError || validationError,
    isApplyingCoupon: validationLoading,
    appliedCoupon,
    discount: appliedCoupon?.discountAmount || 0,

    // Actions
    applyCoupon: handleApplyCoupon,
    removeCoupon: handleRemoveCoupon,
    clearError,

    // Utilities
    hasCoupon: !!appliedCoupon,
    couponType: appliedCoupon?.discountType,
  };
};
