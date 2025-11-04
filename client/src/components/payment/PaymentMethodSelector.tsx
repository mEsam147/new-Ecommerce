'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Landmark, Apple, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  onSelect: (method: 'card' | 'paypal' | 'apple_pay' | 'bank_transfer') => void;
  selectedMethod?: string;
}

const paymentMethods = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Pay with Visa, Mastercard, or American Express',
    icon: CreditCard,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: Wallet,
    color: 'from-blue-400 to-blue-500',
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    description: 'Pay with Apple Pay',
    icon: Apple,
    color: 'from-gray-800 to-gray-900',
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Direct bank transfer',
    icon: Landmark,
    color: 'from-green-500 to-green-600',
  },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelect,
  selectedMethod,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        return (
          <Card
            key={method.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
              selectedMethod === method.id
                ? "border-blue-500 bg-blue-50/50"
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => onSelect(method.id as any)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center text-white",
                  method.color
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
