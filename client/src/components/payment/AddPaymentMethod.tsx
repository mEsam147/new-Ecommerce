// components/payment/AddPaymentMethod.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, CreditCard } from 'lucide-react';
import { useStripePayment } from '@/lib/hooks/useStripePayment';

interface AddPaymentMethodProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const AddPaymentMethod: React.FC<AddPaymentMethodProps> = ({
  onBack,
  onSuccess,
}) => {
  const {
    clientSecret,
    isProcessing,
    isCreatingSetupIntent,
    PaymentElement,
    createPaymentSetup,
    confirmPaymentSetup,
  } = useStripePayment();

  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    // Create setup intent when component mounts
    createPaymentSetup();
  }, [createPaymentSetup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await confirmPaymentSetup(isDefault);
    if (result.success) {
      onSuccess();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-8 h-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Add Payment Method
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isCreatingSetupIntent ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">Setting up payment form...</p>
          </div>
        ) : clientSecret ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Card Details</Label>
              <div className="border rounded-lg p-4">
                <PaymentElement
                  options={{
                    layout: 'tabs',
                    fields: {
                      billingDetails: {
                        name: 'never',
                        email: 'never',
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="default"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(checked as boolean)}
              />
              <Label htmlFor="default" className="text-sm text-gray-600">
                Set as default payment method
              </Label>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1 gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Payment Method'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 text-red-600">
            Failed to load payment form. Please try again.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
