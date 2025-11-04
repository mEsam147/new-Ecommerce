// components/checkout/OrderSummary.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import Image from 'next/image';

interface OrderSummaryProps {
  items: any[];
  totalItems: number;
  subtotal: number;
  total: number;
  discount: number;
  shippingCost: number;
  tax: number;
  finalTotal: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  totalItems,
  subtotal,
  total,
  discount,
  shippingCost,
  tax,
  finalTotal
}) => {
  const getEnhancedItemDisplayInfo = (item: any) => {
    const productId = item.productId || item.product?._id || item.product;
    const productTitle = item.product?.title || 'Product';
    const productImage = item.product?.images?.[0]?.url || '/images/placeholder-product.jpg';
    const price = item.price || item.product?.price || 0;
    const quantity = item.quantity || item.qty || 1;
    const size = item.size || item.variant?.size;
    const color = item.color || item.variant?.color;

    return {
      id: item.id || item._id,
      productId,
      title: productTitle,
      image: productImage,
      price,
      quantity,
      size,
      color,
      totalPrice: price * quantity
    };
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 sticky top-6">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Order Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {items.map((item) => {
              const displayItem = getEnhancedItemDisplayInfo(item);
              return (
                <div key={displayItem.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={displayItem.image}
                      alt={displayItem.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm line-clamp-2">
                      {displayItem.title}
                    </p>
                    {(displayItem.size || displayItem.color) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {[displayItem.size, displayItem.color].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">Qty: {displayItem.quantity}</span>
                      <span className="font-semibold text-gray-900 text-sm">
                        ${displayItem.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="mb-4" />

          {/* Price Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({totalItems} items)</span>
              <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-900">
                {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
            <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Secure Checkout</span>
            </div>
            <p className="text-xs text-green-600">
              Your payment information is encrypted and secure
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Support Info */}
      <Card className="border-0 shadow-lg bg-blue-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📞 Call us: 1-800-123-4567</p>
            <p>💬 Live chat available</p>
            <p>📧 support@example.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
