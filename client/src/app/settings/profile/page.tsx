// app/settings/profile/page.tsx
'use client';

import React from 'react';
import { ProfileSettingsContent } from '@/components/settings/ProfileSettingsContent';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

export default function ProfileSettingsPage() {
  return (
    <SettingsLayout>
      <ProfileSettingsContent />
    </SettingsLayout>
  );
}
