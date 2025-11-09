// src/app/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setChartData(generateChartData(timeRange));
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  if (isLoading || !chartData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const {
    salesOverTime,
    revenueByCategory,
    customerData,
    performanceMetrics,
    trafficSources,
    productPerformance,
  } = chartData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Detailed insights and performance metrics for your store
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => {
            setTimeRange(e.target.value);
            setIsLoading(true);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Conversion Rate"
          value="3.2%"
          change="+0.4%"
          trend="up"
        />
        <MetricCard
          title="Avg. Order Value"
          value="$156.80"
          change="+$12.50"
          trend="up"
        />
        <MetricCard
          title="Customer Lifetime Value"
          value="$1,240"
          change="+$85"
          trend="up"
        />
        <MetricCard
          title="Cart Abandonment Rate"
          value="68.2%"
          change="-2.1%"
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales & Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={salesOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="Sales ($)"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                  name="Revenue ($)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stackId="3"
                  stroke="#ffc658"
                  fill="#ffc658"
                  fillOpacity={0.3}
                  name="Profit ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                <Bar dataKey="growth" fill="#82ca9d" name="Growth (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="new"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="New Customers"
                />
                <Line
                  type="monotone"
                  dataKey="returning"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Returning Customers"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#ffc658"
                  strokeWidth={2}
                  name="Total Customers"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar
                  name="Current"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Target"
                  dataKey="B"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                <Bar dataKey="units" fill="#82ca9d" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, trend }: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change} from last period
        </p>
      </CardContent>
    </Card>
  );
}

function generateChartData(timeRange: string) {
  // This would be replaced with actual API data
  return {
    salesOverTime: [
      { date: 'Jan', sales: 4000, revenue: 4200, profit: 800 },
      { date: 'Feb', sales: 3000, revenue: 3200, profit: 600 },
      { date: 'Mar', sales: 2000, revenue: 2200, profit: 400 },
      { date: 'Apr', sales: 2780, revenue: 3000, profit: 580 },
      { date: 'May', sales: 1890, revenue: 2000, profit: 390 },
      { date: 'Jun', sales: 2390, revenue: 2500, profit: 490 },
    ],
    revenueByCategory: [
      { category: 'Electronics', revenue: 35000, growth: 12 },
      { category: 'Clothing', revenue: 28000, growth: 8 },
      { category: 'Home & Garden', revenue: 15000, growth: 15 },
      { category: 'Sports', revenue: 12000, growth: 5 },
      { category: 'Books', revenue: 8000, growth: 20 },
    ],
    customerData: [
      { month: 'Jan', new: 120, returning: 80, total: 200 },
      { month: 'Feb', new: 150, returning: 90, total: 240 },
      { month: 'Mar', new: 180, returning: 120, total: 300 },
      { month: 'Apr', new: 200, returning: 150, total: 350 },
      { month: 'May', new: 220, returning: 180, total: 400 },
      { month: 'Jun', new: 250, returning: 200, total: 450 },
    ],
    performanceMetrics: [
      { subject: 'Sales', A: 120, B: 110 },
      { subject: 'Marketing', A: 98, B: 130 },
      { subject: 'Development', A: 86, B: 130 },
      { subject: 'Support', A: 99, B: 100 },
      { subject: 'Research', A: 85, B: 90 },
      { subject: 'Finance', A: 65, B: 85 },
    ],
    trafficSources: [
      { name: 'Direct', value: 35 },
      { name: 'Social', value: 25 },
      { name: 'Email', value: 20 },
      { name: 'Search', value: 15 },
      { name: 'Referral', value: 5 },
    ],
    productPerformance: [
      { name: 'iPhone 15 Pro', revenue: 87911, units: 89 },
      { name: 'MacBook Air M2', revenue: 65433, units: 67 },
      { name: 'AirPods Pro', revenue: 24800, units: 124 },
      { name: 'iPad Air', revenue: 22500, units: 45 },
      { name: 'Apple Watch', revenue: 23400, units: 78 },
    ],
  };
}
