// lib/components/AuthDebug.tsx
'use client';

import { useGetMeQuery } from '@/lib/services/authApi';
import { useAppSelector } from '@/lib/hooks/redux';

export function AuthDebug() {
  const { data: userData, isLoading, isError, isSuccess } = useGetMeQuery();
  const authState = useAppSelector((state) => state.auth);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Auth Debug:</h3>
      <div className="space-y-1">
        <div>RTK Query: {isLoading ? 'Loading' : isError ? 'Error' : isSuccess ? 'Success' : 'Idle'}</div>
        <div>Redux Auth: {authState.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
        <div>User: {authState.user ? authState.user.name : 'No user'}</div>
        <div>User Data: {userData ? 'Has data' : 'No data'}</div>
        <div>Loading: {authState.isLoading ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
}
