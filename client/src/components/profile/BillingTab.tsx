// components/profile/BillingTab.tsx
'use client';

import React, { useState } from 'react';
import { useBilling } from '@/lib/hooks/useBilling';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CreditCard,
  DollarSign,
  ShoppingBag,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Calendar,
  Receipt,
  Shield,
  TrendingUp,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import * as motion from 'framer-motion/client';

export const BillingTab: React.FC = () => {
  const {
    payments,
    stats,
    paymentMethods,
    isLoading,
    requestRefund,
    downloadInvoice,
    isRequestingRefund,
    isDownloadingInvoice,
  } = useBilling();

  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [paymentToRefund, setPaymentToRefund] = useState<{ id: string; amount: number; orderNumber: string } | null>(null);
  const [refundReason, setRefundReason] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get status badge configuration
  const getStatusConfig = (status: string) => {
    const config = {
      succeeded: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Paid' },
      processing: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: RefreshCw, label: 'Processing' },
      requires_payment_method: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: CreditCard, label: 'Payment Required' },
      requires_action: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Shield, label: 'Action Required' },
      canceled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Canceled' },
      failed: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Failed' },
      default: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CreditCard, label: 'Pending' }
    };

    return config[status as keyof typeof config] || config.default;
  };

  // Handle refund request
  const handleRefundClick = (paymentId: string, amount: number, orderNumber: string) => {
    setPaymentToRefund({ id: paymentId, amount, orderNumber });
    setRefundModalOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (paymentToRefund && refundReason.trim()) {
      const result = await requestRefund(paymentToRefund.id, refundReason);
      if (result.success) {
        setRefundModalOpen(false);
        setPaymentToRefund(null);
        setRefundReason('');
      }
    }
  };

  // Check if refund is allowed
  const canRequestRefund = (payment: any) => {
    // Check if payment is successful
    if (payment.status !== 'succeeded') return false;

    // Check if already has refunds
    if (payment.refunds && payment.refunds.length > 0) {
      const hasActiveRefund = payment.refunds.some((refund: any) =>
        refund.status === 'succeeded' || refund.status === 'pending'
      );
      if (hasActiveRefund) return false;
    }

    // Check if within 30 days
    const paymentDate = new Date(payment.createdAt);
    const daysSincePayment = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSincePayment <= 30;
  };

  // Handle invoice download
  const handleDownloadInvoice = async (paymentId: string) => {
    await downloadInvoice(paymentId);
  };

  // Calculate total refunded amount
  const getTotalRefunded = (payment: any) => {
    if (!payment.refunds || payment.refunds.length === 0) return 0;
    return payment.refunds.reduce((total: number, refund: any) => {
      return refund.status === 'succeeded' ? total + refund.amount : total;
    }, 0);
  };

  if (isLoading) {
    return <BillingSkeleton />;
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Billing Statistics */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Billing Overview
              </CardTitle>
              <CardDescription>
                Your payment history and spending summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.totalSpent || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <ShoppingBag className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalOrders || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.successfulPayments || 0}
                  </div>
                  <div className="text-sm text-gray-600">Successful Payments</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(stats.averageOrderValue || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Average Order</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Your saved payment methods for faster checkout
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {method.card?.brand ?
                            `${method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)} •••• ${method.card.last4}` :
                            'PayPal Account'
                          }
                        </div>
                        {method.card && (
                          <div className="text-sm text-gray-500">
                            Expires {method.card.exp_month.toString().padStart(2, '0')}/{method.card.exp_year}
                          </div>
                        )}
                      </div>
                      {method.isDefault && (
                        <Badge variant="default" className="ml-2">
                          Default
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/settings/payment-methods">
                        Manage
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No payment methods saved</p>
                <Button asChild>
                  <Link href="/settings/payment-methods">
                    Add Payment Method
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Payment History
                  {payments.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {payments.length} {payments.length === 1 ? 'payment' : 'payments'}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Your complete payment transaction history
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order & Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-center">Method</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => {
                      const statusConfig = getStatusConfig(payment.status);
                      const StatusIcon = statusConfig.icon;
                      const totalRefunded = getTotalRefunded(payment);
                      const hasRefunds = totalRefunded > 0;

                      return (
                        <motion.tr
                          key={payment._id}
                          variants={itemVariants}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          {/* Order Info */}
                          <TableCell>
                            <div className="space-y-1">
                              <Link
                                href={`/orders/${payment.order?._id || '#'}`}
                                className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                              >
                                {payment.order?.orderNumber || `Payment ${payment._id.slice(-8)}`}
                              </Link>
                              <div className="text-sm text-gray-500">
                                {payment.order?.items?.length || 0} item{payment.order?.items?.length !== 1 ? 's' : ''}
                                {payment.order?.items?.[0]?.name && (
                                  <span className="ml-1">• {payment.order.items[0].name}</span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Amount */}
                          <TableCell>
                            <div className="space-y-1">
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(payment.amount, payment.currency)}
                              </span>
                              {hasRefunds && (
                                <div className="text-xs text-red-600">
                                  Refunded: {formatCurrency(totalRefunded, payment.currency)}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Payment Method */}
                          <TableCell className="text-center">
                            <Badge variant="outline" className="capitalize">
                              {payment.paymentMethod === 'card' ? 'Credit Card' : payment.paymentMethod}
                            </Badge>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="text-center">
                            <Badge className={statusConfig.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>

                          {/* Date */}
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {formatDate(payment.createdAt)}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {payment.receiptUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(payment.receiptUrl, '_blank')}
                                  disabled={isDownloadingInvoice}
                                >
                                  <Receipt className="w-3 h-3 mr-1" />
                                  Receipt
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadInvoice(payment._id)}
                                disabled={isDownloadingInvoice}
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                Invoice
                              </Button>
                              {canRequestRefund(payment) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRefundClick(
                                    payment._id,
                                    payment.amount,
                                    payment.order?.orderNumber || `Payment ${payment._id.slice(-8)}`
                                  )}
                                  className="text-orange-600 hover:text-orange-700 hover:border-orange-300"
                                  disabled={isRequestingRefund}
                                >
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Refund
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No payment history</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Your payment history will appear here after you make your first purchase.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/shop">
                      Start Shopping
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/orders">
                      View Orders
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Refund Request Modal */}
      <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <RefreshCw className="w-5 h-5" />
              Request Refund
            </DialogTitle>
            <DialogDescription>
              You are requesting a refund for order <strong>{paymentToRefund?.orderNumber}</strong>
              {' '}amounting to <strong>{formatCurrency(paymentToRefund?.amount || 0)}</strong>.
              Please provide a reason for your refund request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Please describe why you are requesting a refund..."
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <div className="text-sm text-gray-500">
              Refund requests are typically processed within 5-7 business days.
              You can only request refunds for payments made within the last 30 days.
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setRefundModalOpen(false);
                setRefundReason('');
              }}
              disabled={isRequestingRefund}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleConfirmRefund}
              disabled={!refundReason.trim() || isRequestingRefund}
              className="text-orange-600 hover:text-orange-700 hover:border-orange-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isRequestingRefund ? 'Processing...' : 'Request Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Billing Skeleton Component
const BillingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Statistics Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(6)].map((_, i) => (
                    <TableHead key={i}>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
