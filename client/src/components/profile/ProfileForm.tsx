// components/profile/ProfileForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Globe, Edit3, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/lib/hooks/useProfile';
import { UpdateProfileData } from '@/lib/services/profileApi';

export const ProfileForm: React.FC = () => {
  const { user, updateProfile, isUpdating } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || ''
      });
    }
    setIsEditing(false);
  };

  const handleChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fieldConfig = [
    {
      key: 'name' as keyof UpdateProfileData,
      label: 'Full Name',
      icon: User,
      placeholder: 'Enter your full name',
      type: 'text'
    },
    {
      key: 'email' as keyof UpdateProfileData,
      label: 'Email Address',
      icon: Mail,
      placeholder: 'Enter your email address',
      type: 'email'
    },
    {
      key: 'phone' as keyof UpdateProfileData,
      label: 'Phone Number',
      icon: Phone,
      placeholder: 'Enter your phone number',
      type: 'tel'
    },
    {
      key: 'address' as keyof UpdateProfileData,
      label: 'Address',
      icon: MapPin,
      placeholder: 'Enter your street address',
      type: 'text'
    },
    {
      key: 'city' as keyof UpdateProfileData,
      label: 'City',
      icon: Building,
      placeholder: 'Enter your city',
      type: 'text'
    },
    {
      key: 'country' as keyof UpdateProfileData,
      label: 'Country',
      icon: Globe,
      placeholder: 'Enter your country',
      type: 'text'
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </div>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
          className="flex items-center gap-2"
          disabled={isUpdating}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fieldConfig.map((field) => (
            <div key={field.key}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <field.icon className="w-4 h-4" />
                {field.label}
              </label>
              {isEditing ? (
                <Input
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={isUpdating}
                />
              ) : (
                <div className={cn(
                  "p-3 bg-gray-50 rounded-lg border min-h-[42px] flex items-center",
                  !user?.[field.key] && "text-gray-500"
                )}>
                  {user?.[field.key] || 'Not set'}
                </div>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              disabled={isUpdating}
            >
              <Save className="w-4 h-4" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function (add to your lib/utils if not exists)
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
