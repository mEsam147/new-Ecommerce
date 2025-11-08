// app/settings/security/page.tsx
'use client';

import React from 'react';
import { SecuritySettingsContent } from '@/components/settings/SecuritySettingsContent';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

export default function SecuritySettingsPage() {
  return (
    <SettingsLayout>
      <SecuritySettingsContent />
    </SettingsLayout>
  );
}
