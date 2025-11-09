// src/lib/hooks/useAdmin.ts
import { useState, useEffect, useCallback } from 'react';

interface DashboardData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    conversionRate: number;
    averageOrderValue: number;
    pendingOrders: number;
    lowStockItems: number;
  };
  salesData: Array<{
    month: string;
    sales: number;
    orders: number;
  }>;
  revenueData: Array<{
    month: string;
    revenue: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
  }>;
  recentActivity: Array<{
    action: string;
    time: string;
    type: string;
    priority: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
}

export function useAdmin() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      lowStockItems: 0,
    },
    salesData: [],
    revenueData: [],
    categoryData: [],
    recentActivity: [],
    topProducts: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Replace with actual API calls
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        // Fallback to mock data
        setDashboardData(getMockDashboardData());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data
      setDashboardData(getMockDashboardData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refreshDashboard = () => {
    fetchDashboardData();
  };

  return {
    dashboardData,
    isLoading,
    refreshDashboard,
  };
}

// Mock data generator
function getMockDashboardData(): DashboardData {
  return {
    overview: {
      totalRevenue: 125430,
      totalOrders: 1843,
      totalCustomers: 892,
      totalProducts: 156,
      conversionRate: 3.2,
      averageOrderValue: 156.80,
      pendingOrders: 23,
      lowStockItems: 8,
    },
    salesData: [
      { month: 'Jan', sales: 4000, orders: 240 },
      { month: 'Feb', sales: 3000, orders: 139 },
      { month: 'Mar', sales: 2000, orders: 980 },
      { month: 'Apr', sales: 2780, orders: 390 },
      { month: 'May', sales: 1890, orders: 480 },
      { month: 'Jun', sales: 2390, orders: 380 },
    ],
    revenueData: [
      { month: 'Jan', revenue: 4000 },
      { month: 'Feb', revenue: 3000 },
      { month: 'Mar', revenue: 2000 },
      { month: 'Apr', revenue: 2780 },
      { month: 'May', revenue: 1890 },
      { month: 'Jun', revenue: 2390 },
    ],
    categoryData: [
      { name: 'Electronics', value: 35 },
      { name: 'Clothing', value: 25 },
      { name: 'Home & Garden', value: 20 },
      { name: 'Sports', value: 15 },
      { name: 'Others', value: 5 },
    ],
    recentActivity: [
      { action: 'New order #1234 received', time: '2 min ago', type: 'order', priority: 'high' },
      { action: 'User John Doe registered', time: '5 min ago', type: 'user', priority: 'medium' },
      { action: 'Product "iPhone 15" added', time: '10 min ago', type: 'product', priority: 'medium' },
      { action: 'Payment received #5678', time: '15 min ago', type: 'payment', priority: 'low' },
      { action: 'Low stock alert: AirPods Pro', time: '20 min ago', type: 'inventory', priority: 'high' },
    ],
    topProducts: [
      { id: '1', name: 'iPhone 15 Pro', sales: 89, revenue: 87911, growth: 12 },
      { id: '2', name: 'MacBook Air M2', sales: 67, revenue: 65433, growth: 8 },
      { id: '3', name: 'AirPods Pro', sales: 124, revenue: 24800, growth: 15 },
      { id: '4', name: 'iPad Air', sales: 45, revenue: 22500, growth: 5 },
      { id: '5', name: 'Apple Watch', sales: 78, revenue: 23400, growth: 10 },
    ],
  };
}
