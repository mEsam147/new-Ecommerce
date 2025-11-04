// components/DebugCart.tsx
'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { fetchCart } from '@/lib/features/carts/cartsSlice';
import { useEffect } from 'react';

export function DebugCart() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart);

  useEffect(() => {
    console.log('🔍 DebugCart - STATE UPDATED:', {
      auth: {
        isAuthenticated: auth.isAuthenticated,
        hasToken: !!auth.token,
        hasUser: !!auth.user,
        userEmail: auth.user?.email,
        isLoading: auth.isLoading
      },
      cart: {
        userCartItems: cart.userCart.length,
        guestCartItems: cart.guestCart.length,
        loading: cart.loading,
        syncing: cart.syncing,
        mergeStatus: cart.mergeStatus
      }
    });
  }, [auth, cart]);

  const testCartFetch = async () => {
    console.log('🧪 MANUAL TEST: Starting cart fetch...');
    console.log('🧪 Current auth state:', {
      token: auth.token ? '✅' : '❌',
      user: auth.user ? '✅' : '❌',
      isAuthenticated: auth.isAuthenticated
    });

    try {
      const result = await dispatch(fetchCart()).unwrap();
      console.log('🧪 MANUAL TEST SUCCESS:', {
        itemsCount: result.items?.length,
        result
      });
    } catch (error: any) {
      console.error('🧪 MANUAL TEST FAILED:', {
        error: error.message,
        status: error.status,
        data: error.data
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      zIndex: 9999,
      background: 'white',
      padding: '15px',
      border: '2px solid red',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h4>🔍 Cart Debug</h4>
      <button
        onClick={testCartFetch}
        style={{
          marginBottom: '10px',
          padding: '5px 10px',
          background: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Cart Fetch
      </button>
      <div><strong>Auth:</strong> {auth.isAuthenticated ? '✅' : '❌'}</div>
      <div><strong>Token:</strong> {auth.token ? '✅' : '❌'}</div>
      <div><strong>User:</strong> {auth.user ? '✅' : '❌'}</div>
      <div><strong>User Cart Items:</strong> {cart.userCart.length}</div>
      <div><strong>Guest Cart Items:</strong> {cart.guestCart.length}</div>
      <div><strong>Cart Loading:</strong> {cart.loading ? '⏳' : '✅'}</div>
    </div>
  );
}
