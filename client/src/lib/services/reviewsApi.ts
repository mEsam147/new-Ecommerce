// lib/services/reviewsApi.ts
import { baseApi } from './baseApi';

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: {
      url: string;
    };
  };
  product: {
    _id: string;
    title: string;
    images: Array<{
      url: string;
    }>;
    slug: string;
  };
  rating: number;
  title?: string;
  comment: string;
  images?: Array<{
    public_id: string;
    url: string;
  }>;
  isVerified: boolean;
  likes: string[];
  reports: Array<{
    user: string;
    reason: string;
    createdAt: string;
  }>;
  helpful: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: File[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ReviewStats {
  success: boolean;
  data: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    verifiedReviews: number;
  };
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's reviews
    getUserReviews: builder.query<ReviewsResponse, { page?: number; limit?: number }>({
      query: (params = {}) => ({
        url: '/reviews/my-reviews',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
        },
      }),
      providesTags: ['Reviews'],
    }),

    // Create review
    createReview: builder.mutation<{ success: boolean; data: { review: Review } }, CreateReviewData>({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reviews', 'Product'],
    }),

    // Update review
    updateReview: builder.mutation<{ success: boolean; data: { review: Review } }, { id: string; data: UpdateReviewData }>({
      query: ({ id, data }) => ({
        url: `/reviews/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Reviews', 'Product'],
    }),

    // Delete review
    deleteReview: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews', 'Product'],
    }),

    // Like/unlike review
    likeReview: builder.mutation<{ success: boolean; data: { review: Review } }, string>({
      query: (id) => ({
        url: `/reviews/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Reviews'],
    }),

    // Report review
    reportReview: builder.mutation<{ success: boolean; message: string }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/reviews/${id}/report`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Reviews'],
    }),

    // Get review stats
    getReviewStats: builder.query<ReviewStats, void>({
      query: () => '/reviews/stats',
      providesTags: ['Reviews'],
    }),
  }),
});

export const {
  useGetUserReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useLikeReviewMutation,
  useReportReviewMutation,
  useGetReviewStatsQuery,
} = reviewsApi;
