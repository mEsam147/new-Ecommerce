// components/checkout/PaymentStep.tsx - UPDATED
'use client';

import React, { useState, useEffect } from 'react'; // Added useEffect
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import {
  Lock,
  CreditCard,
  Wallet,
  Apple,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Globe,
  Shield,
  Banknote,
} from 'lucide-react';
import { useCreateCheckoutSessionMutation } from '@/lib/services/paymentApi';
import { useToast } from '@/lib/hooks/useToast';
import { StripePaymentForm } from './StripePaymentForm';
import { PayPalPayment } from './PayPalPayment';

interface PaymentStepProps {
  paymentMethod: string;
  selectedAddress: any;
  guestShippingInfo: any;
  isAuthenticated: boolean;
  shippingMethod: string;
  shippingCost: number;
  agreeToTerms: boolean;
  totalAmount: number;
  cart: any[];
  user?: any;
  onPaymentMethodChange: (method: string) => void;
  onAgreeToTermsChange: (checked: boolean) => void;
  onBack: () => void;
  onSuccess: (paymentResult: any) => void;
  onError: (error: any) => void;
  onCreateOrder: (paymentData?: any) => void;
  isProcessing: boolean;
}

const paymentMethods = [
  {
    id: 'stripe',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Pay with Visa, Mastercard, or American Express',
    supported: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: Wallet,
    description: 'Pay with your PayPal account',
    supported: true
  },
  {
    id: 'cash_on_delivery',
    name: 'Cash on Delivery',
    icon: Banknote,
    description: 'Pay when you receive your order',
    supported: true
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: Apple,
    description: 'Pay with Apple Pay',
    supported: false
  },
];

export const PaymentStep: React.FC<PaymentStepProps> = (props) => {
  const {
    paymentMethod,
    selectedAddress,
    guestShippingInfo,
    agreeToTerms,
    totalAmount,
    cart,
    user,
    onPaymentMethodChange,
    onAgreeToTermsChange,
    onBack,
    onSuccess,
    onError,
    onCreateOrder,
    isProcessing,
    shippingCost,
    isAuthenticated,
  } = props;

  const [createCheckoutSession, { isLoading: isCreatingSession }] = useCreateCheckoutSessionMutation();
  const { success, error: toastError } = useToast();
  const [stripePaymentData, setStripePaymentData] = useState<any>(null);
  const [showTermsError, setShowTermsError] = useState(false);
  const safeTotalAmount = totalAmount || 0;

  // Show terms error when payment is attempted without agreeing
  useEffect(() => {
    if (isProcessing) {
      setShowTermsError(!agreeToTerms);
    }
  }, [isProcessing, agreeToTerms]);

  // ✅ Stripe Checkout session redirect
  const handleStripeCheckout = async () => {
    if (!agreeToTerms) {
      setShowTermsError(true);
      toastError('Please agree to the terms and conditions.');
      return;
    }

    try {
      const result = await createCheckoutSession({
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/checkout`,
        shippingAddress: { country: selectedAddress?.country || guestShippingInfo.country || 'US' },
      }).unwrap();

      if (result.success && result.data.url) {
        success('Redirecting to secure checkout...');
        window.location.href = result.data.url;
      } else {
        throw new Error('Failed to create Stripe checkout session');
      }
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      toastError(err?.data?.message || 'Failed to start secure checkout.');
      onError(err);
    }
  };

  // ✅ Stripe direct payment (embedded form)
  const handleStripePayment = async (paymentData: any) => {
    try {
      console.log('💰 Stripe payment successful, creating order...', paymentData);

      if (!agreeToTerms) {
        setShowTermsError(true);
        toastError('Please agree to the terms and conditions before completing your order.');
        return;
      }

      setStripePaymentData(paymentData);
      await onCreateOrder({
        paymentIntentId: paymentData.paymentIntentId,
        paymentMethodId: paymentData.paymentMethodId,
        paymentResult: paymentData.paymentResult,
      });
      // Success toast will be shown by parent component
    } catch (err: any) {
      console.error('❌ Order creation failed after Stripe payment:', err);
      toastError('Payment completed but order creation failed. Please contact support.');
      onError(err);
    }
  };

  // ✅ PayPal
  const handlePayPalPayment = async (paypalOrderId: string) => {
    try {
      console.log('💰 PayPal payment successful, creating order...', paypalOrderId);

      if (!agreeToTerms) {
        setShowTermsError(true);
        toastError('Please agree to the terms and conditions before completing your order.');
        return;
      }

      await onCreateOrder({
        paypalOrderId,
        paymentMethod: 'paypal',
        paymentResult: {
          id: paypalOrderId,
          status: 'completed',
          update_time: new Date().toISOString(),
        }
      });
      // Success toast will be shown by parent component
    } catch (err: any) {
      console.error('❌ Order creation failed after PayPal payment:', err);
      toastError('Payment completed but order creation failed. Please contact support.');
      onError(err);
    }
  };

  // ✅ Cash on Delivery
  const handleCashOnDelivery = async () => {
    try {
      console.log('💰 Cash on Delivery selected, creating order...');

      if (!agreeToTerms) {
        setShowTermsError(true);
        toastError('Please agree to the terms and conditions before placing your order.');
        return;
      }

      await onCreateOrder({
        paymentMethod: 'cash_on_delivery',
        paymentResult: {
          id: `cod_${Date.now()}`,
          status: 'pending',
          update_time: new Date().toISOString(),
        }
      });
      // Success toast will be shown by parent component
    } catch (err: any) {
      console.error('❌ Order creation failed for cash on delivery:', err);
      toastError('Failed to place order. Please try again.');
      onError(err);
    }
  };

  const handleTermsChange = (checked: boolean) => {
    setShowTermsError(false);
    onAgreeToTermsChange(checked);
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'stripe':
        return (
          <StripePaymentForm
            amount={safeTotalAmount}
            onSuccess={handleStripePayment}
            onError={onError}
            isProcessing={isProcessing}
            user={user}
            guestShippingInfo={guestShippingInfo}
            isAuthenticated={isAuthenticated}
          />
        );
      case 'paypal':
        return (
          <PayPalPayment
            amount={safeTotalAmount}
            onSuccess={handlePayPalPayment}
            onError={onError}
            isProcessing={isProcessing}
          />
        );
      case 'cash_on_delivery':
        return (
          <div className="space-y-6">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                You will pay when your order is delivered. Available in select areas only.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Cash on Delivery Instructions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Have exact change ready for the delivery person</li>
                <li>• Delivery time: 3-7 business days</li>
                <li>• Additional $2.00 cash handling fee applies</li>
                <li>• Photo ID required for verification</li>
              </ul>
            </div>

            <Button
              onClick={handleCashOnDelivery}
              disabled={!agreeToTerms || isProcessing}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Place Order - ${safeTotalAmount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Select a payment method to continue
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleStripeCheckout}
              disabled={!agreeToTerms || isCreatingSession || isProcessing}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
            >
              {isCreatingSession || isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Continue to Payment
                </>
              )}
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Payment Method
            </h3>
            <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center space-x-3 rounded-lg border p-4 transition-all ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!method.supported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => method.supported && onPaymentMethodChange(method.id)}
                >
                  <RadioGroupItem
                    value={method.id}
                    id={method.id}
                    disabled={!method.supported}
                  />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <method.icon className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                      {!method.supported && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Selected Payment Form */}
          {paymentMethod && (
            <div className="border-t pt-6">
              {renderPaymentForm()}
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="border-t pt-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={handleTermsChange}
                className="mt-1"
              />
              <div className="space-y-2 flex-1">
                <Label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                    Privacy Policy
                  </Link>
                  . I understand that my order is subject to verification and approval.
                </Label>

                {/* Terms Error Message */}
                {showTermsError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You must agree to the terms and conditions to complete your order.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>

          {/* Security Footer */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>256-bit SSL Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>PCI Compliant</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span>Your data is safe with us</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
