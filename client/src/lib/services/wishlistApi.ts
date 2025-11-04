// lib/services/wishlistApi.ts
import { baseApi } from './baseApi';

export interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    images: Array<{ url: string; alt?: string }>;
    price: number;
    comparePrice?: number;
    inventory: {
      trackQuantity: boolean;
      quantity: number;
      lowStockAlert: number;
    };
    isActive: boolean;
    rating?: {
      average: number;
      count: number;
    };
  };
  addedAt: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<{ success: boolean; data: Wishlist; message?: string }, void>({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),

    addToWishlist: builder.mutation<
      { success: boolean; data: Wishlist; message: string },
      { productId: string }
    >({
      query: (data) => ({
        url: '/wishlist/items',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wishlist'],
    }),

    removeFromWishlist: builder.mutation<
      { success: boolean; data: Wishlist; message: string },
      string
    >({
      query: (productId) => ({
        url: `/wishlist/items/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    clearWishlist: builder.mutation<
      { success: boolean; data: Wishlist; message: string },
      void
    >({
      query: () => ({
        url: '/wishlist',
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    moveToCart: builder.mutation<
      { success: boolean; message: string },
      { productId: string; size?: string; color?: string; quantity?: number }
    >({
      query: ({ productId, ...data }) => ({
        url: `/wishlist/items/${productId}/move-to-cart`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wishlist', 'Cart'],
    }),

    getWishlistCount: builder.query<{ success: boolean; data: { count: number } }, void>({
      query: () => '/wishlist/count',
      providesTags: ['Wishlist'],
    }),

    checkInWishlist: builder.query<{ success: boolean; data: { inWishlist: boolean } }, string>({
      query: (productId) => `/wishlist/check/${productId}`,
      providesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
  useMoveToCartMutation,
  useGetWishlistCountQuery,
  useCheckInWishlistQuery,
} = wishlistApi;
