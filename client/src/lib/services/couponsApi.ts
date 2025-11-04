// // lib/services/couponsApi.ts
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export interface Coupon {
//   id: string;
//   code: string;
//   name: string;
//   description?: string;
//   discountType: 'percentage' | 'fixed' | 'free_shipping';
//   discountValue: number;
//   minimumAmount: number;
//   maximumDiscount?: number;
//   isActive: boolean;
//   startDate: string;
//   endDate: string;
//   usageLimit?: number;
//   usedCount: number;
//   perUserLimit: number;
//   isFreeShipping?: boolean;
//   displayText?: string;
// }

// export interface ValidateCouponRequest {
//   code: string;
//   cartAmount: number;
//   products?: Array<{
//     productId: string;
//     product?: any;
//     quantity: number;
//     price: number;
//   }>;
// }

// export interface ValidateCouponResponse {
//   success: boolean;
//   data?: {
//     coupon: Coupon;
//     discountAmount: number;
//     finalAmount: number;
//     cartAmount: number;
//   };
//   message?: string;
// }

// export interface CouponsResponse {
//   success: boolean;
//   data: Coupon[];
//   pagination?: {
//     page: number;
//     limit: number;
//     total: number;
//     pages: number;
//   };
// }

// export const couponsApi = createApi({
//   reducerPath: 'couponsApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: '/api/',
//     prepareHeaders: (headers, { getState }) => {
//       // Get token from auth state
//       const token = (getState() as any).auth.token;
//       if (token) {
//         headers.set('authorization', `Bearer ${token}`);
//       }
//       headers.set('Content-Type', 'application/json');
//       return headers;
//     },
//   }),
//   tagTypes: ['Coupon'],
//   endpoints: (builder) => ({
//     // Validate coupon
//     validateCoupon: builder.mutation<ValidateCouponResponse, ValidateCouponRequest>({
//       query: (data) => ({
//         url: 'coupons/validate',
//         method: 'POST',
//         body: data,
//       }),
//       invalidatesTags: ['Coupon'],
//     }),

//     // Get available coupons
//     getAvailableCoupons: builder.query<Coupon[], { cartAmount?: number; cartItems?: any[] }>({
//       query: (params = {}) => {
//         const queryParams = new URLSearchParams();
//         if (params.cartAmount) {
//           queryParams.append('cartAmount', params.cartAmount.toString());
//         }
//         return `coupons/available?${queryParams.toString()}`;
//       },
//       transformResponse: (response: any) => {
//         return response.data || [];
//       },
//       providesTags: ['Coupon'],
//     }),

//     // Get all coupons (admin)
//     getCoupons: builder.query<CouponsResponse, { page?: number; limit?: number; active?: boolean; search?: string }>({
//       query: (params = {}) => {
//         const queryParams = new URLSearchParams();
//         Object.entries(params).forEach(([key, value]) => {
//           if (value !== undefined && value !== null) {
//             queryParams.append(key, value.toString());
//           }
//         });
//         return `coupons?${queryParams.toString()}`;
//       },
//       providesTags: ['Coupon'],
//     }),

//     // Create coupon (admin)
//     createCoupon: builder.mutation<{ success: boolean; data: Coupon }, any>({
//       query: (data) => ({
//         url: 'coupons',
//         method: 'POST',
//         body: data,
//       }),
//       invalidatesTags: ['Coupon'],
//     }),

//     // Update coupon (admin)
//     updateCoupon: builder.mutation<{ success: boolean; data: Coupon }, { id: string; data: any }>({
//       query: ({ id, data }) => ({
//         url: `coupons/${id}`,
//         method: 'PUT',
//         body: data,
//       }),
//       invalidatesTags: ['Coupon'],
//     }),

//     // Delete coupon (admin)
//     deleteCoupon: builder.mutation<{ success: boolean }, string>({
//       query: (id) => ({
//         url: `coupons/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['Coupon'],
//     }),
//   }),
// });

// export const {
//   useValidateCouponMutation,
//   useGetAvailableCouponsQuery,
//   useGetCouponsQuery,
//   useCreateCouponMutation,
//   useUpdateCouponMutation,
//   useDeleteCouponMutation,
// } = couponsApi;

// lib/services/couponsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minimumAmount: number;
  maximumDiscount?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  isFreeShipping?: boolean;
  displayText?: string;
}

export interface ValidateCouponRequest {
  code: string;
  cartAmount: number;
  products?: Array<{
    productId: string;
    product?: any;
    quantity: number;
    price: number;
  }>;
}

export interface ValidateCouponResponse {
  success: boolean;
  data?: {
    coupon: Coupon;
    discountAmount: number;
    finalAmount: number;
    cartAmount: number;
  };
  message?: string;
}

export interface CouponsResponse {
  success: boolean;
  data: Coupon[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const couponsApi = createApi({
  reducerPath: 'couponsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api', // Change to 5000
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Coupon'],
  endpoints: (builder) => ({
    // Validate coupon
    validateCoupon: builder.mutation<ValidateCouponResponse, ValidateCouponRequest>({
      query: (data) => ({
        url: 'coupons/validate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Coupon'],
    }),

    // Get available coupons
    getAvailableCoupons: builder.query<Coupon[], { cartAmount?: number; cartItems?: any[] }>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.cartAmount) {
          queryParams.append('cartAmount', params.cartAmount.toString());
        }
        return `coupons/available?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => {
        return response.data || [];
      },
      providesTags: ['Coupon'],
    }),

    // Get all coupons (admin)
    getCoupons: builder.query<CouponsResponse, { page?: number; limit?: number; active?: boolean; search?: string }>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
        return `coupons?${queryParams.toString()}`;
      },
      providesTags: ['Coupon'],
    }),

    // Create coupon (admin)
    createCoupon: builder.mutation<{ success: boolean; data: Coupon }, any>({
      query: (data) => ({
        url: 'coupons',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Coupon'],
    }),

    // Update coupon (admin)
    updateCoupon: builder.mutation<{ success: boolean; data: Coupon }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `coupons/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Coupon'],
    }),

    // Delete coupon (admin)
    deleteCoupon: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupon'],
    }),
  }),
});

export const {
  useValidateCouponMutation,
  useGetAvailableCouponsQuery,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;
