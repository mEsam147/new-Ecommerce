// components/checkout/ConfirmationStep.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Clock } from 'lucide-react';

interface ConfirmationStepProps {
  user: any;
  isAuthenticated: boolean;
  selectedAddress: any;
  guestShippingInfo: any;
  orderNumber?: string;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  user,
  isAuthenticated,
  selectedAddress,
  guestShippingInfo,
  orderNumber
}) => {
  // Format the shipping address properly
  const formatShippingAddress = () => {
    if (isAuthenticated && selectedAddress) {
      return (
        <>
          <p className="font-semibold">{selectedAddress.name}</p>
          <p>{selectedAddress.street}</p>
          {selectedAddress.apartment && <p>{selectedAddress.apartment}</p>}
          <p>
            {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
          </p>
          {selectedAddress.phone && <p>{selectedAddress.phone}</p>}
        </>
      );
    } else if (!isAuthenticated && guestShippingInfo) {
      return (
        <>
          <p className="font-semibold">
            {guestShippingInfo.firstName} {guestShippingInfo.lastName}
          </p>
          <p>{guestShippingInfo.address}</p>
          {guestShippingInfo.apartment && <p>{guestShippingInfo.apartment}</p>}
          <p>
            {guestShippingInfo.city}, {guestShippingInfo.state} {guestShippingInfo.zipCode}
          </p>
          {guestShippingInfo.phone && <p>{guestShippingInfo.phone}</p>}
        </>
      );
    }
    return <p>No address information available</p>;
  };

  const email = isAuthenticated ? user?.email : guestShippingInfo.email;

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h2>

          <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
            Thank you for your purchase. Your order has been confirmed and will be shipped soon.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="text-xl font-bold text-gray-900">
                    {orderNumber || `#ORD-${Date.now().toString().slice(-8)}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{email}</p>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Information
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                {formatShippingAddress()}
              </div>
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-blue-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Estimated Delivery</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
          <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📧 You will receive an order confirmation email shortly</p>
            <p>📦 We'll notify you when your order ships</p>
            <p>🚚 Track your order with the provided tracking number</p>
            <p>💬 Contact support if you have any questions</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/profile?tab=orders">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              <Package className="w-4 h-4" />
              View Order Details
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="gap-2 border-gray-300 hover:border-gray-400 px-8 py-3">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Need help? Contact our support team at support@example.com or call 1-800-123-4567</p>
        </div>
      </CardContent>
    </Card>
  );
};
