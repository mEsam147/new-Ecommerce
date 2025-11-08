// components/profile/OrdersSummary.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrdersSummaryProps {
  summary: {
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    deliveredOrders: number;
    statusCounts: Record<string, number>;
  };
  className?: string;
}

export const OrdersSummary: React.FC<OrdersSummaryProps> = ({ summary, className }) => {
  const stats = [
    {
      label: 'Total Orders',
      value: summary.totalOrders,
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
      description: 'All time orders'
    },
    {
      label: 'Total Spent',
      value: `$${summary.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
      description: 'Total amount spent'
    },
    {
      label: 'Pending',
      value: summary.pendingOrders,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100',
      description: 'Awaiting processing'
    },
    {
      label: 'Delivered',
      value: summary.deliveredOrders,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
      description: 'Successfully delivered'
    }
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-orange-100 text-orange-800 border-orange-200',
    shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-gray-100 text-gray-800 border-gray-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {stats.map((stat, index) => (
        <Card key={stat.label} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <div className={cn('p-2 rounded-full', stat.color)}>
              <stat.icon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}

      {/* Status Breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Order Status Breakdown
          </CardTitle>
          <CardDescription>
            Distribution of your orders by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.statusCounts).map(([status, count]) => (
              <Badge
                key={status}
                variant="secondary"
                className={cn(
                  'border px-3 py-1 text-sm capitalize',
                  statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
                )}
              >
                {status}: {count}
              </Badge>
            ))}
            {Object.keys(summary.statusCounts).length === 0 && (
              <p className="text-sm text-gray-500">No orders to display</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
