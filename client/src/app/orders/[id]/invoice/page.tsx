// app/orders/[id]/invoice/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Download,
  Printer,
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Globe,
  Package,
  AlertCircle,
  Truck,
  MapPin
} from 'lucide-react';
import { useGetOrderQuery } from '@/lib/services/ordersApi';

// Interface matching your actual backend Order model
interface OrderItem {
  _id: string;
  product: string | {
    _id: string;
    title: string;
    slug: string;
    images: Array<{
      public_id: string;
      url: string;
      isPrimary: boolean;
      _id: string;
    }>;
  };
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

interface InvoiceOrder {
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

export default function InvoicePage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: orderResponse, isLoading, error } = useGetOrderQuery(orderId);
  const order = orderResponse?.data as InvoiceOrder;

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  // Safe data extraction helpers
  const getProductTitle = (item: OrderItem) => {
    return item.name || 'Product';
  };

  const getProductId = (item: OrderItem) => {
    if (typeof item.product === 'string') {
      return item.product;
    }
    return item.product?._id || item.sku || 'N/A';
  };

  const getUserEmail = () => {
    if (!order?.user) return 'N/A';
    if (typeof order.user === 'object') {
      return order.user.email;
    }
    return 'N/A';
  };

  const getUserName = () => {
    if (!order?.user) return 'Customer';
    if (typeof order.user === 'object') {
      return order.user.name;
    }
    return 'Customer';
  };

  const getShippingAddress = () => {
    if (order?.shipping?.address) {
      return order.shipping.address;
    }
    return {
      name: getUserName(),
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: ''
    };
  };

  const getBillingAddress = () => {
    if (order?.billingAddress) {
      return order.billingAddress;
    }
    return getShippingAddress();
  };

  const isPaid = order?.payment?.status === 'completed';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Generating invoice...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error ? 'Failed to load invoice' : 'The invoice you are looking for does not exist.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={`/orders/${orderId}`}>
                <Button className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Order
                </Button>
              </Link>
              <Link href="/orders">
                <Button variant="outline" className="gap-2">
                  <Package className="w-4 h-4" />
                  View All Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const shippingAddress = getShippingAddress();
  const billingAddress = getBillingAddress();
  const userEmail = getUserEmail();

  return (
    <div className="min-h-screen bg-white py-8 print:py-0">
      <div className="max-w-4xl mx-auto px-4 print:max-w-none print:px-0">
        {/* Print Controls - Hidden when printing */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Link href={`/orders/${orderId}`}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Order
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print Invoice
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <Card className="border-2 print:border-0 print:shadow-none">
          <CardContent className="p-8 print:p-12">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-gray-600 mt-2">Order #{order.orderNumber}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {isPaid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-2">
                  SNKRS
                </div>
                <p className="text-sm text-gray-600">Sneaker Shop Inc.</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Company and Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  From:
                </h3>
                <div className="text-gray-600 space-y-1">
                  <p className="font-semibold">Sneaker Shop Inc.</p>
                  <p>123 Commerce Street</p>
                  <p>New York, NY 10001</p>
                  <p>United States</p>
                  <p className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    +1 (555) 123-4567
                  </p>
                  <p className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    support@sneakershop.com
                  </p>
                  <p className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    www.sneakershop.com
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Bill To:
                </h3>
                <div className="text-gray-600 space-y-1">
                  <p className="font-semibold">{billingAddress.name}</p>
                  <p>{billingAddress.street}</p>
                  <p>
                    {billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}
                  </p>
                  <p>{billingAddress.country}</p>
                  {billingAddress.phone && <p>{billingAddress.phone}</p>}
                  <p>{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Invoice Date</p>
                <p className="font-semibold">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-semibold">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Invoice #</p>
                <p className="font-semibold">INV-{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <p className="font-semibold capitalize">{order.status.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-900">Product</th>
                      <th className="text-left p-4 font-semibold text-gray-900">Details</th>
                      <th className="text-right p-4 font-semibold text-gray-900">Qty</th>
                      <th className="text-right p-4 font-semibold text-gray-900">Unit Price</th>
                      <th className="text-right p-4 font-semibold text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={item._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-900">{getProductTitle(item)}</p>
                            <p className="text-sm text-gray-600">
                              SKU: {getProductId(item)}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          {(item.variant?.size || item.variant?.color) && (
                            <div className="text-sm text-gray-600">
                              {item.variant?.size && <span>Size: {item.variant.size}</span>}
                              {item.variant?.size && item.variant?.color && <span> • </span>}
                              {item.variant?.color && <span>Color: {item.variant.color}</span>}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right text-gray-600">{item.quantity}</td>
                        <td className="p-4 text-right text-gray-600">{formatCurrency(item.price)}</td>
                        <td className="p-4 text-right font-medium text-gray-900">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-3">
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
            </div>

            {/* Payment Status */}
            <div className={`mt-8 p-4 rounded-lg border ${
              isPaid
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-semibold ${
                    isPaid ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    Payment Status: {order.payment?.status || 'pending'}
                  </p>
                  <p className={`text-sm ${
                    isPaid ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {isPaid
                      ? `Thank you for your business. Payment was completed successfully.`
                      : 'Your payment is pending. Please complete the payment to process your order.'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold capitalize">{order.payment?.method?.replace('_', ' ') || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            {order.customerNotes && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Customer Notes</h4>
                <p className="text-blue-700 text-sm">{order.customerNotes}</p>
              </div>
            )}

            {/* Shipping Information */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Shipping Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p><strong>Method:</strong> {order.shipping?.method || 'Standard'}</p>
                  {order.shipping?.carrier && <p><strong>Carrier:</strong> {order.shipping.carrier}</p>}
                  {order.shipping?.trackingNumber && (
                    <p><strong>Tracking #:</strong> {order.shipping.trackingNumber}</p>
                  )}
                </div>
                <div>
                  {order.shipping?.estimatedDelivery && (
                    <p><strong>Estimated Delivery:</strong> {formatDate(order.shipping.estimatedDelivery)}</p>
                  )}
                  {order.shipping?.shippedAt && (
                    <p><strong>Shipped On:</strong> {formatDate(order.shipping.shippedAt)}</p>
                  )}
                  {shippingAddress.street && (
                    <div className="mt-2">
                      <p><strong>Shipping Address:</strong></p>
                      <p>{shippingAddress.name}</p>
                      <p>{shippingAddress.street}</p>
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                      <p>{shippingAddress.country}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
              <p className="font-semibold">Thank you for choosing Sneaker Shop Inc.</p>
              <p className="mt-2">
                If you have any questions about this invoice, please contact our support team at support@sneakershop.com
              </p>
              <p className="mt-1">📞 1-800-123-4567 | 🕒 Mon-Fri 9AM-6PM EST</p>
              <p className="mt-4 font-medium">www.sneakershop.com</p>
              <p className="mt-2 text-xs text-gray-500">
                Invoice generated on {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            font-size: 12px;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:border-0 {
            border: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-12 {
            padding: 3rem !important;
          }
        }

        @page {
          margin: 0.5in;
          size: letter;
        }
      `}</style>
    </div>
  );
}
