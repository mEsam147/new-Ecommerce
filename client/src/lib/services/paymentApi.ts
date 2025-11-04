// lib/services/paymentApi.ts
import { baseApi } from './baseApi';

export interface CreateCheckoutSessionRequest {
  successUrl: string;
  cancelUrl: string;
  shippingAddress: {
    country: string;
  };
}

export interface CheckoutSessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    url: string;
    amount: number;
  };
  message: string;
}

export interface SupportedCountry {
  code: string;
  name: string;
  currency: string;
  symbol: string;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation<CheckoutSessionResponse, CreateCheckoutSessionRequest>({
      query: (data) => ({
        url: '/payments/create-checkout-session',
        method: 'POST',
        body: data,
      }),
    }),

    getSupportedCountries: builder.query<{ success: boolean; data: SupportedCountry[] }, void>({
      query: () => '/payments/supported-countries',
    }),

    createPaymentIntent: builder.mutation<{ success: boolean; data: any }, { amount: number; currency?: string }>({
      query: (data) => ({
        url: '/payments/create-payment-intent',
        method: 'POST',
        body: data,
      }),
    }),

    verifyPayment: builder.mutation<{ success: boolean; data: any }, { paymentIntentId: string }>({
      query: (data) => ({
        url: '/payments/verify-payment',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetSupportedCountriesQuery,
  useCreatePaymentIntentMutation,
  useVerifyPaymentMutation,
} = paymentApi;
