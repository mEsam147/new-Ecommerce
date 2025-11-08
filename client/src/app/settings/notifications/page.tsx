'use client';

import React from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import NotificationsSettingsContent from '@/components/settings/NotificationsSettingsContent';

export default function PrivacySettingsPage() {
  return (
    <SettingsLayout>
      <NotificationsSettingsContent />
    </SettingsLayout>
  );
}
