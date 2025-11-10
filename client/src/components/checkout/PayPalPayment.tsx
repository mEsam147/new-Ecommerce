// components/checkout/PayPalPayment.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface PayPalPaymentProps {
  amount: number;
  onSuccess: (paypalOrderId: string) => void;
  onError: (error: any) => void;
  isProcessing: boolean;
}

declare global {
  interface Window {
    paypal: any;
  }
}

export const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  amount,
  onSuccess,
  onError,
  isProcessing,
}) => {
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Load PayPal SDK
  useEffect(() => {
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    const loadPayPalSDK = () => {
      setIsInitializing(true);

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;

      script.onload = () => {
        setPaypalLoaded(true);
        setIsInitializing(false);
        console.log('✅ PayPal SDK loaded successfully');
      };

      script.onerror = () => {
        setPaypalError('Failed to load PayPal SDK');
        setIsInitializing(false);
        console.error('❌ Failed to load PayPal SDK');
      };

      document.head.appendChild(script);
    };

    loadPayPalSDK();
  }, []);

  // Initialize PayPal buttons
  useEffect(() => {
    if (!paypalLoaded || !window.paypal) return;

    try {
      // Clear existing buttons
      const buttonsContainer = document.getElementById('paypal-button-container');
      if (buttonsContainer) {
        buttonsContainer.innerHTML = '';
      }

      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },

        createOrder: async (data: any, actions: any) => {
          try {
            console.log('🔄 Creating PayPal order for amount:', amount);

            // Create order on your backend
            const response = await fetch('/api/payments/create-paypal-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount: amount.toFixed(2),
                currency: 'USD',
              }),
            });

            const orderData = await response.json();

            if (!orderData.success) {
              throw new Error(orderData.message || 'Failed to create PayPal order');
            }

            console.log('✅ PayPal order created:', orderData.data.id);
            return orderData.data.id;

          } catch (error: any) {
            console.error('❌ PayPal order creation failed:', error);
            setPaypalError(error.message || 'Failed to create PayPal order');
            onError(error);
            throw error;
          }
        },

        onApprove: async (data: any, actions: any) => {
          try {
            console.log('🔄 Approving PayPal order:', data.orderID);

            // Capture the order on your backend
            const response = await fetch('/api/payments/capture-paypal-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderID: data.orderID,
              }),
            });

            const captureData = await response.json();

            if (!captureData.success) {
              throw new Error(captureData.message || 'Failed to capture PayPal payment');
            }

            console.log('✅ PayPal payment captured:', captureData.data);
            onSuccess(data.orderID);

          } catch (error: any) {
            console.error('❌ PayPal payment capture failed:', error);
            setPaypalError(error.message || 'Failed to process PayPal payment');
            onError(error);
          }
        },

        onError: (err: any) => {
          console.error('❌ PayPal button error:', err);
          setPaypalError('An error occurred with PayPal. Please try another payment method.');
          onError(err);
        },

        onCancel: (data: any) => {
          console.log('🚫 PayPal payment cancelled by user');
          setPaypalError('Payment was cancelled. You can try again or use another payment method.');
        },

      }).render('#paypal-button-container');

    } catch (error) {
      console.error('❌ PayPal initialization error:', error);
      setPaypalError('Failed to initialize PayPal. Please try another payment method.');
    }
  }, [paypalLoaded, amount, onSuccess, onError]);

  // Manual PayPal order creation (fallback)
  const handleManualPayPal = async () => {
    try {
      // Create PayPal order manually
      const response = await fetch('/api/payments/create-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount.toFixed(2),
          currency: 'USD',
        }),
      });

      const orderData = await response.json();

      if (orderData.success && orderData.data.approve_url) {
        // Redirect to PayPal approval URL
        window.location.href = orderData.data.approve_url;
      } else {
        throw new Error(orderData.message || 'Failed to create PayPal order');
      }
    } catch (error: any) {
      console.error('❌ Manual PayPal order creation failed:', error);
      setPaypalError(error.message || 'Failed to process PayPal payment');
      onError(error);
    }
  };

  if (isInitializing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading PayPal...</span>
        </div>
      </div>
    );
  }

  if (paypalError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{paypalError}</AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button
            onClick={handleManualPayPal}
            disabled={isProcessing}
            className="flex-1 bg-[#0070ba] hover:bg-[#005ea6] text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Try PayPal Again
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* PayPal Buttons Container */}
      <div id="paypal-button-container" className="min-h-[55px]">
        {!paypalLoaded && (
          <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
            <span className="text-gray-500">Loading PayPal...</span>
          </div>
        )}
      </div>

      {/* Alternative PayPal Option */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleManualPayPal}
          disabled={isProcessing || !paypalLoaded}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Having trouble? Try alternative PayPal method'}
        </button>
      </div>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500">
        <p>You will be redirected to PayPal to complete your payment securely</p>
      </div>
    </div>
  );
};
