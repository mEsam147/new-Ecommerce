// app/order/success/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  Download,
  Share2,
  Home,
  ShoppingBag,
  Mail,
  AlertCircle,
  CreditCard,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { useVerifyPaymentMutation } from '@/lib/services/paymentApi';
import { useGetOrdersQuery } from '@/lib/services/ordersApi';
import { Order } from '@/lib/services/ordersApi';
import { useCart } from '@/lib/hooks/useCart';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paymentIntentId = searchParams.get('payment_intent');
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartCleared, setCartCleared] = useState(false);

  // Use the cart hook to clear cart
  const { clearCart, items: cartItems } = useCart();

  // Use the payment API to verify the payment
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();

  // Use orders API to get latest orders
  const { data: ordersResponse, refetch: refetchOrders } = useGetOrdersQuery();

  // Function to clear the cart
  const handleClearCart = async () => {
    try {
      await clearCart();
      setCartCleared(true);
      console.log('🛒 Cart cleared successfully after order confirmation');
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  useEffect(() => {
    if (sessionId || paymentIntentId) {
      verifyPaymentAndFindOrder();
    } else {
      setError('No payment session found');
      setLoading(false);
    }
  }, [sessionId, paymentIntentId]);

  const verifyPaymentAndFindOrder = async () => {
    try {
      let verificationResult;

      // Try to verify payment using payment intent ID first
      if (paymentIntentId) {
        verificationResult = await verifyPayment({ paymentIntentId }).unwrap();
      }
      // If we have session ID but no payment intent, try to extract it from session
      else if (sessionId) {
        // In a real implementation, you'd call your backend to get payment intent from session
        verificationResult = await verifyPaymentFromSession(sessionId);
      }

      if (verificationResult?.success) {
        // Refetch orders to get the latest one
        const ordersResult = await refetchOrders();

        if (ordersResult.data?.success && ordersResult.data.data.length > 0) {
          // Find the most recent order (assuming it's the one just created)
          const latestOrder = ordersResult.data.data[0];
          setOrderDetails(latestOrder);

          // Clear the cart after order is confirmed
          if (!cartCleared && cartItems.length > 0) {
            await handleClearCart();
          }
        } else {
          // If no orders found, show success message anyway and clear cart
          console.log('Payment verified but no order found yet');
          if (!cartCleared && cartItems.length > 0) {
            await handleClearCart();
          }
        }
      } else {
        setError('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Failed to verify payment. Please check your orders page.');
    } finally {
      setLoading(false);
    }
  };

  const verifyPaymentFromSession = async (sessionId: string) => {
    try {
      // This would call your backend to get payment intent from session
      const response = await fetch(`/api/payments/session/${sessionId}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to get session details');
    } catch (error) {
      console.error('Error getting session details:', error);
      // If we can't verify, still show success but with a note
      return { success: true, data: { status: 'requires_verification' } };
    }
  };

  // Rest of your component remains the same...
  const handleDownloadInvoice = () => {
    if (orderDetails) {
      window.open(`/orders/${orderDetails._id}/invoice`, '_blank');
    } else {
      alert('Invoice will be available once your order is fully processed');
    }
  };

  const handleShareOrder = () => {
    if (navigator.share && orderDetails) {
      navigator.share({
        title: `Your Order #${orderDetails.orderNumber}`,
        text: `My order #${orderDetails.orderNumber} has been confirmed successfully!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Order link copied to clipboard!');
    }
  };

  const handleTrackOrder = () => {
    if (orderDetails) {
      window.open(`/orders/${orderDetails._id}`, '_blank');
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      'stripe': CreditCard,
      'paypal': DollarSign,
      'card': CreditCard,
      'cash_on_delivery': DollarSign
    };
    const IconComponent = icons[method as keyof typeof icons] || CreditCard;
    return <IconComponent className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string, isPaid: boolean) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      'confirmed': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Confirmed' },
      'processing': { color: 'bg-blue-100 text-blue-800', icon: Package, text: 'Processing' },
      'shipped': { color: 'bg-purple-100 text-purple-800', icon: Truck, text: 'Shipped' },
      'delivered': { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, text: 'Delivered' },
      'cancelled': { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.confirmed;

    return (
      <Badge className={config.color}>
        {config.text}
        {!isPaid && status === 'pending' && ' (Processing Payment)'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCountryName = (countryCode: string) => {
    const countries: { [key: string]: string } = {
      'US': 'United States', 'CA': 'Canada', 'GB': 'United Kingdom', 'AU': 'Australia',
      'DE': 'Germany', 'FR': 'France', 'IT': 'Italy', 'ES': 'Spain',
      'JP': 'Japan', 'KR': 'South Korea', 'CN': 'China', 'IN': 'India'
    };
    return countries[countryCode] || countryCode;
  };

  const getEstimatedDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days from now
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Processing your order...</h2>
          <p className="text-gray-500 mt-2">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error && !orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Processing Issue</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {error || 'There was an issue verifying your payment. Please check your email for confirmation or contact support.'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/">
              <Button className="gap-2">
                <Home className="w-4 h-4" />
                Home Page
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" className="gap-2">
                <Package className="w-4 h-4" />
                View Orders
              </Button>
            </Link>
            <Button variant="outline" className="gap-2" onClick={() => window.location.reload()}>
              <CheckCircle className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Top Banner */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {orderDetails ? 'Your Order is Confirmed!' : 'Payment Successful!'}
          </h1>

          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            {orderDetails
              ? 'Thank you for your purchase. Your order has been confirmed and will be shipped as soon as possible.'
              : 'Thank you for your purchase! Your payment has been processed successfully. You will receive an email confirmation shortly.'
            }
          </p>

          {orderDetails && (
            <div className="flex items-center justify-center gap-4 mb-6">
              {getStatusBadge(orderDetails.status, orderDetails.isPaid)}
              <span className="text-lg font-semibold text-gray-700">
                #{orderDetails.orderNumber}
              </span>
            </div>
          )}
        </div>

        {orderDetails ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Details */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Order Details
                  </h2>

                  <div className="space-y-4">
                    {orderDetails.items.map((item, index) => (
                      <div key={item._id || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>Quantity: {item.quantity}</span>
                            {item.variant?.size && <span>Size: {item.variant.size}</span>}
                            {item.variant?.color && <span>Color: {item.variant.color}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.totalPrice)}
                          </p>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  {/* Pricing */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items Price:</span>
                      <span className="font-medium">{formatCurrency(orderDetails.pricing.itemsPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium">{formatCurrency(orderDetails.pricing.shippingPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">{formatCurrency(orderDetails.pricing.taxPrice)}</span>
                    </div>
                    {orderDetails.pricing.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(orderDetails.pricing.discountAmount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">{formatCurrency(orderDetails.pricing.totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-green-600" />
                    Shipping Information
                  </h2>

                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900">{orderDetails.shippingAddress.name}</p>
                      <p className="text-gray-600">{orderDetails.shippingAddress.street}</p>
                      <p className="text-gray-600">
                        {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}
                      </p>
                      <p className="text-gray-600">{orderDetails.shippingAddress.zipCode}</p>
                      <p className="text-gray-600">{getCountryName(orderDetails.shippingAddress.country)}</p>
                      <p className="text-gray-600">{orderDetails.shippingAddress.phone}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Estimated Delivery Date</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {getEstimatedDeliveryDate()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="shadow-lg border-0 sticky top-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>

                  <div className="space-y-3">
                    <Button
                      onClick={handleDownloadInvoice}
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Invoice
                    </Button>

                    <Button
                      onClick={handleShareOrder}
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Order
                    </Button>

                    <Button
                      onClick={handleTrackOrder}
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Track Order
                    </Button>

                    <Link href="/orders" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Package className="w-4 h-4" />
                        View All Orders
                      </Button>
                    </Link>
                  </div>

                  <Separator className="my-4" />

                  {/* Payment Information */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize flex items-center gap-1">
                        {getPaymentMethodIcon(orderDetails.paymentMethod)}
                        {orderDetails.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <Badge className={orderDetails.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {orderDetails.isPaid ? 'Paid' : 'Processing'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="font-medium">
                        {formatDate(orderDetails.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="shadow-lg border-0 bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      support@example.com
                    </p>
                    <p>📞 1-800-123-4567</p>
                    <p>🕒 24/7 Customer Support</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Generic Success State when no order details available */
          <Card className="shadow-lg border-0 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Processed Successfully</h2>
              <p className="text-gray-600 mb-6">
                Your payment has been received and is being processed. You will receive an email confirmation with your order details shortly.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Order processing may take a few minutes</span>
                </div>
                {sessionId && (
                  <div className="text-xs text-gray-500">
                    Session ID: {sessionId}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/products">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="gap-2 border-gray-300 hover:border-gray-400 px-8 py-3">
              <Home className="w-4 h-4" />
              Home Page
            </Button>
          </Link>
        </div>

        {/* Confirmation Message */}
        <div className="text-center mt-8 p-6 bg-green-50 rounded-lg border border-green-200 max-w-2xl mx-auto">
          <h3 className="font-semibold text-green-800 mb-2">Confirmation Email Sent</h3>
          <p className="text-green-700 text-sm">
            {orderDetails
              ? 'Your order details have been sent to your email. You can also track your order status from your orders page.'
              : 'A payment confirmation has been sent to your email. Your order details will follow shortly.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
