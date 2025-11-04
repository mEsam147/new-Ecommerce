// lib/hooks/useStripePayment.ts - FIXED VERSION
import { useState, useCallback, useRef } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from './useToast';
import { useCreateSetupIntentMutation, useAddPaymentMethodMutation } from '@/lib/services/stripeApi';

export const useStripePayment = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { success, error: toastError } = useToast();

  const [createSetupIntent, { isLoading: isCreatingSetupIntent }] = useCreateSetupIntentMutation();
  const [addPaymentMethod, { isLoading: isAddingPaymentMethod }] = useAddPaymentMethodMutation();

  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const setupIntentCreated = useRef(false);

  // Create setup intent for adding payment method
  const createPaymentSetup = useCallback(async (metadata = {}) => {
    if (setupIntentCreated.current) {
      return { success: true, clientSecret };
    }

    try {
      const result = await createSetupIntent({ metadata }).unwrap();
      setClientSecret(result.data.clientSecret);
      setupIntentCreated.current = true;
      return { success: true, clientSecret: result.data.clientSecret };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to create payment setup';
      toastError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [createSetupIntent, toastError, clientSecret]);

  // Reset setup intent
  const resetSetupIntent = useCallback(() => {
    setClientSecret('');
    setupIntentCreated.current = false;
  }, []);

  return {
    // State
    clientSecret,
    isProcessing,
    isCreatingSetupIntent,
    isAddingPaymentMethod,

    // Actions
    createPaymentSetup,
    resetSetupIntent,
  };
};
