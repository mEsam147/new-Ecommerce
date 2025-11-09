// src/app/admin/coupons/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Coupon } from '@/types';
import { Search, Plus, Filter, Copy, Edit, Trash2, Calendar, Users, Percent, DollarSign, Truck } from 'lucide-react';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setTimeout(() => {
      setCoupons(generateMockCoupons());
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.name.toLowerCase().includes(searchTerm.toLowerCase());

    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && coupon.isActive && now >= startDate && now <= endDate) ||
                         (statusFilter === 'upcoming' && coupon.isActive && now < startDate) ||
                         (statusFilter === 'expired' && now > endDate) ||
                         (statusFilter === 'inactive' && !coupon.isActive);

    return matchesSearch && matchesStatus;
  });

  const couponStats = {
    total: coupons.length,
    active: coupons.filter(c => c.isActive && new Date() >= new Date(c.startDate) && new Date() <= new Date(c.endDate)).length,
    used: coupons.reduce((sum, c) => sum + c.usedCount, 0),
    totalDiscount: coupons.reduce((sum, c) => sum + (c.discountValue * c.usedCount), 0),
  };

  const duplicateCoupon = (coupon: Coupon) => {
    const newCoupon = {
      ...coupon,
      id: `coupon-${coupons.length + 1}`,
      code: `${coupon.code}-COPY`,
      usedCount: 0,
    };
    setCoupons(prev => [...prev, newCoupon]);
  };

  const toggleCouponStatus = (couponId: string) => {
    setCoupons(prev => prev.map(c =>
      c.id === couponId ? { ...c, isActive: !c.isActive } : c
    ));
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
          <h1 className="text-3xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-gray-600 mt-2">
            Create and manage discount coupons for your customers
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Create Coupon
        </button>
      </div>

      {/* Coupon Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Coupons"
          value={couponStats.total.toString()}
          description="Created"
          icon="🎫"
          color="blue"
        />
        <StatCard
          title="Active Coupons"
          value={couponStats.active.toString()}
          description="Currently running"
          icon="🟢"
          color="green"
        />
        <StatCard
          title="Total Uses"
          value={couponStats.used.toString()}
          description="Times used"
          icon="👥"
          color="purple"
        />
        <StatCard
          title="Total Discount"
          value={`$${couponStats.totalDiscount.toLocaleString()}`}
          description="Amount saved"
          icon="💰"
          color="orange"
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
                placeholder="Search coupons by code or name..."
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
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Filter size={20} />
              More Filters
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon) => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            onDuplicate={duplicateCoupon}
            onToggleStatus={toggleCouponStatus}
          />
        ))}
      </div>

      {/* Create Coupon Button for Empty State */}
      {filteredCoupons.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No coupons found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search filters'
                : 'Get started by creating your first coupon'
              }
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={20} className="inline mr-2" />
              Create Your First Coupon
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface CouponCardProps {
  coupon: Coupon;
  onDuplicate: (coupon: Coupon) => void;
  onToggleStatus: (couponId: string) => void;
}

function CouponCard({ coupon, onDuplicate, onToggleStatus }: CouponCardProps) {
  const now = new Date();
  const startDate = new Date(coupon.startDate);
  const endDate = new Date(coupon.endDate);

  const getStatus = () => {
    if (!coupon.isActive) return { status: 'Inactive', color: 'gray' };
    if (now < startDate) return { status: 'Upcoming', color: 'blue' };
    if (now > endDate) return { status: 'Expired', color: 'red' };
    return { status: 'Active', color: 'green' };
  };

  const status = getStatus();
  const usageRate = coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit) * 100 : 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-xl text-gray-900 bg-yellow-100 px-3 py-1 rounded-lg">
                {coupon.code}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                status.color === 'green' ? 'bg-green-100 text-green-800' :
                status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                status.color === 'red' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {status.status}
              </span>
            </div>
            <p className="text-gray-600">{coupon.name}</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onDuplicate(coupon)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Copy size={16} />
            </button>
            <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <Edit size={16} />
            </button>
            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Discount Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {coupon.discountType === 'percentage' ? (
                <Percent size={20} className="text-green-600" />
              ) : coupon.discountType === 'fixed' ? (
                <DollarSign size={20} className="text-blue-600" />
              ) : (
                <Truck size={20} className="text-purple-600" />
              )}
              <span className="font-bold text-lg text-gray-900">
                {coupon.discountType === 'percentage'
                  ? `${coupon.discountValue}% OFF`
                  : coupon.discountType === 'fixed'
                  ? `$${coupon.discountValue} OFF`
                  : 'FREE SHIPPING'
                }
              </span>
            </div>
            {coupon.minimumAmount > 0 && (
              <span className="text-sm text-gray-500">
                Min. ${coupon.minimumAmount}
              </span>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-600">Used</p>
            <p className="font-semibold text-gray-900">
              {coupon.usedCount}{coupon.usageLimit && ` / ${coupon.usageLimit}`}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Per User</p>
            <p className="font-semibold text-gray-900">{coupon.perUserLimit}x</p>
          </div>
        </div>

        {/* Usage Progress */}
        {coupon.usageLimit && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Usage Progress</span>
              <span>{Math.round(usageRate)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(usageRate, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>Starts: {new Date(coupon.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>Ends: {new Date(coupon.endDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onToggleStatus(coupon.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              coupon.isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {coupon.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button className="flex-1 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
            View Analytics
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value, description, icon, color }: {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <div className="text-3xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function generateMockCoupons(): Coupon[] {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: '1',
      code: 'WELCOME10',
      name: 'Welcome Discount',
      description: '10% off for new customers',
      discountType: 'percentage',
      discountValue: 10,
      minimumAmount: 50,
      startDate: lastWeek.toISOString(),
      endDate: nextWeek.toISOString(),
      usageLimit: 1000,
      usedCount: 234,
      perUserLimit: 1,
      isActive: true,
    },
    {
      id: '2',
      code: 'FREESHIP',
      name: 'Free Shipping',
      description: 'Free shipping on all orders',
      discountType: 'free_shipping',
      discountValue: 0,
      minimumAmount: 0,
      startDate: now.toISOString(),
      endDate: nextWeek.toISOString(),
      usageLimit: 500,
      usedCount: 89,
      perUserLimit: 1,
      isActive: true,
    },
    {
      id: '3',
      code: 'SAVE25',
      name: 'Summer Sale',
      description: '$25 off orders over $100',
      discountType: 'fixed',
      discountValue: 25,
      minimumAmount: 100,
      startDate: nextWeek.toISOString(),
      endDate: new Date(nextWeek.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: 200,
      usedCount: 0,
      perUserLimit: 2,
      isActive: true,
    },
    {
      id: '4',
      code: 'FLASH30',
      name: 'Flash Sale',
      description: '30% off for 24 hours',
      discountType: 'percentage',
      discountValue: 30,
      minimumAmount: 0,
      startDate: lastWeek.toISOString(),
      endDate: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: 100,
      usedCount: 100,
      perUserLimit: 1,
      isActive: false,
    },
  ];
}
