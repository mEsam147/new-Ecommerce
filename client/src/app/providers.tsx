// app/providers.tsx
'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store';
import { Toaster } from 'react-hot-toast';
import SpinnerbLoader from '@/components/ui/SpinnerbLoader';
import { AuthProvider } from '@/lib/AuthProvider';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { CartStateMonitor } from '@/components/cart/CartStateMonitor';
import { WishlistInitializer } from '@/components/wishlist/WishlistInitializer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className='min-h-screen flex items-center justify-center'>
            <SpinnerbLoader className="w-10 h-10" />
          </div>
        }
        persistor={persistor}
      >
        <Toaster position='top-right' />
        <AuthProvider>
          <AuthInitializer />
          <WishlistInitializer />
          <CartStateMonitor />
          {children}
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}
