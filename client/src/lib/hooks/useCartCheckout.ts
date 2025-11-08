// lib/hooks/useCartCheckout.ts
'use client';

import { useMemo } from 'react';
import { useCart } from './useCart';

/**
 * Hook مخصص لل checkout لضمان استقرار البيانات
 */
export const useCartCheckout = () => {
  const cart = useCart();

  // حساب المجموع الكلي بشكل آمن
  const checkoutTotals = useMemo(() => {
    try {
      // استخدام القيم من useCart مع قيم افتراضية آمنة
      const subtotal = cart.subtotal || 0;
      const discount = cart.discount || 0;
      const tax = subtotal * 0.08; // 8% ضريبة
      const shipping = subtotal > 100 ? 0 : 10; // شحن مجاني فوق 100

      const total = Math.max(0, subtotal - discount + shipping + tax);

      return {
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(discount.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
        total: Number(total.toFixed(2)),
        totalItems: cart.totalItems || 0
      };
    } catch (error) {
      console.error('Error calculating checkout totals:', error);
      return {
        subtotal: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        totalItems: 0
      };
    }
  }, [cart.subtotal, cart.discount, cart.totalItems]);

  // عناصر العربة بشكل آمن
  const safeItems = useMemo(() => {
    return cart.items?.map(item => ({
      id: item.id || item._id,
      productId: item.productId || item.product?._id,
      product: item.product || { title: 'Product', images: [], price: 0 },
      quantity: item.quantity || 1,
      price: item.price || 0,
      size: item.size || item.variant?.size,
      color: item.color || item.variant?.color
    })) || [];
  }, [cart.items]);

  return {

    items: safeItems,
    isEmpty: safeItems.length === 0,


    ...checkoutTotals,


    loading: cart.loading || false,
    isAuthenticated: cart.isAuthenticated || false,


    clearCart: cart.clearCart,
    refreshCart: cart.refreshCart
  };
};
