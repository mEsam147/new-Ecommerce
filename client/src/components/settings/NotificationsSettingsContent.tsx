'use client';

import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Calendar, Shield, Users, Volume2, VolumeX } from 'lucide-react';

interface NotificationSettings {
  // Push Notifications
  pushEnabled: boolean;
  pushMessages: boolean;
  pushFriendRequests: boolean;
  pushEvents: boolean;
  pushSecurity: boolean;

  // Email Notifications
  emailEnabled: boolean;
  emailDigest: 'never' | 'daily' | 'weekly';
  emailMessages: boolean;
  emailFriendRequests: boolean;
  emailEvents: boolean;
  emailPromotions: boolean;

  // In-App Notifications
  inAppEnabled: boolean;
  inAppSounds: boolean;
  inAppBadges: boolean;
  inAppPreview: boolean;

  // Specific Notifications
  mentionNotifications: boolean;
  commentNotifications: boolean;
  groupNotifications: boolean;
  eventReminders: boolean;
}

const NotificationsSettingsContent: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    // Push Notifications
    pushEnabled: true,
    pushMessages: true,
    pushFriendRequests: true,
    pushEvents: false,
    pushSecurity: true,

    // Email Notifications
    emailEnabled: true,
    emailDigest: 'weekly',
    emailMessages: true,
    emailFriendRequests: true,
    emailEvents: true,
    emailPromotions: false,

    // In-App Notifications
    inAppEnabled: true,
    inAppSounds: true,
    inAppBadges: true,
    inAppPreview: true,

    // Specific Notifications
    mentionNotifications: true,
    commentNotifications: true,
    groupNotifications: false,
    eventReminders: true,
  });

  const [activeTab, setActiveTab] = useState<'push' | 'email' | 'in-app'>('push');

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleAllPushNotifications = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      pushMessages: enabled,
      pushFriendRequests: enabled,
      pushEvents: enabled,
      pushSecurity: enabled,
    }));
  };

  const toggleAllEmailNotifications = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      emailMessages: enabled,
      emailFriendRequests: enabled,
      emailEvents: enabled,
      emailPromotions: enabled,
    }));
  };

  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
  }> = ({ enabled, onChange, disabled = false }) => (
    <button
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const NotificationCategory: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    children?: React.ReactNode;
  }> = ({ icon, title, description, enabled, onToggle, children }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-gray-200">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <ToggleSwitch enabled={enabled} onChange={onToggle} />
      </div>
      {enabled && children}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage how and when you receive notifications
            </p>
          </div>
        </div>
      </div>

      {/* Notification Channels Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'push', label: 'Push Notifications', icon: Bell },
              { id: 'email', label: 'Email Notifications', icon: Mail },
              { id: 'in-app', label: 'In-App Notifications', icon: MessageSquare },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Push Notifications Tab */}
          {activeTab === 'push' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-gray-600 text-sm">Receive notifications on your device</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAllPushNotifications(true)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Enable All
                  </button>
                  <button
                    onClick={() => toggleAllPushNotifications(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <NotificationCategory
                  icon={<MessageSquare className="w-4 h-4 text-blue-600" />}
                  title="Direct Messages"
                  description="When someone sends you a direct message"
                  enabled={settings.pushMessages}
                  onToggle={(enabled) => handleSettingChange('pushMessages', enabled)}
                />

                <NotificationCategory
                  icon={<Users className="w-4 h-4 text-green-600" />}
                  title="Friend Requests"
                  description="When someone sends you a friend request"
                  enabled={settings.pushFriendRequests}
                  onToggle={(enabled) => handleSettingChange('pushFriendRequests', enabled)}
                />

                <NotificationCategory
                  icon={<Calendar className="w-4 h-4 text-purple-600" />}
                  title="Events & Reminders"
                  description="Upcoming events and reminders"
                  enabled={settings.pushEvents}
                  onToggle={(enabled) => handleSettingChange('pushEvents', enabled)}
                />

                <NotificationCategory
                  icon={<Shield className="w-4 h-4 text-red-600" />}
                  title="Security Alerts"
                  description="Important security notifications"
                  enabled={settings.pushSecurity}
                  onToggle={(enabled) => handleSettingChange('pushSecurity', enabled)}
                />
              </div>
            </div>
          )}

          {/* Email Notifications Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-gray-600 text-sm">Receive notifications via email</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAllEmailNotifications(true)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Enable All
                  </button>
                  <button
                    onClick={() => toggleAllEmailNotifications(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Digest</h3>
                      <p className="text-sm text-gray-500">Summary of your notifications</p>
                    </div>
                    <select
                      value={settings.emailDigest}
                      onChange={(e) => handleSettingChange('emailDigest', e.target.value)}
                      className="rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="never">Never</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                <NotificationCategory
                  icon={<MessageSquare className="w-4 h-4 text-blue-600" />}
                  title="Direct Messages"
                  description="Email when you receive new messages"
                  enabled={settings.emailMessages}
                  onToggle={(enabled) => handleSettingChange('emailMessages', enabled)}
                />

                <NotificationCategory
                  icon={<Users className="w-4 h-4 text-green-600" />}
                  title="Friend Requests"
                  description="Email when you receive friend requests"
                  enabled={settings.emailFriendRequests}
                  onToggle={(enabled) => handleSettingChange('emailFriendRequests', enabled)}
                />

                <NotificationCategory
                  icon={<Calendar className="w-4 h-4 text-purple-600" />}
                  title="Event Updates"
                  description="Email about events and updates"
                  enabled={settings.emailEvents}
                  onToggle={(enabled) => handleSettingChange('emailEvents', enabled)}
                />

                <NotificationCategory
                  icon={<Bell className="w-4 h-4 text-orange-600" />}
                  title="Promotions & News"
                  description="Special offers and platform updates"
                  enabled={settings.emailPromotions}
                  onToggle={(enabled) => handleSettingChange('emailPromotions', enabled)}
                />
              </div>
            </div>
          )}

          {/* In-App Notifications Tab */}
          {activeTab === 'in-app' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">In-App Notifications</h3>
                  <p className="text-gray-600 text-sm">Notifications while using the app</p>
                </div>
                <ToggleSwitch
                  enabled={settings.inAppEnabled}
                  onChange={(enabled) => handleSettingChange('inAppEnabled', enabled)}
                />
              </div>

              {settings.inAppEnabled && (
                <div className="space-y-4">
                  <NotificationCategory
                    icon={<Volume2 className="w-4 h-4 text-blue-600" />}
                    title="Notification Sounds"
                    description="Play sounds for new notifications"
                    enabled={settings.inAppSounds}
                    onToggle={(enabled) => handleSettingChange('inAppSounds', enabled)}
                  />

                  <NotificationCategory
                    icon={<Bell className="w-4 h-4 text-green-600" />}
                    title="Badge Counts"
                    description="Show unread counts on app icon"
                    enabled={settings.inAppBadges}
                    onToggle={(enabled) => handleSettingChange('inAppBadges', enabled)}
                  />

                  <NotificationCategory
                    icon={<MessageSquare className="w-4 h-4 text-purple-600" />}
                    title="Message Previews"
                    description="Show message content in notifications"
                    enabled={settings.inAppPreview}
                    onToggle={(enabled) => handleSettingChange('inAppPreview', enabled)}
                  />

                  {/* Specific Notification Types */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Specific Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'mentionNotifications', label: 'Mentions', description: 'When someone mentions you' },
                        { key: 'commentNotifications', label: 'Comments', description: 'When someone comments on your posts' },
                        { key: 'groupNotifications', label: 'Group Activities', description: 'Updates from your groups' },
                        { key: 'eventReminders', label: 'Event Reminders', description: 'Reminders for upcoming events' },
                      ].map(({ key, label, description }) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{label}</div>
                            <div className="text-gray-500 text-xs">{description}</div>
                          </div>
                          <ToggleSwitch
                            enabled={settings[key as keyof NotificationSettings] as boolean}
                            onChange={(enabled) => handleSettingChange(key as keyof NotificationSettings, enabled)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={() => {
            setSettings({
              pushEnabled: true,
              pushMessages: true,
              pushFriendRequests: true,
              pushEvents: false,
              pushSecurity: true,
              emailEnabled: true,
              emailDigest: 'weekly',
              emailMessages: true,
              emailFriendRequests: true,
              emailEvents: true,
              emailPromotions: false,
              inAppEnabled: true,
              inAppSounds: true,
              inAppBadges: true,
              inAppPreview: true,
              mentionNotifications: true,
              commentNotifications: true,
              groupNotifications: false,
              eventReminders: true,
            });
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Reset to Defaults
        </button>

        <button
          onClick={() => alert('Notification settings saved!')}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default NotificationsSettingsContent;
