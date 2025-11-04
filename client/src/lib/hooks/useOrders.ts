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
import { CreateOrderRequest, Order } from '@/lib/services/ordersApi';

export const useOrders = () => {
  const { success, error } = useToast();

  // Mutations
  const [createOrderMutation, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [updateOrderStatusMutation, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [cancelOrderMutation, { isLoading: isCancellingOrder }] = useCancelOrderMutation();

  // Queries
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
    error: ordersError
  } = useGetOrdersQuery();

  const getOrderQuery = useGetOrderQuery;

  const orders = ordersData?.data || [];

  // Create order
  const createOrder = useCallback(async (orderData: CreateOrderRequest) => {
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
      success(result.message || 'Order cancelled successfully');
      return { success: true, data: result.data };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to cancel order';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [cancelOrderMutation, success, error]);

  return {
    // Data
    orders,
    ordersData,

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
