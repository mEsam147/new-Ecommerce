// src/app/admin/inventory/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Product } from '@/types';
import { Search, Filter, AlertTriangle, Package, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';
import Image from 'next/image';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  useEffect(() => {
    setTimeout(() => {
      setProducts(generateMockProducts());
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStock = stockFilter === 'all' ||
                        (stockFilter === 'low' && product.inventory.quantity <= lowStockThreshold) ||
                        (stockFilter === 'out' && product.inventory.quantity === 0) ||
                        (stockFilter === 'healthy' && product.inventory.quantity > lowStockThreshold);

    return matchesSearch && matchesStock;
  });

  const inventoryStats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.inventory.quantity > 0 && p.inventory.quantity <= lowStockThreshold).length,
    outOfStock: products.filter(p => p.inventory.quantity === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.inventory.quantity), 0),
    averageStock: products.reduce((sum, p) => sum + p.inventory.quantity, 0) / products.length,
  };

  const updateStock = async (productId: string, newQuantity: number) => {
    // API call to update stock
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, inventory: { ...p.inventory, quantity: newQuantity } }
        : p
    ));
  };

  const bulkUpdateStock = async (updates: { productId: string; quantity: number }[]) => {
    // API call for bulk update
    updates.forEach(update => {
      updateStock(update.productId, update.quantity);
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage product stock levels
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <RefreshCw size={20} />
            Sync Inventory
          </button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={inventoryStats.totalProducts.toString()}
          description="In inventory"
          icon={<Package className="w-8 h-8" />}
          color="blue"
        />
        <StatCard
          title="Low Stock"
          value={inventoryStats.lowStock.toString()}
          description="Need restocking"
          icon={<AlertTriangle className="w-8 h-8" />}
          color="yellow"
        />
        <StatCard
          title="Out of Stock"
          value={inventoryStats.outOfStock.toString()}
          description="Urgent attention needed"
          icon={<TrendingDown className="w-8 h-8" />}
          color="red"
        />
        <StatCard
          title="Total Value"
          value={`$${inventoryStats.totalValue.toLocaleString()}`}
          description="Inventory worth"
          icon={<TrendingUp className="w-8 h-8" />}
          color="green"
        />
      </div>

      {/* Low Stock Threshold Setting */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Low Stock Threshold:
            </label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
            <span className="text-sm text-gray-500">
              Products with stock at or below this level will be flagged as low stock
            </span>
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
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Stock Levels</option>
              <option value="healthy">Healthy Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Filter size={20} />
              More Filters
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Product Inventory ({filteredProducts.length})
            {stockFilter !== 'all' && ` - ${stockFilter.charAt(0).toUpperCase() + stockFilter.slice(1)} Stock`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">SKU</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Current Stock</th>
                  <th className="text-left py-3 px-4">Low Stock Alert</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Value</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <InventoryRow
                    key={product.id}
                    product={product}
                    lowStockThreshold={lowStockThreshold}
                    onStockUpdate={updateStock}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Stock Update</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Update stock levels for multiple products at once. Upload a CSV file or use the template below.
            </p>
            <div className="flex gap-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Download CSV Template
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Upload CSV
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface InventoryRowProps {
  product: Product;
  lowStockThreshold: number;
  onStockUpdate: (productId: string, quantity: number) => void;
}

function InventoryRow({ product, lowStockThreshold, onStockUpdate }: InventoryRowProps) {
  const [editing, setEditing] = useState(false);
  const [newQuantity, setNewQuantity] = useState(product.inventory.quantity);

  const handleSave = () => {
    onStockUpdate(product.id, newQuantity);
    setEditing(false);
  };

  const getStockStatus = () => {
    if (product.inventory.quantity === 0) {
      return { status: 'Out of Stock', color: 'red' };
    } else if (product.inventory.quantity <= lowStockThreshold) {
      return { status: 'Low Stock', color: 'yellow' };
    } else {
      return { status: 'In Stock', color: 'green' };
    }
  };

  const stockStatus = getStockStatus();
  const productValue = product.price * product.inventory.quantity;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            {product.images?.[0] ? (
              <Image
              width={100}
              height={100}
                src={product.images[0].url}
                alt={product.title}
                className="w-10 h-10 object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-400 text-xs">No Image</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{product.title}</p>
            <p className="text-sm text-gray-500 truncate">{product.brand}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-gray-600 text-sm">
        {product.sku || 'N/A'}
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {product.category}
        </span>
      </td>
      <td className="py-3 px-4">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              min="0"
            />
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-700 text-sm"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setNewQuantity(product.inventory.quantity);
              }}
              className="text-gray-600 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium">{product.inventory.quantity}</span>
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Edit
            </button>
          </div>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">
        {product.inventory.lowStockAlert}
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
          stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {stockStatus.status === 'Low Stock' && <AlertTriangle size={12} className="mr-1" />}
          {stockStatus.status}
        </span>
      </td>
      <td className="py-3 px-4 font-medium text-gray-900">
        ${productValue.toFixed(2)}
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <button
            onClick={() => onStockUpdate(product.id, product.inventory.quantity + 1)}
            className="text-green-600 hover:text-green-700 text-sm"
          >
            +1
          </button>
          <button
            onClick={() => onStockUpdate(product.id, Math.max(0, product.inventory.quantity - 1))}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            -1
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatCard({ title, value, description, icon, color }: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
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

function generateMockProducts(): Product[] {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `prod-${i + 1}`,
    title: `Product ${i + 1}`,
    slug: `product-${i + 1}`,
    description: `Description for product ${i + 1}`,
    price: Math.floor(Math.random() * 500) + 50,
    category: ['Electronics', 'Clothing', 'Home', 'Sports'][Math.floor(Math.random() * 4)],
    brand: ['Brand A', 'Brand B', 'Brand C'][Math.floor(Math.random() * 3)],
    sku: `SKU-${1000 + i + 1}`,
    images: [{
      public_id: `img-${i + 1}`,
      url: `/api/placeholder/100/100?text=Product+${i + 1}`,
    }],
    inventory: {
      trackQuantity: true,
      quantity: Math.floor(Math.random() * 50),
      lowStockAlert: 10,
    },
    rating: { average: 4.0, count: 100 },
    salesCount: Math.floor(Math.random() * 200),
    isActive: true,
    isFeatured: Math.random() > 0.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}
