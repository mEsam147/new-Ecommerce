// lib/services/paymentApi.ts
import { baseApi } from './baseApi'

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create Stripe checkout session
    createCheckoutSession: builder.mutation({
      query: (data) => ({
        url: '/payments/create-checkout-session',
        method: 'POST',
        body: data,
      }),
    }),

    // ✅ Get session status
    getSessionStatus: builder.query({
      query: ({ sessionId }) => `/payments/session/${sessionId}`,
    }),

    // ✅ Get supported countries
    getSupportedCountries: builder.query({
      query: () => '/payments/supported-countries',
    }),

    // ✅ Create payment intent
    createPaymentIntent: builder.mutation({
      query: (data) => ({
        url: '/payments/create-payment-intent',
        method: 'POST',
        body: data,
      }),
    }),

    // ✅ Confirm payment
    confirmPayment: builder.mutation({
      query: (data) => ({
        url: '/payments/confirm-payment',
        method: 'POST',
        body: data,
      }),
    }),

    // ✅ Process manual payment
    processManualPayment: builder.mutation({
      query: (data) => ({
        url: '/payments/process-payment',
        method: 'POST',
        body: data,
      }),
    }),

    // ✅ Get user payments
    // getUserPayments: builder.query({
    //   query: ({ page = 1, limit = 10 } = {}) =>
    //     `/payments?page=${page}&limit=${limit}`,
    //   providesTags: ['Payment'],
    // }),

    // ✅ Get payment details
    getPaymentDetails: builder.query({
      query: (paymentId) => `/payments/${paymentId}`,
      providesTags: ['Payment'],
    }),

    // ✅ Get payment methods
    getPaymentMethods: builder.query({
      query: () => '/payments/payment-methods',
      providesTags: ['PaymentMethod'],
    }),

    // ✅ Add payment method
    addPaymentMethod: builder.mutation({
      query: (data) => ({
        url: '/payments/payment-methods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    // ✅ Update payment method
    updatePaymentMethod: builder.mutation({
      query: ({ methodId, ...data }) => ({
        url: `/payments/payment-methods/${methodId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    // ✅ Delete payment method
    deletePaymentMethod: builder.mutation({
      query: (methodId) => ({
        url: `/payments/payment-methods/${methodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    // ✅ Set default payment method
    setDefaultPaymentMethod: builder.mutation({
      query: (methodId) => ({
        url: `/payments/payment-methods/${methodId}/default`,
        method: 'PATCH',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    // ✅ Decrement inventory (for success page)
    decrementInventory: builder.mutation({
      query: (data) => ({
        url: '/payments/decrement-inventory',
        method: 'POST',
        body: data,
      }),
    }),
  }),

  overrideExisting: false,
})

export const {
  useCreateCheckoutSessionMutation,
  useGetSessionStatusQuery,
  useGetSupportedCountriesQuery,
  useCreatePaymentIntentMutation,
  useConfirmPaymentMutation,
  useProcessManualPaymentMutation,
  useGetUserPaymentsQuery,
  useGetPaymentDetailsQuery,
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
  useDecrementInventoryMutation,
} = paymentApi
