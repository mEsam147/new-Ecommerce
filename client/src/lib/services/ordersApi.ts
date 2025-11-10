// lib/services/ordersApi.ts
import { baseApi } from './baseApi';

export interface OrderItem {
  product: string;
  variant?: {
    size?: string;
    color?: string;
  };
  name: string;
  image: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  phone?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
}

export interface Pricing {
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  discountAmount: number;
  totalPrice: number;
}

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: string;
  couponCode?: string;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  contactInfo: ContactInfo;
  paymentMethod: string;
  paymentResult?: any;
  pricing: Pricing;
  coupon?: any;
  shipping: {
    method: string;
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    shippedAt?: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  notes?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create order - matches POST /orders
    createOrder: builder.mutation<{ success: boolean; data: Order; message: string }, CreateOrderRequest>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),

    // Get user orders - matches GET /orders/my-orders
    getOrders: builder.query<{ success: boolean; data: Order[]; pagination: any }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => `/orders/my-orders?page=${page}&limit=${limit}`,
      providesTags: ['Order'],
    }),

    // Get specific order - matches GET /orders/:id
    getOrder: builder.query<{ success: boolean; data: Order }, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // Get order invoice - matches GET /orders/:id/invoice
    getOrderInvoice: builder.query<{ success: boolean; data: any }, string>({
      query: (id) => `/orders/${id}/invoice`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // Track order - matches GET /orders/:id/track
    trackOrder: builder.query<{ success: boolean; data: any }, string>({
      query: (id) => `/orders/${id}/track`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // Cancel order - matches PUT /orders/:id/cancel
    cancelOrder: builder.mutation<{ success: boolean; data: Order; message: string }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),

    // Request return - matches POST /orders/:id/return
    requestReturn: builder.mutation<{ success: boolean; data: Order; message: string }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/return`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),

    // ===== ADMIN ENDPOINTS =====

    // Get all orders (admin) - matches GET /orders/admin/all
    getAllOrders: builder.query<{ success: boolean; data: Order[]; pagination: any }, {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    }>({
      query: ({ page = 1, limit = 10, status, search } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (status) params.append('status', status);
        if (search) params.append('search', search);

        return `/orders/admin/all?${params.toString()}`;
      },
      providesTags: ['Order'],
    }),

    // Get order stats (admin) - matches GET /orders/admin/stats
    getOrderStats: builder.query<{ success: boolean; data: any }, { period?: string }>({
      query: ({ period = '30days' } = {}) => `/orders/admin/stats?period=${period}`,
      providesTags: ['Order'],
    }),

    // Update order status (admin) - matches PUT /orders/admin/:id/status
    updateOrderStatus: builder.mutation<{ success: boolean; data: Order; message: string }, {
      id: string;
      status: string;
      notes?: string;
      trackingNumber?: string;
      carrier?: string;
    }>({
      query: ({ id, ...updateData }) => ({
        url: `/orders/admin/${id}/status`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),

    // Update shipping info (admin) - matches PUT /orders/admin/:id/shipping
    updateShippingInfo: builder.mutation<{ success: boolean; data: Order; message: string }, {
      id: string;
      trackingNumber?: string;
      carrier?: string;
      estimatedDelivery?: string;
    }>({
      query: ({ id, ...shippingData }) => ({
        url: `/orders/admin/${id}/shipping`,
        method: 'PUT',
        body: shippingData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),

    // Process refund (admin) - matches POST /orders/admin/:id/refund
    processRefund: builder.mutation<{ success: boolean; data: Order; message: string }, {
      id: string;
      refundAmount: number;
      reason?: string;
    }>({
      query: ({ id, ...refundData }) => ({
        url: `/orders/admin/${id}/refund`,
        method: 'POST',
        body: refundData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),
  }),
});

export const {
  // User endpoints
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetOrderInvoiceQuery,
  useTrackOrderQuery,
  useCancelOrderMutation,
  useRequestReturnMutation,

  // Admin endpoints
  useGetAllOrdersQuery,
  useGetOrderStatsQuery,
  useUpdateOrderStatusMutation,
  useUpdateShippingInfoMutation,
  useProcessRefundMutation,
} = ordersApi;
