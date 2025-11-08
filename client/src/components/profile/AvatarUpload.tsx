// components/profile/AvatarUpload.tsx
'use client';

import React, { useRef, useState } from 'react';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProfile } from '@/lib/hooks/useProfile';

interface AvatarUploadProps {
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ className }) => {
  const {
    user,
    avatarPreview,
    isUpdatingAvatar,
    isDeletingAvatar,
    updateAvatar,
    deleteAvatar,
    handleAvatarSelect,
    clearAvatarPreview,
  } = useProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const currentAvatar = avatarPreview || user?.avatar?.url;

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      // Show preview
      await handleAvatarSelect(file);

      // Auto-upload after preview
      await updateAvatar(file);
    } catch (error) {
      console.error('Error handling avatar:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveAvatar = async () => {
    if (user?.avatar?.url && !user.avatar.url.includes('default-avatar')) {
      await deleteAvatar();
    }
    clearAvatarPreview();
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      {/* Avatar Display */}
      <div className="relative">
        <div
          className={cn(
            'w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all duration-200',
            isDragOver ? 'border-blue-400 scale-105' : 'border-gray-200',
            currentAvatar ? 'bg-cover bg-center' : 'bg-gradient-to-r from-blue-500 to-purple-500'
          )}
          style={
            currentAvatar
              ? { backgroundImage: `url(${currentAvatar})` }
              : undefined
          }
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {!currentAvatar && (
            <span className="text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          )}

          {/* Loading Overlay */}
          {(isUpdatingAvatar || isDeletingAvatar) && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUpdatingAvatar || isDeletingAvatar}
          className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* Remove Button (only if user has custom avatar) */}
        {user?.avatar?.url && !user.avatar.url.includes('default-avatar') && !avatarPreview && (
          <button
            onClick={handleRemoveAvatar}
            disabled={isDeletingAvatar}
            className="absolute -bottom-2 -left-2 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* File Input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Info */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Click the camera icon to upload a new photo
        </p>
        <p className="text-xs text-gray-500">
          Supports JPG, PNG, WEBP • Max 5MB
        </p>

        {/* Drag & Drop Area */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Or drag and drop an image here
          </p>
        </div>
      </div>

      {/* Preview Actions */}
      {avatarPreview && !isUpdatingAvatar && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={clearAvatarPreview}
            disabled={isUpdatingAvatar}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              // Re-upload the file when user confirms
              const fileInput = fileInputRef.current;
              if (fileInput?.files?.[0]) {
                updateAvatar(fileInput.files[0]);
              }
            }}
            disabled={isUpdatingAvatar}
          >
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};
