// src/app/admin/analytics/advanced/page.tsx
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
  ComposedChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Download, Calendar, Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AdvancedAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setChartData(generateAdvancedChartData(timeRange));
      setIsLoading(false);
    }, 1500);
  }, [timeRange]);

  if (isLoading || !chartData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const {
    salesPerformance,
    customerAnalytics,
    productPerformance,
    revenueStreams,
    geographicData,
    customerLifetimeValue,
    conversionFunnel,
  } = chartData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-2">
            Deep insights and comprehensive business intelligence
          </p>
        </div>
        <div className="flex gap-3">
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
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value="$125,430"
          change="+12.5%"
          trend="up"
          icon={<DollarSign className="w-6 h-6" />}
        />
        <MetricCard
          title="New Customers"
          value="892"
          change="+8.2%"
          trend="up"
          icon={<Users className="w-6 h-6" />}
        />
        <MetricCard
          title="Total Orders"
          value="1,843"
          change="+15.3%"
          trend="up"
          icon={<ShoppingCart className="w-6 h-6" />}
        />
        <MetricCard
          title="Conversion Rate"
          value="3.8%"
          change="+0.6%"
          trend="up"
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={salesPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="Sales ($)" />
                <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#ff7300" name="Growth (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition & Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={customerAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="new" stackId="1" stroke="#8884d8" fill="#8884d8" name="New Customers" />
                <Area type="monotone" dataKey="returning" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Returning Customers" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Streams */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueStreams}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueStreams.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Performance Treemap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Performance Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={productPerformance}
                dataKey="value"
                ratio={4/3}
                stroke="#fff"
                fill="#8884d8"
              >
                <Tooltip formatter={(value, name) => [`$${value}`, name]} />
              </Treemap>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Lifetime Value */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={customerLifetimeValue}>
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
                  name="Industry Avg"
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

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={conversionFunnel}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Conversion Rate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Geographic Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {geographicData.map((region, index) => (
                <div key={region.name} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    ${region.revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{region.name}</div>
                  <div className={`text-sm font-medium ${
                    region.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {region.growth >= 0 ? '+' : ''}{region.growth}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, trend, icon }: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className={`text-sm mt-1 ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change} from last period
            </p>
          </div>
          <div className="text-blue-600 bg-blue-50 p-3 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function generateAdvancedChartData(timeRange: string) {
  return {
    salesPerformance: [
      { month: 'Jan', sales: 4000, growth: 12 },
      { month: 'Feb', sales: 3000, growth: 8 },
      { month: 'Mar', sales: 2000, growth: 5 },
      { month: 'Apr', sales: 2780, growth: 15 },
      { month: 'May', sales: 1890, growth: 10 },
      { month: 'Jun', sales: 2390, growth: 18 },
    ],
    customerAnalytics: [
      { month: 'Jan', new: 120, returning: 80 },
      { month: 'Feb', new: 150, returning: 90 },
      { month: 'Mar', new: 180, returning: 120 },
      { month: 'Apr', new: 200, returning: 150 },
      { month: 'May', new: 220, returning: 180 },
      { month: 'Jun', new: 250, returning: 200 },
    ],
    productPerformance: [
      { name: 'Electronics', value: 35000 },
      { name: 'Clothing', value: 28000 },
      { name: 'Home & Garden', value: 15000 },
      { name: 'Sports', value: 12000 },
      { name: 'Books', value: 8000 },
      { name: 'Beauty', value: 6000 },
    ],
    revenueStreams: [
      { name: 'Online Sales', value: 65000 },
      { name: 'In-Store', value: 35000 },
      { name: 'Wholesale', value: 20000 },
      { name: 'Subscriptions', value: 15000 },
    ],
    geographicData: [
      { name: 'North America', revenue: 65000, growth: 12 },
      { name: 'Europe', revenue: 45000, growth: 8 },
      { name: 'Asia Pacific', revenue: 35000, growth: 25 },
      { name: 'Other Regions', revenue: 15000, growth: 5 },
    ],
    customerLifetimeValue: [
      { subject: 'Acquisition', A: 120, B: 110 },
      { subject: 'Retention', A: 98, B: 90 },
      { subject: 'Revenue', A: 86, B: 130 },
      { subject: 'Referral', A: 99, B: 100 },
      { subject: 'Engagement', A: 85, B: 90 },
    ],
    conversionFunnel: [
      { name: 'Website Visitors', value: 100 },
      { name: 'Product Views', value: 45 },
      { name: 'Add to Cart', value: 20 },
      { name: 'Checkout Started', value: 8 },
      { name: 'Purchases', value: 3.8 },
    ],
  };
}
