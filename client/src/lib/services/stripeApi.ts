// lib/services/stripeApi.ts
import { baseApi } from './baseApi';

export interface SetupIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    setupIntentId: string;
    customerId: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: string;
  brand?: string;
  last4?: string;
  expiry?: string;
  name: string;
  email?: string;
  isDefault: boolean;
  isActive: boolean;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export const stripeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSetupIntent: builder.mutation<SetupIntentResponse, { metadata?: any }>({
      query: (data) => ({
        url: '/payment-methods/setup-intent',
        method: 'POST',
        body: data,
      }),
    }),

    getPaymentMethods: builder.query<{ success: boolean; data: PaymentMethod[]; count: number }, void>({
      query: () => '/payment-methods',
      providesTags: ['PaymentMethod'],
    }),

    addPaymentMethod: builder.mutation<{ success: boolean; data: PaymentMethod; message: string }, {
      paymentMethodId: string;
      isDefault?: boolean;
      type?: string;
      metadata?: any;
    }>({
      query: (data) => ({
        url: '/payment-methods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    setDefaultPaymentMethod: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/payment-methods/${id}/default`,
        method: 'PATCH',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    deletePaymentMethod: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/payment-methods/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    verifyPaymentMethod: builder.mutation<{ success: boolean; data: any; message: string }, string>({
      query: (id) => ({
        url: `/payment-methods/${id}/verify`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useCreateSetupIntentMutation,
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useVerifyPaymentMethodMutation,
} = stripeApi;
