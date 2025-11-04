// lib/providers/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useGetMeQuery } from '@/lib/services/authApi';
import { useAppDispatch } from '@/lib/hooks/redux';
import { setLoading } from '@/lib/features/auth/authSlice';

interface AuthContextType {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  // SINGLE SOURCE OF TRUTH - Only one useGetMeQuery in the entire app
  const { isLoading, isError, isSuccess } = useGetMeQuery(undefined, {
    // Critical: Prevent unnecessary refetches
    refetchOnMountOrArgChange: false, // CHANGE THIS TO FALSE
    refetchOnFocus: false,
    refetchOnReconnect: false,
    pollingInterval: 0, // No polling
  });

  console.log('🔐 AuthProvider - Status:', { isLoading, isError, isSuccess });

  // Sync loading state with Redux
  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  const value = {
    isLoading,
    isError,
    isSuccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStatus = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthStatus must be used within an AuthProvider');
  }
  return context;
};
