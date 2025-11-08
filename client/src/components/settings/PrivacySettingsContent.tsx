import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Users, UserCheck, Database, Download } from 'lucide-react';

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  allowMessagesFrom: 'everyone' | 'friends' | 'none';
  dataCollection: boolean;
  personalizedAds: boolean;
  searchVisibility: boolean;
}

const PrivacySettingsContent: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowFriendRequests: true,
    allowMessagesFrom: 'friends',
    dataCollection: true,
    personalizedAds: false,
    searchVisibility: true,
  });

  const [showExportModal, setShowExportModal] = useState(false);

  const handleSettingChange = (key: keyof PrivacySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExportData = () => {
    // In a real app, this would make an API call to export user data
    console.log('Exporting user data...');
    setShowExportModal(false);
    // Simulate export success
    alert('Your data export has been started. You will receive an email when it is ready.');
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all privacy settings to default?')) {
      setSettings({
        profileVisibility: 'public',
        showOnlineStatus: true,
        allowFriendRequests: true,
        allowMessagesFrom: 'friends',
        dataCollection: true,
        personalizedAds: false,
        searchVisibility: true,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Privacy Settings</h1>
            <p className="text-gray-600 mt-1">
              Control your privacy and how others interact with you on our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Privacy Section */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-gray-600" />
          Profile Privacy
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Profile Visibility</label>
              <p className="text-sm text-gray-500">Who can see your profile</p>
            </div>
            <select
              value={settings.profileVisibility}
              onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              className="rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Show Online Status</label>
              <p className="text-sm text-gray-500">Let others see when you're online</p>
            </div>
            <button
              onClick={() => handleSettingChange('showOnlineStatus', !settings.showOnlineStatus)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showOnlineStatus ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Search Visibility</label>
              <p className="text-sm text-gray-500">Allow your profile to appear in search results</p>
            </div>
            <button
              onClick={() => handleSettingChange('searchVisibility', !settings.searchVisibility)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.searchVisibility ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.searchVisibility ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Communication Section */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          Communication
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Allow Friend Requests</label>
              <p className="text-sm text-gray-500">Allow others to send you friend requests</p>
            </div>
            <button
              onClick={() => handleSettingChange('allowFriendRequests', !settings.allowFriendRequests)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.allowFriendRequests ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.allowFriendRequests ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Who Can Message You</label>
              <p className="text-sm text-gray-500">Control who can send you direct messages</p>
            </div>
            <select
              value={settings.allowMessagesFrom}
              onChange={(e) => handleSettingChange('allowMessagesFrom', e.target.value)}
              className="rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="none">No One</option>
            </select>
          </div>
        </div>
      </section>

      {/* Data & Privacy Section */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-600" />
          Data & Privacy
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Data Collection</label>
              <p className="text-sm text-gray-500">Allow us to collect analytics to improve our services</p>
            </div>
            <button
              onClick={() => handleSettingChange('dataCollection', !settings.dataCollection)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.dataCollection ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.dataCollection ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Personalized Ads</label>
              <p className="text-sm text-gray-500">See ads tailored to your interests</p>
            </div>
            <button
              onClick={() => handleSettingChange('personalizedAds', !settings.personalizedAds)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.personalizedAds ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.personalizedAds ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export Your Data
            </button>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={handleResetSettings}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Reset to Defaults
        </button>

        <button
          onClick={() => alert('Privacy settings saved!')}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>

      {/* Export Data Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Export Your Data
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              We'll prepare a file with all your personal data and send it to your email address. This may take up to 24 hours.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacySettingsContent;
