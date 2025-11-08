// lib/services/billingApi.ts
import { baseApi } from './baseApi';

export interface Payment {
  _id: string;
  order: {
    _id: string;
    orderNumber: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  paymentMethod: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  captureMethod: string;
  refunds: Array<{
    refundId: string;
    amount: number;
    reason: string;
    status: string;
    createdAt: string;
  }>;
  receiptUrl?: string;
  billingDetails?: {
    name: string;
    email: string;
    phone?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface BillingStats {
  totalSpent: number;
  totalOrders: number;
  successfulPayments: number;
  failedPayments: number;
  refundedAmount: number;
  averageOrderValue: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  isDefault: boolean;
}

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's payment history
    getPaymentHistory: builder.query<{ success: boolean; data: { payments: Payment[] } }, { page?: number; limit?: number }>({
      query: (params = {}) => ({
        url: '/billing/payments',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
        },
      }),
      providesTags: ['Billing'],
    }),

    // Get billing statistics
    getBillingStats: builder.query<{ success: boolean; data: BillingStats }, void>({
      query: () => '/billing/stats',
      providesTags: ['Billing'],
    }),

    // Get payment methods
    getPaymentMethods: builder.query<{ success: boolean; data: { paymentMethods: PaymentMethod[] } }, void>({
      query: () => '/billing/payment-methods',
      providesTags: ['PaymentMethods'],
    }),

    // Request refund
    requestRefund: builder.mutation<{ success: boolean; message: string }, { paymentId: string; reason: string }>({
      query: ({ paymentId, reason }) => ({
        url: `/billing/payments/${paymentId}/refund`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Billing'],
    }),

    // Download invoice
    downloadInvoice: builder.mutation<{ success: boolean; data: { url: string } }, string>({
      query: (paymentId) => ({
        url: `/billing/payments/${paymentId}/invoice`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetPaymentHistoryQuery,
  useGetBillingStatsQuery,
  useGetPaymentMethodsQuery,
  useRequestRefundMutation,
  useDownloadInvoiceMutation,
} = billingApi;
