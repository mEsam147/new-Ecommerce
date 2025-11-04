// lib/services/analyticsApi.ts
import { baseApi } from './baseApi';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<{ success: boolean; data: any }, { period?: string }>({
      query: ({ period = '30days' } = {}) => `/analytics/dashboard?period=${period}`,
      providesTags: ['Analytics'],
    }),

    getSalesAnalytics: builder.query<{ success: boolean; data: any }, { startDate?: string; endDate?: string; groupBy?: string }>({
      query: ({ startDate, endDate, groupBy = 'day' } = {}) => {
        const params = new URLSearchParams({ groupBy });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return `/analytics/sales?${params.toString()}`;
      },
      providesTags: ['Analytics'],
    }),

    getProductAnalytics: builder.query<{ success: boolean; data: any }, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return `/analytics/products?${params.toString()}`;
      },
      providesTags: ['Analytics'],
    }),

    getCustomerAnalytics: builder.query<{ success: boolean; data: any }, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return `/analytics/customers?${params.toString()}`;
      },
      providesTags: ['Analytics'],
    }),

    getRealTimeAnalytics: builder.query<{ success: boolean; data: any }, void>({
      query: () => '/analytics/realtime',
      providesTags: ['Analytics'],
    }),

    exportAnalytics: builder.mutation<{ success: boolean; data: any; message: string }, { type: string; startDate?: string; endDate?: string }>({
      query: ({ type, startDate, endDate }) => {
        const params = new URLSearchParams({ type });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return `/analytics/export?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetSalesAnalyticsQuery,
  useGetProductAnalyticsQuery,
  useGetCustomerAnalyticsQuery,
  useGetRealTimeAnalyticsQuery,
  useExportAnalyticsMutation,
} = analyticsApi;
