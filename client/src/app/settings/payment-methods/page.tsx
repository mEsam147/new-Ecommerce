// app/settings/payment-methods/page.tsx
'use client';

import React from 'react';
import { PaymentMethodsContent } from '@/components/settings/PaymentMethodsContent';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

export default function PaymentMethodsPage() {
  return (
    <SettingsLayout>
      <PaymentMethodsContent />
    </SettingsLayout>
  );
}
