// lib/hooks/useReviews.ts
import { useCallback, useState } from 'react';
import {
  useGetUserReviewsQuery,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
  useLikeReviewMutation,
  useReportReviewMutation,
  useGetReviewStatsQuery,
} from '@/lib/services/reviewsApi';
import { useToast } from './useToast';
import { UpdateReviewData } from '@/lib/services/reviewsApi';

export const useReviews = (page: number = 1, limit: number = 10) => {
  const { success, error } = useToast();
  const [editingReview, setEditingReview] = useState<string | null>(null);

  // Queries
  const {
    data: reviewsResponse,
    isLoading: isLoadingReviews,
    error: reviewsError,
    refetch: refetchReviews,
  } = useGetUserReviewsQuery({ page, limit });

  const { data: statsResponse, isLoading: isLoadingStats } = useGetReviewStatsQuery();

  // Mutations
  const [deleteReviewMutation, { isLoading: isDeletingReview }] = useDeleteReviewMutation();
  const [updateReviewMutation, { isLoading: isUpdatingReview }] = useUpdateReviewMutation();
  const [likeReviewMutation, { isLoading: isLikingReview }] = useLikeReviewMutation();
  const [reportReviewMutation, { isLoading: isReportingReview }] = useReportReviewMutation();

  const reviews = reviewsResponse?.data?.reviews || [];
  const pagination = reviewsResponse?.data?.pagination;
  const stats = statsResponse?.data;

  // Delete review
  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      const result = await deleteReviewMutation(reviewId).unwrap();
      success(result.message || 'Review deleted successfully');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to delete review';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [deleteReviewMutation, success, error]);

  // Update review
  const updateReview = useCallback(async (reviewId: string, data: UpdateReviewData) => {
    try {
      const result = await updateReviewMutation({ id: reviewId, data }).unwrap();
      setEditingReview(null);
      success('Review updated successfully');
      return { success: true, data: result.data };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to update review';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [updateReviewMutation, success, error]);

  // Like/unlike review
  const toggleLike = useCallback(async (reviewId: string) => {
    try {
      await likeReviewMutation(reviewId).unwrap();
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to like review';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [likeReviewMutation, error]);

  // Report review
  const reportReview = useCallback(async (reviewId: string, reason: string) => {
    try {
      const result = await reportReviewMutation({ id: reviewId, reason }).unwrap();
      success(result.message || 'Review reported successfully');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to report review';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [reportReviewMutation, success, error]);

  // Start editing
  const startEditing = useCallback((reviewId: string) => {
    setEditingReview(reviewId);
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingReview(null);
  }, []);

  return {
    // Data
    reviews,
    pagination,
    stats,

    // Loading states
    isLoading: isLoadingReviews,
    isLoadingStats,
    isDeletingReview,
    isUpdatingReview,
    isLikingReview,
    isReportingReview,

    // Actions
    deleteReview,
    updateReview,
    toggleLike,
    reportReview,
    refetchReviews,

    // Editing state
    editingReview,
    startEditing,
    cancelEditing,

    // Errors
    reviewsError,
  };
};
