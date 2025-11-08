// components/settings/SecuritySettingsContent.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Key,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Smartphone,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import * as motion from 'framer-motion/client';

export const SecuritySettingsContent: React.FC = () => {
  const { success, error } = useToast();
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [twoFAModal, setTwoFAModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    suspiciousActivityAlerts: true,
    sessionTimeout: 30,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      error('Password must be at least 8 characters long');
      return;
    }

    // Simulate API call
    try {
      // In real app, call your API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Password updated successfully!');
      setChangePasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      error('Failed to update password');
    }
  };

  const handleTwoFAToggle = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled
      }));
      success(`Two-factor authentication ${!securitySettings.twoFactorEnabled ? 'enabled' : 'disabled'}`);
      setTwoFAModal(false);
    } catch (err) {
      error('Failed to update two-factor authentication');
    }
  };

  const updateSecuritySetting = async (setting: string, value: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSecuritySettings(prev => ({ ...prev, [setting]: value }));
      success('Security setting updated');
    } catch (err) {
      error('Failed to update security setting');
    }
  };

  const securityScore = 85; // Calculate based on settings

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Key className="w-6 h-6" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy settings
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{securityScore}%</div>
                  <div className="text-sm text-gray-500">Security Score</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Security Score */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Overview
              </CardTitle>
              <CardDescription>
                Your current security status and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-green-600">Strong</div>
                  <div className="text-sm text-gray-600">Password Strength</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  {securitySettings.twoFactorEnabled ? (
                    <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  ) : (
                    <XCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  )}
                  <div className={`text-lg font-semibold ${securitySettings.twoFactorEnabled ? 'text-blue-600' : 'text-orange-600'}`}>
                    {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                  <div className="text-sm text-gray-600">2FA Status</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-purple-600">Active</div>
                  <div className="text-sm text-gray-600">Session Management</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Password Security */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Password & Authentication
                </CardTitle>
                <CardDescription>
                  Manage your password and authentication methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">Change Password</div>
                    <div className="text-sm text-gray-500">Last changed 2 months ago</div>
                  </div>
                  <Button onClick={() => setChangePasswordModal(true)}>
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-500">
                      {securitySettings.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={securitySettings.twoFactorEnabled ? "default" : "secondary"}>
                      {securitySettings.twoFactorEnabled ? 'ON' : 'OFF'}
                    </Badge>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={() => setTwoFAModal(true)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Preferences */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Preferences
                </CardTitle>
                <CardDescription>
                  Configure your security notifications and sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Login Alerts</div>
                    <div className="text-sm text-gray-500">Get notified of new sign-ins</div>
                  </div>
                  <Switch
                    checked={securitySettings.loginAlerts}
                    onCheckedChange={(checked) => updateSecuritySetting('loginAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Suspicious Activity</div>
                    <div className="text-sm text-gray-500">Alerts for unusual activity</div>
                  </div>
                  <Switch
                    checked={securitySettings.suspiciousActivityAlerts}
                    onCheckedChange={(checked) => updateSecuritySetting('suspiciousActivityAlerts', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout</Label>
                  <select
                    id="sessionTimeout"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                  <div className="text-sm text-gray-500">Automatically log out after inactivity</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Active Sessions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Devices that are currently logged into your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-8 h-8 text-gray-400" />
                    <div>
                      <div className="font-semibold">Chrome on Windows</div>
                      <div className="text-sm text-gray-500">New York, USA • Current session</div>
                    </div>
                  </div>
                  <Badge variant="default">Current</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-8 h-8 text-gray-400" />
                    <div>
                      <div className="font-semibold">Safari on iPhone</div>
                      <div className="text-sm text-gray-500">Los Angeles, USA • 2 hours ago</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Revoke
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Change Password Modal */}
      <Dialog open={changePasswordModal} onOpenChange={setChangePasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and set a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Your new password must be at least 8 characters long and include uppercase, lowercase, and numbers.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setChangePasswordModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Two-Factor Authentication Modal */}
      <Dialog open={twoFAModal} onOpenChange={setTwoFAModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              {securitySettings.twoFactorEnabled
                ? 'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
                : 'Add an extra layer of security to your account by enabling two-factor authentication.'
              }
            </DialogDescription>
          </DialogHeader>

          {!securitySettings.twoFactorEnabled && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Security Recommendation</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Two-factor authentication significantly improves your account security.
                      We recommend keeping it enabled.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-semibold mb-2">Set up authenticator app</h4>
                <p className="text-sm text-gray-600">
                  Use an app like Google Authenticator or Authy to generate verification codes.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setTwoFAModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTwoFAToggle}
              variant={securitySettings.twoFactorEnabled ? "outline" : "default"}
              className={securitySettings.twoFactorEnabled ? "text-red-600 hover:text-red-700 hover:border-red-300" : ""}
            >
              {securitySettings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
