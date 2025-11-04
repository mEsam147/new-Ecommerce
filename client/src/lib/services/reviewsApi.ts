// lib/services/reviewsApi.ts
import { baseApi } from './baseApi';

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  product: string;
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  likes: number;
  dislikes: number;
  createdAt: string;
  updatedAt: string;
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<{
      success: boolean;
      data: {
        reviews: Review[];
        summary: {
          average: number;
          total: number;
          distribution: any;
        };
        pagination: any;
      }
    }, { productId: string; page?: number; limit?: number; rating?: number }>({
      query: ({ productId, page = 1, limit = 10, rating }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (rating) params.append('rating', rating.toString());

        return `/reviews/product/${productId}?${params.toString()}`;
      },
      providesTags: ['Review'],
    }),

    getUserReviews: builder.query<{ success: boolean; data: Review[]; pagination: any }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => `/reviews/my-reviews?page=${page}&limit=${limit}`,
      providesTags: ['Review'],
    }),

    createReview: builder.mutation<{ success: boolean; data: Review; message: string }, {
      productId: string;
      rating: number;
      title?: string;
      comment: string;
    }>({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Review', 'Product'],
    }),

    updateReview: builder.mutation<{ success: boolean; data: Review; message: string }, {
      id: string;
      data: {
        rating?: number;
        title?: string;
        comment?: string;
      };
    }>({
      query: ({ id, data }) => ({
        url: `/reviews/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Review', id }],
    }),

    deleteReview: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
    }),

    likeReview: builder.mutation<{ success: boolean; data: { likes: number }; message: string }, string>({
      query: (id) => ({
        url: `/reviews/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Review'],
    }),

    // Admin only
    getAllReviews: builder.query<{ success: boolean; data: Review[]; pagination: any }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => `/reviews?page=${page}&limit=${limit}`,
      providesTags: ['Review'],
    }),

    toggleReviewVerification: builder.mutation<{ success: boolean; data: Review; message: string }, string>({
      query: (id) => ({
        url: `/reviews/${id}/verify`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Review'],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetUserReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useLikeReviewMutation,
  useGetAllReviewsQuery,
  useToggleReviewVerificationMutation,
} = reviewsApi;
