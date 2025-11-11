// app/checkout/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGetSessionStatusQuery, useDecrementInventoryMutation } from '@/lib/services/paymentApi';
import { useCartCheckout } from '@/lib/hooks/useCartCheckout';
import { CheckCircle, XCircle, Clock, Package, ShoppingBag, Mail, Truck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [inventoryStatus, setInventoryStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [usedExistingOrder, setUsedExistingOrder] = useState(false);

  const { clearCart, items: cartItems, isEmpty: isCartEmpty } = useCartCheckout();
  const [decrementInventory] = useDecrementInventoryMutation();

  const { data: sessionData, isLoading, error } = useGetSessionStatusQuery(
    { sessionId: sessionId! },
    { skip: !sessionId }
  );

  // Clear cart when payment is successful
  useEffect(() => {
    const clearCartAfterSuccess = async () => {
      if (sessionData?.success && sessionData.data?.paymentStatus === 'paid' && !isCartEmpty) {
        try {
          await clearCart();
          console.log('✅ Cart cleared successfully');
        } catch (error) {
          console.error('❌ Failed to clear cart:', error);
        }
      }
    };

    clearCartAfterSuccess();
  }, [sessionData, clearCart, isCartEmpty]);

  // Process inventory and order
  useEffect(() => {
    const processOrder = async () => {
      if (!sessionId || inventoryStatus !== 'pending') return;

      if (sessionData?.success && sessionData.data?.paymentStatus === 'paid') {
        try {
          setInventoryStatus('processing');

          const result = await decrementInventory({
            sessionId: sessionId.trim(),
          }).unwrap();

          if (result.success) {
            setInventoryStatus('success');
            setOrderDetails(result.data.order);
            setUsedExistingOrder(result.data.usedExisting || false);
          } else {
            setInventoryStatus('failed');
          }
        } catch (error) {
          console.error('❌ Order processing error:', error);
          setInventoryStatus('failed');
        }
      }
    };

    processOrder();
  }, [sessionData, sessionId, inventoryStatus, decrementInventory]);

  // Handle loading states
  if (!sessionId) {
    return <ErrorState title="Session Missing" message="No session ID found. Please return to checkout." />;
  }

  if (isLoading) {
    return <LoadingState message="Verifying your payment..." />;
  }

  if (error) {
    return <ErrorState title="Payment Verification Failed" message="Failed to verify payment session." />;
  }

  if (inventoryStatus === 'processing') {
    return <LoadingState message="Processing your order and updating inventory..." />;
  }

  if (inventoryStatus === 'failed') {
    return (
      <ErrorState
        title="Order Processing Issue"
        message="Payment was successful, but we encountered an issue processing your order. Please contact support."
        showSupport={true}
      />
    );
  }

  // Success state
  if (inventoryStatus === 'success' && orderDetails) {
    return <OrderConfirmation order={orderDetails} usedExistingOrder={usedExistingOrder} />;
  }

  // Default state
  return <LoadingState message="Finalizing your order..." />;
}

// Loading State Component
function LoadingState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing...</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ title, message, showSupport = false }: { title: string; message: string; showSupport?: boolean }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-3">
          <Link href="/cart" className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Return to Cart
          </Link>
          {showSupport && (
            <Link href="/support" className="block border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Contact Support
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Order Confirmation Component
function OrderConfirmation({ order, usedExistingOrder }: { order: any; usedExistingOrder: boolean }) {
  const pricing = order.pricing || {};
  const shipping = order.shipping || {};
  const items = order.items || [];
  const customerEmail = order.contactInfo?.email || order.user?.email;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {usedExistingOrder ? 'Order Retrieved Successfully!' : 'Order Confirmed!'}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {usedExistingOrder
              ? "We found your existing order and it's being processed."
              : 'Thank you for your purchase! Your order has been confirmed.'
            }
          </p>

          {/* Order Number */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block mb-4">
            <p className="text-green-800 font-semibold text-lg">
              Order #: {order.orderNumber}
            </p>
          </div>

          {/* Confirmation Email */}
          {customerEmail && (
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
              <Mail className="w-5 h-5" />
              <span>Confirmation sent to {customerEmail}</span>
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>

                {/* Items List */}
                <div className="space-y-4 mb-6">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <Image
                      width={100}
                      height={100}
                        src={item.image || '/images/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>${item.price}</span>
                        </div>
                        {item.variant && (item.variant.size || item.variant.color) && (
                          <div className="text-sm text-gray-500">
                            {[item.variant.size, item.variant.color].filter(Boolean).join(' / ')}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${item.totalPrice}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${pricing.itemsPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {pricing.shippingPrice === 0 ? 'Free' : `$${pricing.shippingPrice?.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${pricing.taxPrice?.toFixed(2)}</span>
                  </div>
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${pricing.discountAmount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="font-semibold text-lg text-gray-900">Total</span>
                    <span className="font-semibold text-lg text-gray-900">
                      ${pricing.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Info Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Status
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Status</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment</span>
                    <StatusBadge status={order.isPaid ? 'paid' : 'pending'} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium capitalize">{order.paymentMethod}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping
                </h2>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{shipping.address?.name}</p>
                  <p>{shipping.address?.street}</p>
                  <p>{shipping.address?.city}, {shipping.address?.state} {shipping.address?.zipCode}</p>
                  <p>{shipping.address?.country}</p>
                  {shipping.address?.phone && <p>📞 {shipping.address.phone}</p>}
                </div>
                {shipping.trackingNumber && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Tracking Number</p>
                    <p className="text-sm text-blue-600">{shipping.trackingNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📧 support@example.com</p>
                  <p>📞 1-800-123-4567</p>
                  <p>🕒 Mon-Fri 9AM-6PM EST</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/orders">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              View Order Details
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50 px-8 py-3">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: { [key: string]: { color: string; label: string } } = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
    processing: { color: 'bg-orange-100 text-orange-800', label: 'Processing' },
    shipped: { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
    delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
    paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
}
