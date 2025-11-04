// components/AuthListenerWrapper.tsx
'use client';

import { useAuthListener } from '@/lib/hooks/useAuthListener';

export function AuthListenerWrapper() {
  useAuthListener();
  return null;
}
