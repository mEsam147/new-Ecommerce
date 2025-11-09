// lib/hooks/useAdminOrders.ts
import { useState, useCallback } from 'react';
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useGetOrderAnalyticsQuery,
  useBulkUpdateOrdersMutation,
} from '@/lib/services/ordersApi';

export const useAdminOrders = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    search: '',
    status: '',
    startDate: '',
    endDate: '',
    sort: 'createdAt',
    order: 'desc',
  });

  // Queries
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetOrdersQuery(filters);

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useGetOrderAnalyticsQuery({ period: '30days' });

  // Mutations
  const [updateOrderStatus, { isLoading: updatingStatus }] = useUpdateOrderStatusMutation();
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const [bulkUpdateOrders, { isLoading: bulkUpdating }] = useBulkUpdateOrdersMutation();

  // Handlers
  const handleUpdateOrderStatus = useCallback(async (id: string, status: string) => {
    try {
      const result = await updateOrderStatus({ id, status }).unwrap();
      await refetchOrders();
      return result;
    } catch (error) {
      throw error;
    }
  }, [updateOrderStatus, refetchOrders]);

  const handleCancelOrder = useCallback(async (id: string) => {
    try {
      const result = await cancelOrder(id).unwrap();
      await refetchOrders();
      return result;
    } catch (error) {
      throw error;
    }
  }, [cancelOrder, refetchOrders]);

  const handleBulkUpdateOrders = useCallback(async (orderIds: string[], status: string) => {
    try {
      const result = await bulkUpdateOrders({ orderIds, status }).unwrap();
      await refetchOrders();
      return result;
    } catch (error) {
      throw error;
    }
  }, [bulkUpdateOrders, refetchOrders]);

  return {
    // State
    filters,
    setFilters,

    // Data
    orders: ordersData?.data || [],
    pagination: ordersData?.pagination,
    analytics: analyticsData?.data,

    // Loading states
    loading: ordersLoading,
    updatingStatus,
    cancelling,
    bulkUpdating,
    analyticsLoading,

    // Errors
    error: ordersError,

    // Actions
    updateOrderStatus: handleUpdateOrderStatus,
    cancelOrder: handleCancelOrder,
    bulkUpdateOrders: handleBulkUpdateOrders,
    refetchOrders,
  };
};
