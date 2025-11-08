// components/checkout/PaymentStep.tsx
'use client';

import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';
import { useCreateCheckoutSessionMutation } from '@/lib/services/paymentApi';
import { useToast } from '@/lib/hooks/useToast';

interface PaymentStepProps {
  paymentMethod: string;
  selectedAddress: any;
  guestShippingInfo: any;
  isAuthenticated: boolean;
  selectedShipping: any;
  agreeToTerms: boolean;
  onPaymentMethodChange: (method: string) => void;
  onAgreeToTermsChange: (checked: boolean) => void;
  onBackToShipping: () => void;
  totalAmount: number; // ✅ الآن هذا معرّف دائماً
  cart: any[];
  onOrderSuccess: (orderNumber: string) => void;
}

const paymentMethods = [
  {
    id: 'stripe',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Pay with Visa, Mastercard, or American Express'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: Wallet,
    description: 'Pay with your PayPal account'
  },
  {
    id: 'applepay',
    name: 'Apple Pay',
    icon: Apple,
    description: 'Pay with Apple Pay'
  }
];

export const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentMethod,
  selectedAddress,
  guestShippingInfo,
  isAuthenticated,
  selectedShipping,
  agreeToTerms,
  onPaymentMethodChange,
  onAgreeToTermsChange,
  onBackToShipping,
  totalAmount, // ✅ استخدام القيمة الممررة
  cart,
  onOrderSuccess
}) => {
  const [createCheckoutSession, { isLoading: isCreatingSession }] = useCreateCheckoutSessionMutation();
  const { success: toastSuccess, error: toastError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // التأكد من أن totalAmount له قيمة صالحة
  const safeTotalAmount = totalAmount || 0;

  const handlePayment = async () => {
    if (!agreeToTerms) {
      toastError('Please agree to the terms and conditions');
      return;
    }

    if (safeTotalAmount <= 0) {
      toastError('Invalid order total');
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'stripe') {
        // Create Stripe checkout session
        const result = await createCheckoutSession({
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`,
          shippingAddress: {
            country: selectedAddress?.country || guestShippingInfo.country || 'US'
          }
        }).unwrap();

        if (result.success && result.data.url) {
          // Redirect to Stripe checkout
          window.location.href = result.data.url;
        } else {
          throw new Error('Failed to create checkout session');
        }
      } else if (paymentMethod === 'paypal') {
        // Handle PayPal payment
        handlePayPalPayment();
      } else if (paymentMethod === 'applepay') {
        // Handle Apple Pay
        handleApplePay();
      } else {
        toastError('Payment method not supported yet');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toastError(error?.data?.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    // For demo purposes, simulate successful PayPal payment
    toastSuccess('PayPal payment would be processed here');
    // In real implementation, you would integrate with PayPal API
    setTimeout(() => {
      onOrderSuccess(`ORD-${Date.now().toString().slice(-8)}`);
    }, 2000);
  };

  const handleApplePay = async () => {
    toastError('Apple Pay is not available at the moment');
  };

  const getCountryName = (countryCode: string) => {
    const countries: { [key: string]: string } = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'AE': 'United Arab Emirates',
      'SA': 'Saudi Arabia',
      'EG': 'Egypt'
    };
    return countries[countryCode] || countryCode;
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
        {/* Country Information */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Globe className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Country:</strong> {getCountryName(selectedAddress?.country || guestShippingInfo.country || 'US')}
          </AlertDescription>
        </Alert>

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select Payment Method
          </h3>
          <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className="space-y-3">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <div key={method.id} className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 hover:border-blue-500 transition-colors">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-6 h-6 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Order Information */}
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg text-gray-900">
                ${safeTotalAmount.toFixed(2)} {/* ✅ استخدام القيمة الآمنة */}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Items:</span>
              <span className="font-medium text-gray-900">
                {cart.reduce((total, item) => total + (item.quantity || 1), 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium text-gray-900">
                {selectedShipping?.price === 0 ? 'FREE' : `$${selectedShipping?.price}`}
              </span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="border-t pt-6">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={onAgreeToTermsChange}
              required
            />
            <Label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBackToShipping}
            className="flex-1 border-gray-300 hover:border-gray-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shipping
          </Button>
          <Button
            onClick={handlePayment}
            disabled={!agreeToTerms || isProcessing || isCreatingSession || safeTotalAmount <= 0}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
          >
            {(isProcessing || isCreatingSession) ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Pay ${safeTotalAmount.toFixed(2)} {/* ✅ استخدام القيمة الآمنة */}
              </>
            )}
          </Button>
        </div>

        {/* Secure Payment Info */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <Lock className="w-4 h-4" />
            <span className="font-medium">Secure Payment</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            All payments are encrypted and secure. We never store your credit card details.
          </p>
        </div>

        {/* Test Mode Notice */}
        {process.env.NODE_ENV === 'development' && (
          <Alert className="mt-4 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Test Mode:</strong> Use test card 4242 4242 4242 4242 with any future expiry and CVC
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
