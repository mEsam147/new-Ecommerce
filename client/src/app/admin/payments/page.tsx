// src/app/admin/payments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Search, Filter, DollarSign, CheckCircle, XCircle, Clock, Download } from 'lucide-react';

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  createdAt: string;
  customer: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setTimeout(() => {
      setPayments(generateMockPayments());
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paymentStats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor payment transactions
          </p>
        </div>
        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors">
          <Download size={20} />
          Export Payments
        </button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Payments"
          value={paymentStats.total.toString()}
          description="All transactions"
          icon={<DollarSign className="w-8 h-8" />}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={paymentStats.completed.toString()}
          description="Successful payments"
          icon={<CheckCircle className="w-8 h-8" />}
          color="green"
        />
        <StatCard
          title="Pending"
          value={paymentStats.pending.toString()}
          description="Awaiting processing"
          icon={<Clock className="w-8 h-8" />}
          color="yellow"
        />
        <StatCard
          title="Total Amount"
          value={`$${paymentStats.totalAmount.toLocaleString()}`}
          description="Processed value"
          icon={<DollarSign className="w-8 h-8" />}
          color="purple"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search payments by order ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Filter size={20} />
              More Filters
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4">Payment ID</th>
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Method</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{payment.id}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-blue-600 font-medium">{payment.orderId}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{payment.customer}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">{payment.currency}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {payment.method}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, description, icon, color }: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'green', icon: <CheckCircle size={14} />, text: 'Completed' };
      case 'pending':
        return { color: 'yellow', icon: <Clock size={14} />, text: 'Pending' };
      case 'failed':
        return { color: 'red', icon: <XCircle size={14} />, text: 'Failed' };
      case 'refunded':
        return { color: 'blue', icon: <DollarSign size={14} />, text: 'Refunded' };
      default:
        return { color: 'gray', icon: null, text: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      config.color === 'green' ? 'bg-green-100 text-green-800' :
      config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
      config.color === 'red' ? 'bg-red-100 text-red-800' :
      config.color === 'blue' ? 'bg-blue-100 text-blue-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {config.icon}
      {config.text}
    </span>
  );
}

function generateMockPayments(): Payment[] {
  const statuses = ['completed', 'pending', 'failed', 'refunded'];
  const methods = ['Credit Card', 'PayPal', 'Stripe', 'Bank Transfer'];
  const customers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];

  return Array.from({ length: 20 }, (_, i) => ({
    id: `pay-${1000 + i + 1}`,
    orderId: `ORD-${2000 + i + 1}`,
    amount: Math.floor(Math.random() * 1000) + 50,
    currency: 'USD',
    status: statuses[Math.floor(Math.random() * statuses.length)],
    method: methods[Math.floor(Math.random() * methods.length)],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    customer: customers[Math.floor(Math.random() * customers.length)],
  }));
}
