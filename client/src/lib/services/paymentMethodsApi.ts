// import { baseApi } from './baseApi';
// import {
//   PaymentMethod,
//   PaymentMethodsResponse,
//   PaymentMethodResponse,
//   SetupIntentResponse,
//   AddPaymentMethodData,
//   DefaultPaymentMethodResponse,
//   DeletePaymentMethodResponse,
// } from '@/types/index';

// export const paymentMethodsApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     // Get all payment methods
//     getPaymentMethods: builder.query<PaymentMethodsResponse, void>({
//       query: () => '/payment-methods',
//       providesTags: ['PaymentMethod'],
//     }),

//     // Get payment method by ID
//     getPaymentMethod: builder.query<PaymentMethodResponse, string>({
//       query: (id) => `/payment-methods/${id}`,
//       providesTags: (result, error, id) => [{ type: 'PaymentMethod', id }],
//     }),

//     // Create setup intent
//     createSetupIntent: builder.mutation<SetupIntentResponse, void>({
//       query: () => ({
//         url: '/payment-methods/setup-intent',
//         method: 'POST',
//       }),
//     }),

//     // Add payment method
//     addPaymentMethod: builder.mutation<PaymentMethodResponse, AddPaymentMethodData>({
//       query: (data) => ({
//         url: '/payment-methods',
//         method: 'POST',
//         body: data,
//       }),
//       invalidatesTags: ['PaymentMethod'],
//     }),

//     // Set default payment method
//     setDefaultPaymentMethod: builder.mutation<DefaultPaymentMethodResponse, string>({
//       query: (id) => ({
//         url: `/payment-methods/${id}/default`,
//         method: 'PATCH',
//       }),
//       invalidatesTags: ['PaymentMethod'],
//     }),

//     // Update payment method
//     updatePaymentMethod: builder.mutation<PaymentMethodResponse, { id: string; data: Partial<PaymentMethod> }>({
//       query: ({ id, data }) => ({
//         url: `/payment-methods/${id}`,
//         method: 'PUT',
//         body: data,
//       }),
//       invalidatesTags: (result, error, { id }) => [{ type: 'PaymentMethod', id }],
//     }),

//     // Delete payment method
//     deletePaymentMethod: builder.mutation<DeletePaymentMethodResponse, string>({
//       query: (id) => ({
//         url: `/payment-methods/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['PaymentMethod'],
//     }),
//   }),
// });

// export const {
//   useGetPaymentMethodsQuery,
//   useGetPaymentMethodQuery,
//   useCreateSetupIntentMutation,
//   useAddPaymentMethodMutation,
//   useSetDefaultPaymentMethodMutation,
//   useUpdatePaymentMethodMutation,
//   useDeletePaymentMethodMutation,
// } = paymentMethodsApi;


// lib/services/paymentMethodsApi.ts
import { baseApi } from './baseApi';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_account';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: string;
    country: string;
  };
  paypal?: {
    email: string;
    payer_id: string;
  };
  isDefault: boolean;
  created: number;
}

export interface SetupIntent {
  client_secret: string;
  id: string;
}

export const paymentMethodsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get payment methods
    getPaymentMethods: builder.query<{ success: boolean; data: { paymentMethods: PaymentMethod[] } }, void>({
      query: () => '/payment-methods',
      providesTags: ['PaymentMethods'],
    }),

    // Create setup intent for adding new payment method
    createSetupIntent: builder.mutation<{ success: boolean; data: { setupIntent: SetupIntent } }, void>({
      query: () => ({
        url: '/payment-methods/setup-intent',
        method: 'POST',
      }),
    }),

    // Add new payment method
    addPaymentMethod: builder.mutation<{ success: boolean; data: { paymentMethod: PaymentMethod } }, { paymentMethodId: string; type: string }>({
      query: (data) => ({
        url: '/payment-methods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PaymentMethods'],
    }),

    // Set default payment method
    setDefaultPaymentMethod: builder.mutation<{ success: boolean; message: string }, string>({
      query: (paymentMethodId) => ({
        url: `/payment-methods/${paymentMethodId}/default`,
        method: 'PUT',
      }),
      invalidatesTags: ['PaymentMethods'],
    }),

    // Remove payment method
    removePaymentMethod: builder.mutation<{ success: boolean; message: string }, string>({
      query: (paymentMethodId) => ({
        url: `/payment-methods/${paymentMethodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethods'],
    }),
  }),
});

export const {
  useGetPaymentMethodsQuery,
  useCreateSetupIntentMutation,
  useAddPaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
  useRemovePaymentMethodMutation,
} = paymentMethodsApi;
