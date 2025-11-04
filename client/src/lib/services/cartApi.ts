// lib/services/cartApi.ts
import { baseApi } from './baseApi';

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    images: Array<{ url: string; alt?: string }>;
    price: number;
    inventory: {
      trackQuantity: boolean;
      quantity: number;
      lowStockAlert: number;
    };
    variants?: Array<{
      size: string;
      color: string;
      stock: number;
      sku: string;
      price: number;
      _id: string;
    }>;
  };
  variant?: {
    size: string;
    color: string;
  };
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<{ success: boolean; data: Cart; message?: string }, void>({
      query: () => '/carts',
      providesTags: ['Cart'],
       keepUnusedDataFor: 60,
    }),

    addToCart: builder.mutation<
      { success: boolean; data: Cart; message: string },
      { productId: string; size?: string; color?: string; quantity?: number }
    >({
      query: (data) => {
        // Clean up the data - remove undefined values
        const cleanedData = Object.fromEntries(
          Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
        );

        return {
          url: '/carts/items',
          method: 'POST',
          body: cleanedData,
        };
      },
      invalidatesTags: ['Cart'],

      // Optimistic update
      async onQueryStarted({ productId, quantity = 1, size, color }, { dispatch, queryFulfilled }) {
        // Optional: Add optimistic update here if needed
        try {
          await queryFulfilled;
        } catch (error) {
          // Revert optimistic update on error
        }
      },
    }),

    updateCartItem: builder.mutation<
      { success: boolean; data: Cart; message: string },
      { itemId: string; quantity: number }
    >({
      query: ({ itemId, quantity }) => ({
        url: `/carts/items/${itemId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),

    removeCartItem: builder.mutation<
      { success: boolean; data: Cart; message: string },
      string
    >({
      query: (itemId) => ({
        url: `/carts/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation<
      { success: boolean; data: Cart; message: string },
      void
    >({
      query: () => ({
        url: '/carts',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
  useClearCartMutation,
} = cartApi;
