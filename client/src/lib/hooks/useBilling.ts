// lib/hooks/useBilling.ts
import { useCallback } from 'react';
import {
  useGetPaymentHistoryQuery,
  useGetBillingStatsQuery,
  useGetPaymentMethodsQuery,
  useRequestRefundMutation,
  useDownloadInvoiceMutation,
} from '@/lib/services/billingApi';
import { useToast } from './useToast';

export const useBilling = (page: number = 1, limit: number = 10) => {
  const { success, error } = useToast();

  // Queries
  const {
    data: paymentsResponse,
    isLoading: isLoadingPayments,
    error: paymentsError,
    refetch: refetchPayments,
  } = useGetPaymentHistoryQuery({ page, limit });

  const { data: statsResponse, isLoading: isLoadingStats } = useGetBillingStatsQuery();
  const { data: paymentMethodsResponse, isLoading: isLoadingPaymentMethods } = useGetPaymentMethodsQuery();

  // Mutations
  const [requestRefundMutation, { isLoading: isRequestingRefund }] = useRequestRefundMutation();
  const [downloadInvoiceMutation, { isLoading: isDownloadingInvoice }] = useDownloadInvoiceMutation();

  const payments = paymentsResponse?.data?.payments || [];
  const stats = statsResponse?.data;
  const paymentMethods = paymentMethodsResponse?.data?.paymentMethods || [];

  // Request refund
  const requestRefund = useCallback(async (paymentId: string, reason: string) => {
    try {
      const result = await requestRefundMutation({ paymentId, reason }).unwrap();
      success(result.message || 'Refund requested successfully');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to request refund';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [requestRefundMutation, success, error]);

  // Download invoice
  const downloadInvoice = useCallback(async (paymentId: string) => {
    try {
      const result = await downloadInvoiceMutation(paymentId).unwrap();

      // Open the invoice URL in a new tab
      if (result.data?.url) {
        window.open(result.data.url, '_blank');
      }

      success('Invoice downloaded successfully');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to download invoice';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [downloadInvoiceMutation, success, error]);

  return {
    // Data
    payments,
    stats,
    paymentMethods,

    // Loading states
    isLoading: isLoadingPayments,
    isLoadingStats,
    isLoadingPaymentMethods,
    isRequestingRefund,
    isDownloadingInvoice,

    // Actions
    requestRefund,
    downloadInvoice,
    refetchPayments,

    // Errors
    paymentsError,
  };
};
