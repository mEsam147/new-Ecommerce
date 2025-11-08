// lib/hooks/useProfile.ts
import { useCallback, useState } from 'react';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useDeleteAvatarMutation
} from '@/lib/services/profileApi';
import { useToast } from './useToast';
import { UpdateProfileData } from '@/lib/services/profileApi';

export const useProfile = () => {
  const { success, error } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // RTK Query hooks
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  const [updateProfileMutation, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updateAvatarMutation, { isLoading: isUpdatingAvatar }] = useUpdateAvatarMutation();
  const [deleteAvatarMutation, { isLoading: isDeletingAvatar }] = useDeleteAvatarMutation();

  const user = profileData?.data?.user;

  // Handle avatar file selection and preview
  const handleAvatarSelect = useCallback((file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        resolve(result);
      };

      reader.onerror = (error) => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }, []);

  // Update profile
  const updateProfile = useCallback(async (profileData: UpdateProfileData) => {
    try {
      const result = await updateProfileMutation(profileData).unwrap();
      success('Profile updated successfully!');
      return { success: true, data: result.data };
    } catch (err: any) {
      console.error('Profile update error:', err);
      const errorMessage = err?.data?.message || 'Failed to update profile';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [updateProfileMutation, success, error]);

  // Update avatar
  const updateAvatar = useCallback(async (avatarFile: File) => {
    try {
      // Create FormData and append file
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const result = await updateAvatarMutation(formData).unwrap();

      // Clear preview after successful upload
      setAvatarPreview(null);

      success('Profile picture updated successfully!');
      return { success: true, data: result.data };
    } catch (err: any) {
      console.error('Avatar update error:', err);
      const errorMessage = err?.data?.message || 'Failed to update profile picture';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [updateAvatarMutation, success, error]);

  // Delete avatar
  const deleteAvatar = useCallback(async () => {
    try {
      const result = await deleteAvatarMutation().unwrap();
      setAvatarPreview(null);
      success('Profile picture removed successfully!');
      return { success: true, data: result.data };
    } catch (err: any) {
      console.error('Avatar delete error:', err);
      const errorMessage = err?.data?.message || 'Failed to remove profile picture';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [deleteAvatarMutation, success, error]);

  // Clear avatar preview
  const clearAvatarPreview = useCallback(() => {
    setAvatarPreview(null);
  }, []);

  return {
    // Data
    user,
    profile: user,
    avatarPreview,

    // Loading states
    isLoading: isLoadingProfile,
    isUpdating: isUpdatingProfile,
    isUpdatingAvatar,
    isDeletingAvatar,

    // Actions
    updateProfile,
    updateAvatar,
    deleteAvatar,
    handleAvatarSelect,
    clearAvatarPreview,
    refetchProfile,

    // Errors
    profileError,
  };
};
