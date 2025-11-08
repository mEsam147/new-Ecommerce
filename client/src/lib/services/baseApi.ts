

// lib/services/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/store';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    credentials:"include",

  }),
  tagTypes: [
    'Auth',
    'User',
    'Cart',
    'Review',
    'Wishlist',
    'Product',
    'Category',
    'Order',
    'Reviews',
    'Billing',
    'Profile',
    'PaymentMethods',
    'Address',
    'Coupon',
    'Brand',
    'Analytics',
    'PaymentMethod',
    'Search'
  ],
  endpoints: () => ({}),
});
