// components/payment/PaymentMethodsList.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Trash2, Star, Plus } from 'lucide-react';
import { PaymentMethod } from '@/lib/services/stripeApi';
import Image from 'next/image';

interface PaymentMethodsListProps {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  onAddPaymentMethod: () => void;
  onSetDefault: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSettingDefault: boolean;
  isDeleting: boolean;
}

export const PaymentMethodsList: React.FC<PaymentMethodsListProps> = ({
  paymentMethods,
  isLoading,
  onAddPaymentMethod,
  onSetDefault,
  onDelete,
  isSettingDefault,
  isDeleting,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getCardIcon = (brand: string) => {
    const icons: { [key: string]: string } = {
      visa: '/icons/visa.svg',
      mastercard: '/icons/mastercard.svg',
      amex: '/icons/amex.svg',
      discover: '/icons/discover.svg',
    };
    return icons[brand] || '/icons/credit-card.svg';
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600">Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment Methods</h3>
        <Button onClick={onAddPaymentMethod} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Payment Method
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No payment methods</h4>
            <p className="text-gray-600 mb-4">Add a payment method to get started</p>
            <Button onClick={onAddPaymentMethod}>
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {method.brand && (
                      <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <Image
                          src={getCardIcon(method.brand)}
                          alt={method.brand}
                          className="w-8 h-6 object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold capitalize">
                          {method.brand || method.type}
                        </p>
                        {method.isDefault && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 fill-current mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {method.type === 'card' ? `•••• ${method.last4}` : method.email}
                      </p>
                      {method.expiry && (
                        <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSetDefault(method.id)}
                        disabled={isSettingDefault}
                      >
                        {isSettingDefault ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          'Set Default'
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                      disabled={deletingId === method.id || isDeleting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === method.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
