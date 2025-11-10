// lib/services/couponsApi.ts
import { baseApi } from './baseApi';

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

/**
 * ✅ Inject endpoints into baseApi
 * This way, you don't create a new API instance or middleware.
 */
export const couponsApi = baseApi.injectEndpoints({
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

        if (params.cartAmount && params.cartAmount > 0) {
          queryParams.append('cartAmount', params.cartAmount.toString());
        }

        if (params.cartItems && params.cartItems.length > 0) {
          queryParams.append('hasItems', 'true');
        }

        const queryString = queryParams.toString();
        return `coupons/available${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        return response?.data || response?.coupons || [];
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
  overrideExisting: false, // Keeps it modular and safe to reimport
});

export const {
  useValidateCouponMutation,
  useGetAvailableCouponsQuery,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;
