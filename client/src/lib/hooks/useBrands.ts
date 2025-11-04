// lib/hooks/useBrands.ts
import { useCallback } from 'react';
import { useGetBrandsQuery, useGetFollowedBrandsQuery, useFollowBrandMutation, useUnfollowBrandMutation } from '@/lib/services/brandApi';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

export const useBrands = () => {
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  // Queries
  const { data: brandsData, isLoading: brandsLoading, error: brandsError } = useGetBrandsQuery({});
  const { data: followedBrandsData, isLoading: followedLoading } = useGetFollowedBrandsQuery(undefined, {
    skip: !isAuthenticated
  });

  // Mutations
  const [followBrand] = useFollowBrandMutation();
  const [unfollowBrand] = useUnfollowBrandMutation();

  const handleFollowBrand = useCallback(async (brandId: string) => {
    if (!isAuthenticated) {
      toastError('Please sign in to follow brands');
      return;
    }

    try {
      await followBrand(brandId).unwrap();
      success('Brand followed successfully');
    } catch (error) {
      toastError('Failed to follow brand');
    }
  }, [followBrand, isAuthenticated, success, toastError]);

  const handleUnfollowBrand = useCallback(async (brandId: string) => {
    try {
      await unfollowBrand(brandId).unwrap();
      success('Brand unfollowed successfully');
    } catch (error) {
      toastError('Failed to unfollow brand');
    }
  }, [unfollowBrand, success, toastError]);

  const toggleFollowBrand = useCallback(async (brandId: string, isCurrentlyFollowing: boolean) => {
    if (isCurrentlyFollowing) {
      await handleUnfollowBrand(brandId);
    } else {
      await handleFollowBrand(brandId);
    }
  }, [handleFollowBrand, handleUnfollowBrand]);

  return {
    // Data
    brands: brandsData?.data || [],
    followedBrands: followedBrandsData?.data || [],

    // Loading states
    loading: brandsLoading,
    followedLoading,

    // Errors
    error: brandsError,

    // Actions
    followBrand: handleFollowBrand,
    unfollowBrand: handleUnfollowBrand,
    toggleFollowBrand,

    // Utilities
    totalBrands: brandsData?.data?.length || 0,
    totalFollowed: followedBrandsData?.data?.length || 0,
  };
};
