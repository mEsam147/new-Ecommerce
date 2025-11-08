// components/profile/OrdersTab.tsx
'use client';

import React, { useState } from 'react';
import { useOrders } from '@/lib/hooks/useOrders';
import { OrdersSummary } from '../checkout/OrderSummary';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  ShoppingCart,
  Filter,
  Download
} from 'lucide-react';
import Link from 'next/link';
import * as motion from 'framer-motion/client';

export const OrdersTab: React.FC = () => {
  const { orders, ordersSummary, isLoading: ordersLoading, cancelOrder, isCancellingOrder } = useOrders();
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const getStatusConfig = (status: string) => {
    const config = {
      delivered: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Delivered'
      },
      shipped: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Truck,
        label: 'Shipped'
      },
      processing: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Clock,
        label: 'Processing'
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        label: 'Confirmed'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Pending'
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle,
        label: 'Cancelled'
      },
      refunded: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: AlertCircle,
        label: 'Refunded'
      },
      failed: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle,
        label: 'Failed'
      },
      default: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Package,
        label: 'Unknown'
      }
    };

    return config[status as keyof typeof config] || config.default;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (window.confirm(`Are you sure you want to cancel order ${orderNumber}?`)) {
      await cancelOrder(orderId, 'User requested cancellation');
    }
  };

  const canCancelOrder = (status: string) => {
    return ['pending', 'confirmed', 'processing'].includes(status);
  };

  const canTrackOrder = (status: string) => {
    return ['shipped', 'delivered'].includes(status);
  };

  // Filter orders based on status
  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter);

  const statusFilters = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'pending', label: 'Pending', count: ordersSummary.statusCounts.pending || 0 },
    { value: 'processing', label: 'Processing', count: ordersSummary.statusCounts.processing || 0 },
    { value: 'shipped', label: 'Shipped', count: ordersSummary.statusCounts.shipped || 0 },
    { value: 'delivered', label: 'Delivered', count: ordersSummary.statusCounts.delivered || 0 },
    { value: 'cancelled', label: 'Cancelled', count: ordersSummary.statusCounts.cancelled || 0 },
  ];

  if (ordersLoading) {
    return <OrdersSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Orders Summary */}
      <OrdersSummary summary={ordersSummary} />

      {/* Orders List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order History
                {filteredOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage and track your orders
              </CardDescription>
            </div>

            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm" asChild>
                <Link href="/shop">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Shop More
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 pt-4">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "relative",
                  filter.count === 0 && "opacity-50 cursor-not-allowed"
                )}
                disabled={filter.count === 0 && filter.value !== 'all'}
              >
                {filter.label}
                {filter.count > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-white text-gray-700"
                  >
                    {filter.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={order.id}
                  variants={itemVariants}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {order.orderNumber}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                      {order.paidAt && (
                        <p className="text-sm text-green-600">
                          Paid on {formatDate(order.paidAt)}
                        </p>
                      )}
                    </div>
                    <Badge className={cn("mt-2 sm:mt-0 border", statusConfig.color)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Total Amount</span>
                      <span className="font-semibold text-lg text-gray-900">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Items</span>
                      <span className="font-semibold">
                        {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Shipping</span>
                      <span className="font-semibold capitalize">
                        {order.shippingMethod}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">
                        {order.trackingNumber ? 'Tracking' : 'Order ID'}
                      </span>
                      <span className="font-semibold font-mono text-sm">
                        {order.trackingNumber || order.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/orders/${order.id}`} className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        View Details
                      </Link>
                    </Button>

                    {order.status === 'delivered' && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/shop" className="flex items-center gap-1">
                          <ShoppingCart className="w-3 h-3" />
                          Buy Again
                        </Link>
                      </Button>
                    )}

                    {canCancelOrder(order.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                        disabled={isCancellingOrder}
                        className="text-red-600 hover:text-red-700 hover:border-red-300 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {isCancellingOrder ? 'Cancelling...' : 'Cancel Order'}
                      </Button>
                    )}

                    {canTrackOrder(order.status) && order.trackingNumber && (
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={`/tracking/${order.trackingNumber}`}
                          className="flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          Track Package
                        </Link>
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && !ordersLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {statusFilter === 'all'
                  ? 'When you place your first order, it will appear here. Start exploring our products and find something you love!'
                  : `You don't have any ${statusFilter} orders at the moment.`
                }
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/shop">
                    Start Shopping
                  </Link>
                </Button>
                {statusFilter !== 'all' && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStatusFilter('all')}
                  >
                    View All Orders
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Orders Skeleton Component
const OrdersSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Summary Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders List Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mt-2 sm:mt-0" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-3">
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
