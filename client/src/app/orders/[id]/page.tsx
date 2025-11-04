// app/orders/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Share2,
  Home,
  ShoppingBag,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  ArrowLeft,
  Printer,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useGetOrderQuery } from '@/lib/services/ordersApi';
import { Order } from '@/lib/services/ordersApi';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  // Use the ordersApi hook
  const { data: orderResponse, isLoading, error } = useGetOrderQuery(orderId);

  const order = orderResponse?.data;

  const getStatusBadge = (status: string, isPaid: boolean) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      'confirmed': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Confirmed' },
      'processing': { color: 'bg-purple-100 text-purple-800', icon: Package, text: 'Processing' },
      'shipped': { color: 'bg-indigo-100 text-indigo-800', icon: Truck, text: 'Shipped' },
      'delivered': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Delivered' },
      'cancelled': { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Cancelled' },
      'refunded': { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Refunded' },
      'failed': { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Failed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-2 px-3 py-1 text-sm`}>
        <IconComponent className="w-4 h-4" />
        {config.text}
        {!isPaid && status === 'pending' && (
          <span className="ml-1 text-xs">(Unpaid)</span>
        )}
      </Badge>
    );
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Clock },
      { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
      { key: 'processing', label: 'Processing', icon: Package },
      { key: 'shipped', label: 'Shipped', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const currentIndex = steps.findIndex(step => step.key === status);

    return steps.map((step, index) => {
      const isCompleted = index <= currentIndex;
      const isCurrent = index === currentIndex;
      const IconComponent = step.icon;

      return (
        <div key={step.key} className="flex items-center">
          <div className={`flex flex-col items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : isCurrent
                ? 'border-blue-500 bg-white text-blue-500'
                : 'border-gray-300 bg-white text-gray-400'
            }`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <span className={`text-xs mt-2 font-medium ${
              isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
          {index !== steps.length - 1 && (
            <div className={`flex-1 h-1 mx-2 ${
              isCompleted ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          )}
        </div>
      );
    });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handlePrintInvoice = () => {
    window.open(`/orders/${orderId}/invoice`, '_blank');
  };

  const handleShareOrder = () => {
    if (navigator.share && order) {
      navigator.share({
        title: `Order #${order.orderNumber}`,
        text: `Check out my order #${order.orderNumber}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Order link copied to clipboard!');
    }
  };

  const handleDownloadInvoice = () => {
    // In a real app, this would download the invoice
    console.log('Downloading invoice for order:', orderId);
    // You can implement actual download logic here
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading order details...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error ? 'Failed to load order details' : 'The order you are looking for does not exist.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/orders">
                <Button className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Orders
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/orders" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShareOrder} className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button onClick={handlePrintInvoice} className="gap-2">
              <Printer className="w-4 h-4" />
              Print Invoice
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
                <div className="flex items-center justify-between mb-6">
                  {getStatusSteps(order.status)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Current Status</p>
                    {getStatusBadge(order.status, order.isPaid)}
                  </div>
                  {order.shipping.trackingNumber && (
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">Tracking Number</p>
                      <p className="text-blue-600 font-mono">{order.shipping.trackingNumber}</p>
                      {order.shipping.carrier && (
                        <p className="text-sm text-gray-600">{order.shipping.carrier}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={item._id || `${item.product}-${index}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                          <span>Qty: {item.quantity}</span>
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

                {/* Order Summary */}
                <div className="space-y-3 max-w-md ml-auto">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Price:</span>
                    <span className="font-medium">{formatCurrency(order.pricing.itemsPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">{formatCurrency(order.pricing.shippingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatCurrency(order.pricing.taxPrice)}</span>
                  </div>
                  {order.pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(order.pricing.discountAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">{formatCurrency(order.pricing.totalPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Shipping Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                    <div className="space-y-2 text-gray-600">
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {order.shippingAddress.name}
                      </p>
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {order.shippingAddress.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {order.contactInfo.email}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Delivery Information</h3>
                    <div className="space-y-3">
                      {order.shipping.estimatedDelivery && (
                        <div>
                          <p className="font-medium text-gray-900">Estimated Delivery</p>
                          <p className="text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.shipping.estimatedDelivery)}
                          </p>
                        </div>
                      )}
                      {order.notes && (
                        <div>
                          <p className="font-medium text-gray-900">Order Notes</p>
                          <p className="text-gray-600">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Actions */}
            <Card className="">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleDownloadInvoice}
                  >
                    <Download className="w-4 h-4" />
                    Download Invoice
                  </Button>
                  {order.shipping.trackingNumber && (
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Truck className="w-4 h-4" />
                      Track Package
                    </Button>
                  )}
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Buy Again
                  </Button>
                </div>

                <Separator className="my-4" />

                {/* Payment Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    {getPaymentMethodIcon(order.paymentMethod)}
                    Payment Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={order.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                    {order.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid on:</span>
                        <span className="font-medium">{formatDate(order.paidAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="bg-blue-50 border-blue-200">
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
      </div>
    </div>
  );
}
