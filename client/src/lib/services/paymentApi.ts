// lib/services/paymentApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// الحصول على عنوان الـ API من environment variable
const getBaseUrl = () => {
  // في development/production استخدم المتغير البيئي
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (data) => ({
        url: '/payments/create-checkout-session',
        method: 'POST',
        body: data,
      }),
    }),
    getSessionStatus: builder.query({
      query: ({ sessionId }) => `/payments/session/${sessionId}`,
    }),
    getSupportedCountries: builder.query({
      query: () => '/payments/supported-countries',
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetSessionStatusQuery,
  useGetSupportedCountriesQuery,
} = paymentApi;
