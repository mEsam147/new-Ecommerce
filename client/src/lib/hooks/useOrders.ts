// lib/hooks/useOrders.ts
import { useCallback } from 'react';
import {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation
} from '@/lib/services/ordersApi';
import { useToast } from './useToast';

export interface OrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  itemsCount: number;
  trackingNumber?: string;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  shippingMethod: string;
}

export const useOrders = () => {
  const { success, error } = useToast();

  // Mutations
  const [createOrderMutation, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [updateOrderStatusMutation, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [cancelOrderMutation, { isLoading: isCancellingOrder }] = useCancelOrderMutation();

  // Queries
  const {
    data: ordersResponse,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
    error: ordersError
  } = useGetOrdersQuery();

  const getOrderQuery = useGetOrderQuery;

  // Transform the API response to match the Order model
  const transformOrders = (ordersData: any): OrderSummary[] => {
    if (!ordersData?.data) return [];

    const orders = Array.isArray(ordersData.data) ? ordersData.data : ordersData.data.orders || [];

    return orders.map((order: any) => ({
      id: order._id || order.id,
      orderNumber: order.orderNumber || `ORD-${order._id?.slice(-8)?.toUpperCase()}`,
      createdAt: order.createdAt || order.date,
      status: order.status || 'pending',
      totalPrice: order.pricing?.totalPrice || order.total || 0,
      itemsCount: order.items?.length || 0,
      trackingNumber: order.shipping?.trackingNumber,
      isPaid: order.isPaid || false,
      paidAt: order.paidAt,
      isDelivered: order.isDelivered || false,
      deliveredAt: order.deliveredAt,
      shippingMethod: order.shipping?.method || 'standard'
    }));
  };

  const orders = transformOrders(ordersResponse);

  // Create order
  const createOrder = useCallback(async (orderData: any) => {
    try {
      const result = await createOrderMutation(orderData).unwrap();
      success(result.message || 'Order created successfully');
      return { success: true, data: result.data };
    } catch (err: any) {
      console.error('Order creation error:', err);
      const errorMessage = err?.data?.message || err?.error || 'Failed to create order';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [createOrderMutation, success, error]);

  // Update order status
  const updateOrderStatus = useCallback(async (id: string, status: string, notes?: string) => {
    try {
      const result = await updateOrderStatusMutation({ id, status, notes }).unwrap();
      success(result.message || 'Order status updated successfully');
      return { success: true, data: result.data };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to update order status';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [updateOrderStatusMutation, success, error]);

  // Cancel order
  const cancelOrder = useCallback(async (id: string, reason: string) => {
    try {
      const result = await cancelOrderMutation({ id, reason }).unwrap();

      // Refetch orders to get updated list
      await refetchOrders();

      success(result.message || 'Order cancelled successfully');
      return { success: true, data: result.data };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to cancel order';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [cancelOrderMutation, refetchOrders, success, error]);

  // Get orders summary statistics
  const getOrdersSummary = useCallback(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pendingOrders = statusCounts.pending || 0;
    const deliveredOrders = statusCounts.delivered || 0;

    return {
      totalOrders,
      totalSpent,
      pendingOrders,
      deliveredOrders,
      statusCounts
    };
  }, [orders]);

  return {
    // Data
    orders,
    ordersSummary: getOrdersSummary(),
    ordersData: ordersResponse,

    // Loading states
    isCreatingOrder,
    isLoadingOrders,
    isUpdatingStatus,
    isCancellingOrder,

    // Actions
    createOrder,
    updateOrderStatus,
    cancelOrder,
    refetchOrders,
    getOrderQuery,

    // Errors
    ordersError,
  };
};
