// app/settings/privacy/page.tsx
'use client';

import React from 'react';
import  PrivacySettingsContent  from '@/components/settings/PrivacySettingsContent';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

export default function PrivacySettingsPage() {
  return (
    <SettingsLayout>
      <PrivacySettingsContent />
    </SettingsLayout>
  );
}
