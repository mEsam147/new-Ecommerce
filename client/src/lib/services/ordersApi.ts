// // lib/services/ordersApi.ts
// import { baseApi } from './baseApi';

// export interface OrderItem {
//   _id: string;
//   product: string;
//   variant: {
//     size: string;
//     color: string;
//   };
//   name: string;
//   image: string;
//   price: number;
//   quantity: number;
//   totalPrice: number;
// }

// export interface Order {
//   _id: string;
//   orderNumber: string;
//   user: string;
//   items: OrderItem[];
//   shippingAddress: {
//     name: string;
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
//     phone: string;
//   };
//   billingAddress?: {
//     name: string;
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
//   };
//   contactInfo: {
//     email: string;
//     phone?: string;
//   };
//   paymentMethod: string;
//   paymentResult?: {
//     id: string;
//     status: string;
//     update_time: string;
//     email_address: string;
//   };
//   pricing: {
//     itemsPrice: number;
//     shippingPrice: number;
//     taxPrice: number;
//     discountAmount: number;
//     totalPrice: number;
//   };
//   coupon?: {
//     code: string;
//     discountType: string;
//     discountValue: number;
//     discountAmount: number;
//   };
//   shipping: {
//     method: string;
//     carrier?: string;
//     trackingNumber?: string;
//     estimatedDelivery?: string;
//     shippedAt?: string;
//   };
//   status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
//   isPaid: boolean;
//   paidAt?: string;
//   isDelivered: boolean;
//   deliveredAt?: string;
//   notes?: string;
//   cancellationReason?: string;
//   refundAmount?: number;
//   refundedAt?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export const ordersApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getOrders: builder.query<{ success: boolean; data: Order[]; pagination: any }, { page?: number; limit?: number }>({
//       query: ({ page = 1, limit = 10 } = {}) => `/orders?page=${page}&limit=${limit}`,
//       providesTags: ['Order'],
//     }),

//     getOrder: builder.query<{ success: boolean; data: Order }, string>({
//       query: (id) => `/orders/${id}`,
//       providesTags: (result, error, id) => [{ type: 'Order', id }],
//     }),

//     createOrder: builder.mutation<{ success: boolean; data: Order; message: string }, any>({
//       query: (orderData) => ({
//         url: '/orders',
//         method: 'POST',
//         body: orderData,
//       }),
//       invalidatesTags: ['Order', 'Cart'],
//     }),

//     updateOrderStatus: builder.mutation<{ success: boolean; data: Order; message: string }, { id: string; status: string; notes?: string }>({
//       query: ({ id, status, notes }) => ({
//         url: `/orders/${id}/status`,
//         method: 'PUT',
//         body: { status, notes },
//       }),
//       invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
//     }),

//     cancelOrder: builder.mutation<{ success: boolean; data: Order; message: string }, { id: string; reason: string }>({
//       query: ({ id, reason }) => ({
//         url: `/orders/${id}/cancel`,
//         method: 'PUT',
//         body: { reason },
//       }),
//       invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
//     }),

//     getOrderStats: builder.query<{ success: boolean; data: any }, { period?: string }>({
//       query: ({ period = '30days' } = {}) => `/orders/stats?period=${period}`,
//       providesTags: ['Order'],
//     }),

//     // Admin only
//     getAllOrders: builder.query<{ success: boolean; data: Order[]; pagination: any }, { page?: number; limit?: number; filters?: any }>({
//       query: ({ page = 1, limit = 10, filters = {} } = {}) => {
//         const params = new URLSearchParams({
//           page: page.toString(),
//           limit: limit.toString(),
//         });

//         Object.entries(filters).forEach(([key, value]) => {
//           if (value) params.append(key, value.toString());
//         });

//         return `/orders/admin/all?${params.toString()}`;
//       },
//       providesTags: ['Order'],
//     }),
//   }),
// });

// export const {
//   useGetOrdersQuery,
//   useLazyGetOrdersQuery,
//   useGetOrderQuery,
//   useCreateOrderMutation,
//   useUpdateOrderStatusMutation,
//   useCancelOrderMutation,
//   useGetOrderStatsQuery,
//   useGetAllOrdersQuery,
//   useLazyGetAllOrdersQuery,
// } = ordersApi;

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
  status: string;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<{ success: boolean; data: Order; message: string }, CreateOrderRequest>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),

    getOrders: builder.query<{ success: boolean; data: Order[]; pagination: any }, void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),

    getOrder: builder.query<{ success: boolean; data: Order }, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    updateOrderStatus: builder.mutation<{ success: boolean; data: Order; message: string }, { id: string; status: string; notes?: string }>({
      query: ({ id, ...updateData }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),

    cancelOrder: builder.mutation<{ success: boolean; data: Order; message: string }, { id: string; reason: string }>({
      query: ({ id, ...cancelData }) => ({
        url: `/orders/${id}/cancel`,
        method: 'PUT',
        body: cancelData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} = ordersApi;
