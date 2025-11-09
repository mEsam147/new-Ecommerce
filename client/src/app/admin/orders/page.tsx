// src/app/admin/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Order } from '@/types';
import { Eye, Search, Filter, Download, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setOrders(generateMockOrders());
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesDate = !dateFilter || order.createdAt.includes(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.totalPrice, 0);

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
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">
            Manage and track customer orders and shipments
          </p>
        </div>
        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors">
          <Download size={20} />
          Export Orders
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className={`bg-white p-4 rounded-lg border cursor-pointer transition-all ${
              statusFilter === status
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200 hover:shadow-md'
            }`}
            onClick={() => setStatusFilter(status)}
          >
            <p className="text-sm text-gray-600 capitalize">{status}</p>
            <p className="text-2xl font-bold text-gray-900">{count}</p>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Revenue</p>
              <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
              <p className="text-blue-100 mt-2">From {orders.length} orders</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders by ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Filter size={20} />
              More Filters
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order List ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Items</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Payment</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                    <td className="py-3 px-4">
                      <p className="font-medium text-blue-600">{order.orderNumber}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{order.user}</p>
                      <p className="text-sm text-gray-500">{order.shippingAddress.city}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.items.length} items
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          ${order.pricing.totalPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircle size={16} />
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <XCircle size={16} />
                        </button>
                      </div>
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

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return <Clock size={16} className="text-yellow-500" />;
    case 'confirmed':
    case 'processing':
      return <CheckCircle size={16} className="text-blue-500" />;
    case 'shipped':
      return <Truck size={16} className="text-purple-500" />;
    case 'delivered':
      return <CheckCircle size={16} className="text-green-500" />;
    case 'cancelled':
      return <XCircle size={16} className="text-red-500" />;
    default:
      return <Clock size={16} className="text-gray-500" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'text-yellow-800 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium';
    case 'confirmed':
    case 'processing':
      return 'text-blue-800 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium';
    case 'shipped':
      return 'text-purple-800 bg-purple-100 px-2 py-1 rounded-full text-xs font-medium';
    case 'delivered':
      return 'text-green-800 bg-green-100 px-2 py-1 rounded-full text-xs font-medium';
    case 'cancelled':
      return 'text-red-800 bg-red-100 px-2 py-1 rounded-full text-xs font-medium';
    default:
      return 'text-gray-800 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium';
  }
}

function generateMockOrders(): Order[] {
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const customers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];

  return Array.from({ length: 20 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const totalPrice = Math.floor(Math.random() * 1000) + 50;

    return {
      id: `order-${i + 1}`,
      orderNumber: `ORD-${1000 + i + 1}`,
      user: customer,
      items: Array.from({ length: itemCount }, (_, j) => ({
        product: `prod-${j + 1}`,
        name: `Product ${j + 1}`,
        price: Math.floor(totalPrice / itemCount),
        quantity: 1,
        totalPrice: Math.floor(totalPrice / itemCount)
      })),
      status: status as any,
      pricing: {
        itemsPrice: totalPrice,
        shippingPrice: 10,
        taxPrice: totalPrice * 0.08,
        totalPrice: totalPrice + 10 + (totalPrice * 0.08)
      },
      shippingAddress: {
        name: customer,
        street: '123 Main St',
        city: city,
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      paymentMethod: Math.random() > 0.5 ? 'Credit Card' : 'PayPal',
      isPaid: Math.random() > 0.2,
      paidAt: Math.random() > 0.2 ? new Date().toISOString() : undefined,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  });
}
