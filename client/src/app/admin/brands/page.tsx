'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EditBrandModal } from '@/components/admin/modals/EditBrandModal';
import { ViewBrandModal } from '@/components/admin/modals/ViewBrandModal';
import { Brand } from '@/types';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Star,
  MoreVertical,
  Eye,
  Users,
  Package,
  TrendingUp,
  Verified,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [viewingBrand, setViewingBrand] = useState<Brand | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    // Simulate API call with realistic data
    setTimeout(() => {
      setBrands(generateRealisticBrands());
      setIsLoading(false);
    }, 1500);
  }, []);

  // Filter brands based on all criteria
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && brand.isActive) ||
                         (statusFilter === 'inactive' && !brand.isActive);

    const matchesVerified = verifiedFilter === 'all' ||
                           (verifiedFilter === 'verified' && brand.isVerified) ||
                           (verifiedFilter === 'not_verified' && !brand.isVerified);

    const matchesFeatured = featuredFilter === 'all' ||
                           (featuredFilter === 'featured' && brand.isFeatured) ||
                           (featuredFilter === 'not_featured' && !brand.isFeatured);

    return matchesSearch && matchesStatus && matchesVerified && matchesFeatured;
  });

  // Calculate statistics
  const stats = {
    totalBrands: brands.length,
    activeBrands: brands.filter(b => b.isActive).length,
    verifiedBrands: brands.filter(b => b.isVerified).length,
    featuredBrands: brands.filter(b => b.isFeatured).length,
    totalProducts: brands.reduce((sum, brand) => sum + brand.productCount, 0),
    totalFollowers: brands.reduce((sum, brand) => sum + brand.followerCount, 0),
    totalRevenue: brands.reduce((sum, brand) => sum + (brand.productCount * 450), 0)
  };

  // Modal handlers
  const handleViewBrand = (brand: Brand) => {
    setViewingBrand(brand);
    setIsViewModalOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setIsEditModalOpen(true);
  };

  const handleSaveBrand = (updatedBrand: Brand) => {
    if (updatedBrand.id.startsWith('new-')) {
      // Add new brand
      const newBrand = {
        ...updatedBrand,
        id: `brand-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setBrands(prev => [newBrand, ...prev]);
    } else {
      // Update existing brand
      setBrands(prev => prev.map(b =>
        b.id === updatedBrand.id ? { ...updatedBrand, updatedAt: new Date().toISOString() } : b
      ));
    }
    setIsEditModalOpen(false);
    setEditingBrand(null);
  };

  const handleAddBrand = () => {
    router.push('/admin/brands/create');
  };

  const handleCreateBrand = () => {
    router.push('/admin/brands/create');
  };

  const handleDeleteBrand = (brandId: string) => {
    setBrands(prev => prev.filter(b => b.id !== brandId));
  };

  const handleToggleStatus = (brandId: string) => {
    setBrands(prev => prev.map(b =>
      b.id === brandId ? { ...b, isActive: !b.isActive, updatedAt: new Date().toISOString() } : b
    ));
  };

  const handleToggleVerified = (brandId: string) => {
    setBrands(prev => prev.map(b =>
      b.id === brandId ? { ...b, isVerified: !b.isVerified, updatedAt: new Date().toISOString() } : b
    ));
  };

  const handleToggleFeatured = (brandId: string) => {
    setBrands(prev => prev.map(b =>
      b.id === brandId ? { ...b, isFeatured: !b.isFeatured, updatedAt: new Date().toISOString() } : b
    ));
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedBrands.length === 0) return;

    switch (bulkAction) {
      case 'activate':
        setBrands(prev => prev.map(b =>
          selectedBrands.includes(b.id) ? { ...b, isActive: true, updatedAt: new Date().toISOString() } : b
        ));
        break;
      case 'deactivate':
        setBrands(prev => prev.map(b =>
          selectedBrands.includes(b.id) ? { ...b, isActive: false, updatedAt: new Date().toISOString() } : b
        ));
        break;
      case 'verify':
        setBrands(prev => prev.map(b =>
          selectedBrands.includes(b.id) ? { ...b, isVerified: true, updatedAt: new Date().toISOString() } : b
        ));
        break;
      case 'unverify':
        setBrands(prev => prev.map(b =>
          selectedBrands.includes(b.id) ? { ...b, isVerified: false, updatedAt: new Date().toISOString() } : b
        ));
        break;
      case 'feature':
        setBrands(prev => prev.map(b =>
          selectedBrands.includes(b.id) ? { ...b, isFeatured: true, updatedAt: new Date().toISOString() } : b
        ));
        break;
      case 'unfeature':
        setBrands(prev => prev.map(b =>
          selectedBrands.includes(b.id) ? { ...b, isFeatured: false, updatedAt: new Date().toISOString() } : b
        ));
        break;
      case 'delete':
        setBrands(prev => prev.filter(b => !selectedBrands.includes(b.id)));
        break;
    }

    setSelectedBrands([]);
    setBulkAction('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600 mt-2">
            Manage brand partnerships and product lines
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <Upload size={20} />
            Import
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <Download size={20} />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateBrand}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Brand
          </motion.button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'Total Brands',
            value: stats.totalBrands,
            icon: <Star className="w-5 h-5" />,
            color: 'blue'
          },
          {
            label: 'Active Brands',
            value: stats.activeBrands,
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'green'
          },
          {
            label: 'Verified',
            value: stats.verifiedBrands,
            icon: <Verified className="w-5 h-5" />,
            color: 'purple'
          },
          {
            label: 'Featured',
            value: stats.featuredBrands,
            icon: <Star className="w-5 h-5" />,
            color: 'orange'
          },
          {
            label: 'Total Products',
            value: stats.totalProducts,
            icon: <Package className="w-5 h-5" />,
            color: 'indigo'
          },
          {
            label: 'Total Followers',
            value: (stats.totalFollowers / 1000).toFixed(1) + 'K',
            icon: <Users className="w-5 h-5" />,
            color: 'green'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                stat.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                stat.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                'bg-green-100 text-green-600'
              }`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search brands by name, description, or slug..."
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
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="not_verified">Not Verified</option>
            </select>

            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Featured</option>
              <option value="featured">Featured</option>
              <option value="not_featured">Not Featured</option>
            </select>

            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Filter size={20} />
              More Filters
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedBrands.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedBrands.length} brand(s) selected
                  </span>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-3 py-1 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Bulk Actions</option>
                    <option value="activate">Activate</option>
                    <option value="deactivate">Deactivate</option>
                    <option value="verify">Verify</option>
                    <option value="unverify">Unverify</option>
                    <option value="feature">Mark Featured</option>
                    <option value="unfeature">Remove Featured</option>
                    <option value="delete">Delete</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
                <button
                  onClick={() => setSelectedBrands([])}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredBrands.map((brand, index) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              index={index}
              isSelected={selectedBrands.includes(brand.id)}
              onSelect={(selected) => {
                if (selected) {
                  setSelectedBrands(prev => [...prev, brand.id]);
                } else {
                  setSelectedBrands(prev => prev.filter(id => id !== brand.id));
                }
              }}
              onView={handleViewBrand}
              onEdit={handleEditBrand}
              onDelete={handleDeleteBrand}
              onToggleStatus={handleToggleStatus}
              onToggleVerified={handleToggleVerified}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredBrands.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No brands found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || verifiedFilter !== 'all' || featuredFilter !== 'all'
              ? 'Try adjusting your search filters'
              : 'Get started by creating your first brand partnership'
            }
          </p>
          <div className="mt-6">
            <Button onClick={handleCreateBrand}>
              <Plus size={16} className="mr-2" />
              Add Brand
            </Button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <ViewBrandModal
        brand={viewingBrand}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingBrand(null);
        }}
        onEdit={handleEditBrand}
      />

      <EditBrandModal
        brand={editingBrand}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBrand(null);
        }}
        onSave={handleSaveBrand}
      />
    </div>
  );
}

// Brand Card Component
function BrandCard({
  brand,
  index,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleVerified,
  onToggleFeatured
}: {
  brand: Brand;
  index: number;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onView: (brand: Brand) => void;
  onEdit: (brand: Brand) => void;
  onDelete: (brandId: string) => void;
  onToggleStatus: (brandId: string) => void;
  onToggleVerified: (brandId: string) => void;
  onToggleFeatured: (brandId: string) => void;
}) {
  const getGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-purple-500',
      'from-green-500 to-blue-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-teal-500 to-green-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-cyan-500 to-blue-500'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <motion.div
      key={brand.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
      className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-100">
        <CardContent className="p-6">
          {/* Selection Checkbox */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="rounded border-gray-300"
            />
          </div>

          {/* Brand Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${getGradient(index)} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
                {brand.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{brand.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {brand.isVerified && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                      <Verified size={12} />
                      Verified
                    </span>
                  )}
                  {brand.isFeatured && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(brand)}>
                  <Eye size={16} className="mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(brand)}>
                  <Edit size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(brand.id)}>
                  {brand.isActive ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleVerified(brand.id)}>
                  {brand.isVerified ? 'Unverify' : 'Verify'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleFeatured(brand.id)}>
                  {brand.isFeatured ? 'Remove Featured' : 'Mark Featured'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(brand.id)}
                  className="text-red-600"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Brand Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {brand.description || 'No description available'}
          </p>

          {/* Brand Stats */}
          <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-100 pt-4 mb-4">
            <div>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                <Package size={16} />
                Products
              </div>
              <div className="font-semibold text-gray-900">{brand.productCount}</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                <Users size={16} />
                Followers
              </div>
              <div className="font-semibold text-gray-900">
                {(brand.followerCount / 1000).toFixed(1)}K
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                <Star size={16} />
                Rating
              </div>
              <div className="font-semibold text-gray-900">
                {brand.rating.average.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              brand.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {brand.isActive ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={() => onView(brand)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Products
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Generate realistic brand data
function generateRealisticBrands(): Brand[] {
  const brandsData = [
    {
      name: 'Apple',
      slug: 'apple',
      description: 'Innovative technology company creating premium devices and ecosystem products.',
      productCount: 45,
      followerCount: 12500000,
      rating: { average: 4.8, count: 125000 },
      isVerified: true,
      isFeatured: true
    },
    {
      name: 'Samsung',
      slug: 'samsung',
      description: 'Global technology leader in electronics, appliances, and mobile devices.',
      productCount: 67,
      followerCount: 8900000,
      rating: { average: 4.6, count: 98000 },
      isVerified: true,
      isFeatured: true
    },
    {
      name: 'Nike',
      slug: 'nike',
      description: 'World leader in athletic footwear, apparel, and sports equipment.',
      productCount: 123,
      followerCount: 15600000,
      rating: { average: 4.7, count: 234000 },
      isVerified: true,
      isFeatured: true
    },
    {
      name: 'Sony',
      slug: 'sony',
      description: 'Japanese multinational conglomerate specializing in electronics and entertainment.',
      productCount: 34,
      followerCount: 6700000,
      rating: { average: 4.5, count: 56000 },
      isVerified: true,
      isFeatured: false
    },
    {
      name: 'Adidas',
      slug: 'adidas',
      description: 'German athletic apparel and footwear corporation with global presence.',
      productCount: 89,
      followerCount: 11200000,
      rating: { average: 4.6, count: 134000 },
      isVerified: true,
      isFeatured: false
    },
    {
      name: 'Dell',
      slug: 'dell',
      description: 'American technology company developing computers and enterprise solutions.',
      productCount: 23,
      followerCount: 4500000,
      rating: { average: 4.4, count: 34000 },
      isVerified: true,
      isFeatured: false
    },
    {
      name: 'Microsoft',
      slug: 'microsoft',
      description: 'Technology corporation developing software, hardware, and cloud services.',
      productCount: 56,
      followerCount: 9800000,
      rating: { average: 4.5, count: 78000 },
      isVerified: true,
      isFeatured: true
    },
    {
      name: 'Canon',
      slug: 'canon',
      description: 'Japanese multinational specializing in cameras, photocopiers, and printers.',
      productCount: 42,
      followerCount: 5600000,
      rating: { average: 4.6, count: 45000 },
      isVerified: true,
      isFeatured: false
    },
    {
      name: 'Bose',
      slug: 'bose',
      description: 'American manufacturing company specializing in audio equipment and speakers.',
      productCount: 28,
      followerCount: 3400000,
      rating: { average: 4.7, count: 29000 },
      isVerified: true,
      isFeatured: false
    },
    {
      name: 'KitchenAid',
      slug: 'kitchenaid',
      description: 'Home appliance brand known for stand mixers and kitchen products.',
      productCount: 31,
      followerCount: 2300000,
      rating: { average: 4.8, count: 18000 },
      isVerified: true,
      isFeatured: false
    },
    {
      name: 'Dyson',
      slug: 'dyson',
      description: 'British technology company known for vacuum cleaners and air purifiers.',
      productCount: 19,
      followerCount: 3100000,
      rating: { average: 4.4, count: 22000 },
      isVerified: true,
      isFeatured: false
    },
    {
      name: 'Philips',
      slug: 'philips',
      description: 'Dutch conglomerate focusing on healthcare, consumer lifestyle, and lighting.',
      productCount: 47,
      followerCount: 4200000,
      rating: { average: 4.3, count: 38000 },
      isVerified: true,
      isFeatured: false
    }
  ];

  return brandsData.map((brand, index) => ({
    id: `brand-${1000 + index}`,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    isVerified: brand.isVerified,
    isFeatured: brand.isFeatured,
    isActive: Math.random() > 0.1, // 90% active
    productCount: brand.productCount,
    followerCount: brand.followerCount,
    rating: brand.rating,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));
}
