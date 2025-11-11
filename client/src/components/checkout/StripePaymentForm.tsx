// components/checkout/StripePaymentForm.tsx - UPDATED SUCCESS HANDLING
'use client';

import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, CreditCard, Shield } from 'lucide-react';
import { useCreatePaymentIntentMutation } from '@/lib/services/paymentApi';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/hooks/useAuth';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
  isProcessing: boolean;
  agreeToTerms:boolean;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  onSuccess,
  onError,
  isProcessing,
  agreeToTerms
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { success, error: toastError } = useToast();

  const [createPaymentIntent, { isLoading: isCreatingIntent }] = useCreatePaymentIntentMutation();

  const [clientSecret, setClientSecret] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const {user  , isAuthenticated} = useAuth()

  // Create payment intent when component mounts
  useEffect(() => {
    if (amount > 0 && !clientSecret && stripe) {
      createPaymentIntentHandler();
    }
  }, [amount, stripe]);

  const createPaymentIntentHandler = async () => {
    try {
      setError('');
      console.log('🔄 Creating payment intent for amount:', amount);

      const result = await createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
      }).unwrap();

      console.log('✅ Payment intent created:', result);

      if (result.success && result.data.clientSecret) {
        setClientSecret(result.data.clientSecret);
      } else {
        throw new Error(result.message || 'Failed to create payment intent');
      }
    } catch (err: any) {
      console.error('❌ Error creating payment intent:', err);
      const errorMessage = err?.data?.message || err.message || 'Failed to initialize payment';
      setError(errorMessage);
      toastError(errorMessage);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system not ready. Please try again.');
      return;
    }

    if (!clientSecret) {
      setError('Payment not initialized. Please refresh the page.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      console.log('🔄 Confirming card payment...');

        const userName = isAuthenticated
        ? user?.name || `${user?.firstName} ${user?.lastName}`.trim() || 'Customer'
        : `${guestShippingInfo?.firstName} ${guestShippingInfo?.lastName}`.trim() || 'Customer';

      const userEmail = isAuthenticated
        ? user?.email
        : guestShippingInfo?.email;


      // Step 1: Confirm card payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
           name: userName,
            email: userEmail,
          },
        },
      });

      if (stripeError) {
        console.error('❌ Stripe payment error:', stripeError);
        throw new Error(stripeError.message || 'Payment failed');
      }

      console.log('✅ Stripe payment confirmed:', paymentIntent);

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Step 2: Payment successful - prepare data
        const successData = {
          paymentIntentId: paymentIntent.id,
          paymentMethodId: paymentIntent.payment_method,
          clientSecret: paymentIntent.client_secret,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          // Add order creation data
          paymentResult: {
            id: paymentIntent.id,
            status: 'succeeded',
            update_time: new Date().toISOString(),
            email_address: 'customer@example.com',
          }
        };

        console.log('💰 Payment success data:', successData);

        // Step 3: Update UI state
        setPaymentCompleted(true);
        setPaymentData(successData);
        success('Payment completed successfully!');

        // Step 4: IMPORTANT - Call onSuccess after a brief delay to show success state
        console.log('🎯 Calling onSuccess callback...');
        setTimeout(() => {
          onSuccess(successData);
        }, 2000); // 2 second delay to show success message

      } else {
        throw new Error(`Payment status: ${paymentIntent?.status}`);
      }
    } catch (err: any) {
      console.error('❌ Payment processing error:', err);
      const errorMessage = err.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      toastError(errorMessage);
      onError(err);
      setIsSubmitting(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '10px 12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  // Show loading state while creating payment intent
  if (isCreatingIntent) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Initializing Secure Payment</p>
          <p className="text-gray-600">Setting up payment gateway...</p>
        </div>
      </div>
    );
  }

  // Show success state after payment
  if (paymentCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-6 bg-green-50 rounded-lg border border-green-200">
        <CheckCircle className="w-16 h-16 text-green-600" />
        <div className="text-center">
          <p className="text-2xl font-bold text-green-900 mb-2">Payment Successful!</p>
          <p className="text-green-700 text-lg">Completing your order...</p>
          <p className="text-green-600 text-sm mt-2">You will be redirected shortly</p>
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-800">
          <CreditCard className="w-5 h-5" />
          <span className="font-semibold">Secure Payment</span>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Your payment information is encrypted and secure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Card Information</label>
          <div className="border border-gray-300 rounded-lg p-3 bg-white hover:border-gray-400 transition-colors">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-600" />
          <span>Your payment is secure and encrypted</span>
        </div>

        <Button
          type="submit"
          disabled={!stripe || !clientSecret || isSubmitting || isProcessing || !agreeToTerms}
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500">
        <p>We accept:</p>
        <div className="flex justify-center space-x-4 mt-2">
          <span className="text-gray-700">Visa</span>
          <span className="text-gray-700">Mastercard</span>
          <span className="text-gray-700">American Express</span>
          <span className="text-gray-700">Discover</span>
        </div>
      </div>
    </div>
  );
};
