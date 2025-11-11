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

// Define proper TypeScript interfaces based on your backend
interface OrderItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    images: string[];
    slug: string;
    description?: string;
    price: number;
  } | string; // Can be populated object or just ID string
  variant?: {
    size?: string;
    color?: string;
    sku?: string;
  };
  name: string;
  image: string;
  price: number;
  quantity: number;
  totalPrice: number;
  weight?: number;
  sku?: string;
}

interface OrderPricing {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
}

interface OrderShipping {
  method: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cost: number;
  address?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
}

interface OrderPayment {
  method: string;
  status: string;
  amount: number;
  currency: string;
  transactionId?: string;
  paymentIntentId?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  } | string;
  items: OrderItem[];
  status: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
  pricing: OrderPricing;
  payment: OrderPayment;
  shipping: OrderShipping;
  billingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: orderResponse, isLoading, error } = useGetOrderQuery(orderId);
  const order = orderResponse?.data as Order | undefined;

  const getStatusBadge = (status: string, isPaid: boolean) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      'confirmed': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Confirmed' },
      'processing': { color: 'bg-purple-100 text-purple-800', icon: Package, text: 'Processing' },
      'ready_for_shipment': { color: 'bg-indigo-100 text-indigo-800', icon: Package, text: 'Ready for Shipment' },
      'shipped': { color: 'bg-indigo-100 text-indigo-800', icon: Truck, text: 'Shipped' },
      'out_for_delivery': { color: 'bg-orange-100 text-orange-800', icon: Truck, text: 'Out for Delivery' },
      'delivered': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Delivered' },
      'cancelled': { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Cancelled' },
      'refunded': { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Refunded' },
      'failed': { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Failed' },
      'on_hold': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'On Hold' }
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
      { key: 'ready_for_shipment', label: 'Ready to Ship', icon: Package },
      { key: 'shipped', label: 'Shipped', icon: Truck },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
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
      'apple_pay': CreditCard,
      'google_pay': CreditCard,
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
    window.open(`/api/orders/${orderId}/invoice`, '_blank');
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
    window.open(`/api/orders/${orderId}/invoice?download=true`, '_blank');
  };

  const handleTrackPackage = () => {
    if (order?.shipping?.trackingUrl) {
      window.open(order.shipping.trackingUrl, '_blank');
    } else if (order?.shipping?.trackingNumber) {
      // Fallback to generic tracking search
      window.open(`https://www.google.com/search?q=track+${order.shipping.trackingNumber}`, '_blank');
    }
  };

  // Helper function to get user email
  const getUserEmail = () => {
    if (!order?.user) return '';
    if (typeof order.user === 'object') {
      return order.user.email;
    }
    return ''; // User is just an ID string
  };

  // Helper function to get shipping address
  const getShippingAddress = () => {
    if (order?.shipping?.address) {
      return order.shipping.address;
    }
    // Fallback to billing address or empty object
    return order?.billingAddress || {
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: ''
    };
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

  const shippingAddress = getShippingAddress();
  const userEmail = getUserEmail();
  const isPaid = order.payment?.status === 'completed';

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
       <Card className="border-l-4 border-l-blue-500">
  <CardContent className="p-6">
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Status & Tracking</h2>
        <p className="text-gray-600">Track your order in real-time</p>
      </div>
      {getStatusBadge(order.status, isPaid)}
    </div>

    {/* Enhanced Status Timeline */}
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-6">
        {[
          {
            status: 'pending',
            label: 'Order Placed',
            description: 'Your order has been received',
            icon: Clock
          },
          {
            status: 'confirmed',
            label: 'Order Confirmed',
            description: 'We\'ve confirmed your order',
            icon: CheckCircle
          },
          {
            status: 'processing',
            label: 'Processing',
            description: 'Preparing your items for shipment',
            icon: Package
          },
          {
            status: 'ready_for_shipment',
            label: 'Ready to Ship',
            description: 'Your order is packed and ready',
            icon: Package
          },
          {
            status: 'shipped',
            label: 'Shipped',
            description: 'Your order is on the way',
            icon: Truck
          },
          {
            status: 'out_for_delivery',
            label: 'Out for Delivery',
            description: 'Delivery in progress',
            icon: Truck
          },
          {
            status: 'delivered',
            label: 'Delivered',
            description: 'Order successfully delivered',
            icon: CheckCircle
          }
        ].map((step, index, array) => {
          const stepIndex = array.findIndex(s => s.status === step.status);
          const currentIndex = array.findIndex(s => s.status === order.status);
          const isCompleted = stepIndex <= currentIndex;
          const isCurrent = stepIndex === currentIndex;
          const IconComponent = step.icon;

          return (
            <div key={step.status} className="relative flex items-start gap-4">
              {/* Timeline dot */}
              <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                isCompleted
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : isCurrent
                  ? 'border-blue-500 bg-white text-blue-500'
                  : 'border-gray-300 bg-white text-gray-400'
              }`}>
                <IconComponent className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className={`flex-1 pb-6 ${index === array.length - 1 ? 'pb-0' : ''}`}>
                <div className={`p-4 rounded-lg border ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-200'
                    : isCompleted
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-semibold ${
                        isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-700'
                      }`}>
                        {step.label}
                      </h3>
                      <p className={`text-sm ${
                        isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                    {isCompleted && !isCurrent && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {isCurrent && (
                      <div className="animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Show estimated delivery for shipped status */}
                  {step.status === 'shipped' && order.shipping?.estimatedDelivery && isCompleted && (
                    <div className="mt-2 p-2 bg-white rounded border text-sm">
                      <p className="text-gray-600">
                        Estimated delivery: <span className="font-semibold">{formatDate(order.shipping.estimatedDelivery)}</span>
                      </p>
                    </div>
                  )}

                  {/* Show actual delivery for delivered status */}
                  {step.status === 'delivered' && order.shipping?.deliveredAt && isCompleted && (
                    <div className="mt-2 p-2 bg-white rounded border text-sm">
                      <p className="text-gray-600">
                        Delivered on: <span className="font-semibold">{formatDate(order.shipping.deliveredAt)}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Tracking Information */}
    {order.shipping?.trackingNumber && (
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Track Your Package
            </h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Tracking Number:</span>
                <code className="text-sm font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {order.shipping.trackingNumber}
                </code>
              </div>
              {order.shipping.carrier && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Carrier:</span>
                  <span className="text-sm font-medium text-gray-900">{order.shipping.carrier}</span>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={handleTrackPackage}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Track Package
          </Button>
        </div>
      </div>
    )}

    {/* Status History */}
    {order.statusHistory && order.statusHistory.length > 0 && (
      <div className="mt-6">
        <h3 className="font-semibold text-gray-900 mb-3">Status History</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {order.statusHistory
            .slice()
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 3)
            .map((history, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {history.status}
                  </Badge>
                  <span className="text-gray-600">{history.note}</span>
                </div>
                <span className="text-gray-500 text-xs">
                  {formatDate(history.timestamp)}
                </span>
              </div>
            ))}
        </div>
      </div>
    )}
  </CardContent>
</Card>

            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={item._id || `item-${index}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
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
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(order.pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">{formatCurrency(order.pricing.shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatCurrency(order.pricing.tax)}</span>
                  </div>
                  {order.pricing.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(order.pricing.discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">{formatCurrency(order.pricing.total)}</span>
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
                        {shippingAddress.name}
                      </p>
                      <p>{shippingAddress.street}</p>
                      <p>
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                      </p>
                      <p>{shippingAddress.country}</p>
                      {shippingAddress.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {shippingAddress.phone}
                        </p>
                      )}
                      {userEmail && (
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {userEmail}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Delivery Information</h3>
                    <div className="space-y-3">
                      {order.shipping?.estimatedDelivery && (
                        <div>
                          <p className="font-medium text-gray-900">Estimated Delivery</p>
                          <p className="text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.shipping.estimatedDelivery)}
                          </p>
                        </div>
                      )}
                      {order.shipping?.method && (
                        <div>
                          <p className="font-medium text-gray-900">Shipping Method</p>
                          <p className="text-gray-600 capitalize">{order.shipping.method.replace('_', ' ')}</p>
                        </div>
                      )}
                      {order.customerNotes && (
                        <div>
                          <p className="font-medium text-gray-900">Order Notes</p>
                          <p className="text-gray-600">{order.customerNotes}</p>
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
            <Card>
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
                  {order.shipping?.trackingNumber && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={handleTrackPackage}
                    >
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
                    {getPaymentMethodIcon(order.payment?.method)}
                    Payment Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium capitalize">{order.payment?.method?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {isPaid ? 'Paid' : order.payment?.status || 'Pending'}
                      </Badge>
                    </div>
                    {order.payment?.amount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{formatCurrency(order.payment.amount)}</span>
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
                    support@shopco.com
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    1-800-123-4567
                  </p>
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
