// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAdmin } from '@/lib/hooks/useAdmin';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboard() {
  const { dashboardData, isLoading, refreshDashboard } = useAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const {
    overview,
    salesData,
    revenueData,
    categoryData,
    recentActivity,
    topProducts,
  } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">
            Welcome to your admin dashboard. Here's what's happening with your store today.
          </p>
        </div>
        <button
          onClick={refreshDashboard}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${overview.totalRevenue.toLocaleString()}`}
          description="+20.1% from last month"
          icon="💰"
          trend="up"
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={overview.totalOrders.toLocaleString()}
          description="+12.4% from last month"
          icon="📦"
          trend="up"
          color="green"
        />
        <StatCard
          title="Total Customers"
          value={overview.totalCustomers.toLocaleString()}
          description="+8.2% from last month"
          icon="👥"
          trend="up"
          color="purple"
        />
        <StatCard
          title="Total Products"
          value={overview.totalProducts.toLocaleString()}
          description="+5.3% from last month"
          icon="📱"
          trend="up"
          color="orange"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Conversion Rate"
          value={`${overview.conversionRate}%`}
          description="+2.1% from last month"
          icon="📊"
          trend="up"
          color="blue"
        />
        <StatCard
          title="Avg. Order Value"
          value={`$${overview.averageOrderValue}`}
          description="+$12.50 from last month"
          icon="🛒"
          trend="up"
          color="green"
        />
        <StatCard
          title="Pending Orders"
          value={overview.pendingOrders.toLocaleString()}
          description="Need attention"
          icon="⏳"
          trend="neutral"
          color="yellow"
        />
        <StatCard
          title="Low Stock Items"
          value={overview.lowStockItems.toLocaleString()}
          description="Require restocking"
          icon="⚠️"
          trend="down"
          color="red"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Orders Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales & Orders Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="Sales ($)" />
                <Bar yAxisId="right" dataKey="orders" fill="#82ca9d" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="Revenue ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categories Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${product.revenue}</p>
                    <p className="text-sm text-green-600">+{product.growth}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'order' ? 'bg-blue-500' :
                    activity.type === 'user' ? 'bg-green-500' :
                    activity.type === 'product' ? 'bg-purple-500' :
                    'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                    activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {activity.priority}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Enhanced Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
}

function StatCard({ title, value, description, icon, trend, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            <p className={`text-sm ${
              trend === 'up' ? 'text-green-600' :
              trend === 'down' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {trendIcons[trend]} {description}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
