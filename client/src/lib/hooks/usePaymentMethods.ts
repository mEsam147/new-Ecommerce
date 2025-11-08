// import { useState, useCallback } from 'react';
// import {
//   useGetPaymentMethodsQuery,
//   useCreateSetupIntentMutation,
//   useAddPaymentMethodMutation,
//   useSetDefaultPaymentMethodMutation,
//   useDeletePaymentMethodMutation,
// } from '@/lib/services/paymentMethodsApi';
// import { useToast } from './useToast';

// export const usePaymentMethods = () => {
//   const { success, error: toastError } = useToast();

//   // RTK Query hooks
//   const {
//     data: paymentMethodsData,
//     isLoading: isLoadingPaymentMethods,
//     error: paymentMethodsError,
//     refetch: refetchPaymentMethods,
//   } = useGetPaymentMethodsQuery();

//   const [createSetupIntent, { isLoading: isCreatingSetupIntent }] = useCreateSetupIntentMutation();
//   const [addPaymentMethod, { isLoading: isAddingPaymentMethod }] = useAddPaymentMethodMutation();
//   const [setDefaultPaymentMethod, { isLoading: isSettingDefault }] = useSetDefaultPaymentMethodMutation();
//   const [deletePaymentMethod, { isLoading: isDeletingPaymentMethod }] = useDeletePaymentMethodMutation();

//   const [stripeError, setStripeError] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   // Get payment methods
//   const paymentMethods = paymentMethodsData?.data || [];

//   // Create setup intent
//   const handleCreateSetupIntent = useCallback(async () => {
//     try {
//       setStripeError(null);
//       const result = await createSetupIntent().unwrap();
//       return result.data;
//     } catch (error: any) {
//       const errorMessage = error?.data?.error || 'Failed to create setup intent';
//       setStripeError(errorMessage);
//       toastError(errorMessage);
//       throw error;
//     }
//   }, [createSetupIntent, toastError]);

//   // Add payment method
//   const handleAddPaymentMethod = useCallback(async (paymentMethodId: string, isDefault: boolean = false, type: 'card' | 'paypal' | 'apple_pay' = 'card') => {
//     try {
//       setStripeError(null);
//       setIsProcessing(true);

//       const result = await addPaymentMethod({
//         paymentMethodId,
//         isDefault,
//         type
//       }).unwrap();

//       success('Payment method added successfully');
//       await refetchPaymentMethods(); // Refresh the list

//       return result.data;
//     } catch (error: any) {
//       const errorMessage = error?.data?.error || 'Failed to add payment method';
//       setStripeError(errorMessage);
//       toastError(errorMessage);
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [addPaymentMethod, success, toastError, refetchPaymentMethods]);

//   // Add card payment method using Stripe
//   const handleAddCardPaymentMethod = useCallback(async (isDefault: boolean = false) => {
//     try {
//       setIsProcessing(true);
//       setStripeError(null);

//       // Create setup intent first
//       const { clientSecret, setupIntentId } = await handleCreateSetupIntent();

//       // In a real implementation, you would use Stripe Elements here
//       // For now, we'll simulate the process
//       const mockPaymentMethodId = `pm_${Date.now()}_card`;

//       const result = await handleAddPaymentMethod(mockPaymentMethodId, isDefault, 'card');
//       return result;
//     } catch (error: any) {
//       const errorMessage = error.message || 'Failed to add card';
//       setStripeError(errorMessage);
//       toastError(errorMessage);
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [handleCreateSetupIntent, handleAddPaymentMethod, toastError]);

//   // Add PayPal payment method
//   const handleAddPayPalPaymentMethod = useCallback(async (isDefault: boolean = false) => {
//     try {
//       setIsProcessing(true);
//       setStripeError(null);

//       // Simulate PayPal integration
//       const mockPaymentMethodId = `pm_${Date.now()}_paypal`;

//       const result = await handleAddPaymentMethod(mockPaymentMethodId, isDefault, 'paypal');
//       return result;
//     } catch (error: any) {
//       const errorMessage = error.message || 'Failed to add PayPal';
//       setStripeError(errorMessage);
//       toastError(errorMessage);
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [handleAddPaymentMethod, toastError]);

//   // Add Apple Pay payment method
//   const handleAddApplePayPaymentMethod = useCallback(async (isDefault: boolean = false) => {
//     try {
//       setIsProcessing(true);
//       setStripeError(null);

//       // Check if Apple Pay is available
//       if (typeof window !== 'undefined' && !window?.ApplePaySession?.canMakePayments?.()) {
//         throw new Error('Apple Pay is not available on this device');
//       }

//       // Simulate Apple Pay integration
//       const mockPaymentMethodId = `pm_${Date.now()}_apple_pay`;

//       const result = await handleAddPaymentMethod(mockPaymentMethodId, isDefault, 'apple_pay');
//       return result;
//     } catch (error: any) {
//       const errorMessage = error.message || 'Failed to add Apple Pay';
//       setStripeError(errorMessage);
//       toastError(errorMessage);
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [handleAddPaymentMethod, toastError]);

//   // Set default payment method
//   const handleSetDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
//     try {
//       await setDefaultPaymentMethod(paymentMethodId).unwrap();
//       await refetchPaymentMethods(); // Refresh to get updated default status
//       success('Default payment method updated');
//     } catch (error: any) {
//       const errorMessage = error?.data?.error || 'Failed to set default payment method';
//       toastError(errorMessage);
//       throw error;
//     }
//   }, [setDefaultPaymentMethod, toastError, success, refetchPaymentMethods]);

//   // Delete payment method
//   const handleDeletePaymentMethod = useCallback(async (paymentMethodId: string) => {
//     try {
//       await deletePaymentMethod(paymentMethodId).unwrap();
//       await refetchPaymentMethods(); // Refresh the list after deletion
//       success('Payment method deleted successfully');
//     } catch (error: any) {
//       const errorMessage = error?.data?.error || 'Failed to delete payment method';
//       toastError(errorMessage);
//       throw error;
//     }
//   }, [deletePaymentMethod, toastError, success, refetchPaymentMethods]);

//   // Check if any operation is loading
//   const isLoading = isLoadingPaymentMethods || isCreatingSetupIntent || isAddingPaymentMethod || isSettingDefault || isDeletingPaymentMethod || isProcessing;

//   return {
//     // Data
//     paymentMethods,

//     // Loading states
//     isLoading,
//     isLoadingPaymentMethods,
//     isCreatingSetupIntent,
//     isAddingPaymentMethod,
//     isSettingDefault,
//     isDeletingPaymentMethod,
//     isProcessing,

//     // Errors
//     error: paymentMethodsError || stripeError,
//     stripeError,

//     // Actions
//     refetchPaymentMethods,
//     createSetupIntent: handleCreateSetupIntent,
//     addPaymentMethod: handleAddPaymentMethod,
//     addCardPaymentMethod: handleAddCardPaymentMethod,
//     addPayPalPaymentMethod: handleAddPayPalPaymentMethod,
//     addApplePayPaymentMethod: handleAddApplePayPaymentMethod,
//     setDefaultPaymentMethod: handleSetDefaultPaymentMethod,
//     deletePaymentMethod: handleDeletePaymentMethod,

//     // Helper computed values
//     hasPaymentMethods: paymentMethods.length > 0,
//     defaultPaymentMethod: paymentMethods.find(method => method.isDefault),
//     cardPaymentMethods: paymentMethods.filter(method => method.type === 'card'),
//     paypalPaymentMethods: paymentMethods.filter(method => method.type === 'paypal'),
//     applePayPaymentMethods: paymentMethods.filter(method => method.type === 'apple_pay'),

//     // Statistics
//     totalPaymentMethods: paymentMethods.length,
//     cardCount: paymentMethods.filter(method => method.type === 'card').length,
//     paypalCount: paymentMethods.filter(method => method.type === 'paypal').length,
//     applePayCount: paymentMethods.filter(method => method.type === 'apple_pay').length,
//   };
// };

// lib/hooks/usePaymentMethods.ts
import { useCallback, useState } from 'react';
import {
  useGetPaymentMethodsQuery,
  useCreateSetupIntentMutation,
  useAddPaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
  useRemovePaymentMethodMutation,
} from '@/lib/services/paymentMethodsApi';
import { useToast } from './useToast';

export const usePaymentMethods = () => {
  const { success, error } = useToast();
  const [addMethodModalOpen, setAddMethodModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<{ id: string; last4?: string } | null>(null);

  // Queries
  const {
    data: paymentMethodsResponse,
    isLoading: isLoadingPaymentMethods,
    error: paymentMethodsError,
    refetch: refetchPaymentMethods,
  } = useGetPaymentMethodsQuery();

  // Mutations
  const [createSetupIntentMutation, { isLoading: isCreatingSetupIntent }] = useCreateSetupIntentMutation();
  const [addPaymentMethodMutation, { isLoading: isAddingPaymentMethod }] = useAddPaymentMethodMutation();
  const [setDefaultPaymentMethodMutation, { isLoading: isSettingDefault }] = useSetDefaultPaymentMethodMutation();
  const [removePaymentMethodMutation, { isLoading: isRemovingPaymentMethod }] = useRemovePaymentMethodMutation();

  const paymentMethods = paymentMethodsResponse?.data?.paymentMethods || [];

  // Create setup intent
  const createSetupIntent = useCallback(async () => {
    try {
      const result = await createSetupIntentMutation().unwrap();
      return { success: true, data: result.data };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to create setup intent';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [createSetupIntentMutation, error]);

  // Add payment method
  const addPaymentMethod = useCallback(async (paymentMethodId: string, type: string) => {
    try {
      const result = await addPaymentMethodMutation({ paymentMethodId, type }).unwrap();
      success('Payment method added successfully');
      setAddMethodModalOpen(false);
      return { success: true, data: result.data };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to add payment method';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [addPaymentMethodMutation, success, error]);

  // Set default payment method
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      const result = await setDefaultPaymentMethodMutation(paymentMethodId).unwrap();
      success(result.message || 'Default payment method updated');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to set default payment method';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [setDefaultPaymentMethodMutation, success, error]);

  // Remove payment method
  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      const result = await removePaymentMethodMutation(paymentMethodId).unwrap();
      success(result.message || 'Payment method removed');
      setDeleteModalOpen(false);
      setMethodToDelete(null);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to remove payment method';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [removePaymentMethodMutation, success, error]);

  // Handle delete confirmation
  const handleDeleteClick = (methodId: string, last4?: string) => {
    setMethodToDelete({ id: methodId, last4 });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (methodToDelete) {
      await removePaymentMethod(methodToDelete.id);
    }
  };

  return {
    // Data
    paymentMethods,

    // Loading states
    isLoading: isLoadingPaymentMethods,
    isCreatingSetupIntent,
    isAddingPaymentMethod,
    isSettingDefault,
    isRemovingPaymentMethod,

    // Actions
    createSetupIntent,
    addPaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    refetchPaymentMethods,

    // Modal states
    addMethodModalOpen,
    setAddMethodModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    methodToDelete,
    handleDeleteClick,
    handleConfirmDelete,

    // Errors
    paymentMethodsError,
  };
};
