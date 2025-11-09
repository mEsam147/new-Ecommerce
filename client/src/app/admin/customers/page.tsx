// src/app/admin/customers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { User } from '@/types';
import { Search, Mail, Phone, MapPin, Calendar, Edit, Trash2 } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setCustomers(generateMockCustomers());
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">
            Manage your customer database and relationships
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Active Customers</p>
          <p className="text-2xl font-bold text-gray-900">
            {customers.filter(c => c.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">New This Month</p>
          <p className="text-2xl font-bold text-gray-900">
            {customers.filter(c => {
              const created = new Date(c.createdAt);
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Avg. Orders</p>
          <p className="text-2xl font-bold text-gray-900">3.2</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              {/* Customer Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {customer.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit size={16} />
                  </button>
                  <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} />
                  {customer.email}
                </div>
                {customer.lastLogin && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    Last login: {new Date(customer.lastLogin).toLocaleDateString()}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  Member since {new Date(customer.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-100 pt-4">
                <div>
                  <div className="text-lg font-bold text-gray-900">12</div>
                  <div className="text-xs text-gray-500">Orders</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">$1,245</div>
                  <div className="text-xs text-gray-500">Spent</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">4.8</div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function generateMockCustomers(): User[] {
  const names = [
    'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown',
    'Emily Davis', 'Chris Lee', 'Amanda Garcia', 'Robert Miller', 'Lisa Taylor'
  ];

  return names.map((name, index) => ({
    id: `user-${index + 1}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    role: 'user' as const,
    isActive: Math.random() > 0.1,
    lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
  }));
}
