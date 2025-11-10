'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrders } from '@/lib/hooks/useOrders';

export const OrdersSummary: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { ordersSummary, isLoadingOrders } = useOrders();

  if (isLoadingOrders) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-gray-500 text-sm animate-pulse">
          Loading order summary...
        </p>
      </div>
    );
  }

  const summary = ordersSummary || {
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    statusCounts: {},
  };

  const stats = [
    {
      label: 'Total Orders',
      value: summary.totalOrders,
      icon: Package,
      color: 'bg-blue-50 text-blue-700',
      ring: 'ring-blue-200',
      description: 'All time orders',
    },
    {
      label: 'Total Spent',
      value: `$${summary.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-50 text-green-700',
      ring: 'ring-green-200',
      description: 'Total spent on orders',
    },
    {
      label: 'Pending Orders',
      value: summary.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-700',
      ring: 'ring-yellow-200',
      description: 'Awaiting processing',
    },
    {
      label: 'Delivered Orders',
      value: summary.deliveredOrders,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700',
      ring: 'ring-emerald-200',
      description: 'Successfully delivered',
    },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-orange-100 text-orange-800 border-orange-200',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-gray-100 text-gray-800 border-gray-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusEntries = Object.entries(summary.statusCounts || {});
  const hasStatusData = statusEntries.length > 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Section */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={cn(
              'relative overflow-hidden shadow-md hover:shadow-lg transition-shadow border-0 ring-1 rounded-2xl',
              stat.ring
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stat.label}
                </CardTitle>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
              <div className={cn('p-2 rounded-full', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-gray-900">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Breakdown Section */}
      <Card className="shadow-md border-0 rounded-2xl">
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Order Status Breakdown
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Distribution of your orders by status
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-3">
            {hasStatusData ? (
              statusEntries.map(([status, count]) => (
                <Badge
                  key={status}
                  variant="secondary"
                  className={cn(
                    'border px-3 py-1.5 text-sm font-medium capitalize rounded-lg',
                    statusColors[status] ||
                      'bg-gray-100 text-gray-800 border-gray-200'
                  )}
                >
                  {status.replace('_', ' ')}: {count}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500">No order data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
