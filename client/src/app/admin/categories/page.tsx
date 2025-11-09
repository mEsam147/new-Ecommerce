'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EditCategoryModal } from '@/components/admin/modals/EditCategoryModal';
import { ViewCategoryModal } from '@/components/admin/modals/ViewCategoryModal';
import { Category } from '@/types';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Folder,
  MoreVertical,
  Eye,
  TrendingUp,
  Users,
  Package,
  Star,
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

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    // Simulate API call with realistic data
    setTimeout(() => {
      setCategories(generateRealisticCategories());
      setIsLoading(false);
    }, 1500);
  }, []);

  // Filter categories based on all criteria
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && category.isActive) ||
                         (statusFilter === 'inactive' && !category.isActive);

    const matchesFeatured = featuredFilter === 'all' ||
                           (featuredFilter === 'featured' && category.featured) ||
                           (featuredFilter === 'not_featured' && !category.featured);

    return matchesSearch && matchesStatus && matchesFeatured;
  });

  // Calculate statistics
  const stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.isActive).length,
    featuredCategories: categories.filter(c => c.featured).length,
    totalProducts: categories.reduce((sum, cat) => sum + (cat.productsCount || 0), 0),
    totalRevenue: categories.reduce((sum, cat) => sum + ((cat.productsCount || 0) * 250), 0),
    averageProducts: Math.round(categories.reduce((sum, cat) => sum + (cat.productsCount || 0), 0) / categories.length)
  };

  // Modal handlers
  const handleViewCategory = (category: Category) => {
    setViewingCategory(category);
    setIsViewModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleSaveCategory = (updatedCategory: Category) => {
    if (updatedCategory.id.startsWith('new-')) {
      // Add new category
      const newCategory = {
        ...updatedCategory,
        id: `cat-${Date.now()}`,
        productsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCategories(prev => [newCategory, ...prev]);
    } else {
      // Update existing category
      setCategories(prev => prev.map(c =>
        c.id === updatedCategory.id ? { ...updatedCategory, updatedAt: new Date().toISOString() } : c
      ));
    }
    setIsEditModalOpen(false);
    setEditingCategory(null);
  };

  const handleAddCategory = () => {
    router.push('/admin/categories/create');
  };

  const handleCreateCategory = () => {
    router.push('/admin/categories/create');
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const handleToggleStatus = (categoryId: string) => {
    setCategories(prev => prev.map(c =>
      c.id === categoryId ? { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() } : c
    ));
  };

  const handleToggleFeatured = (categoryId: string) => {
    setCategories(prev => prev.map(c =>
      c.id === categoryId ? { ...c, featured: !c.featured, updatedAt: new Date().toISOString() } : c
    ));
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedCategories.length === 0) return;

    switch (bulkAction) {
      case 'activate':
        setCategories(prev => prev.map(c =>
          selectedCategories.includes(c.id) ? { ...c, isActive: true, updatedAt: new Date().toISOString() } : c
        ));
        break;
      case 'deactivate':
        setCategories(prev => prev.map(c =>
          selectedCategories.includes(c.id) ? { ...c, isActive: false, updatedAt: new Date().toISOString() } : c
        ));
        break;
      case 'feature':
        setCategories(prev => prev.map(c =>
          selectedCategories.includes(c.id) ? { ...c, featured: true, updatedAt: new Date().toISOString() } : c
        ));
        break;
      case 'unfeature':
        setCategories(prev => prev.map(c =>
          selectedCategories.includes(c.id) ? { ...c, featured: false, updatedAt: new Date().toISOString() } : c
        ));
        break;
      case 'delete':
        setCategories(prev => prev.filter(c => !selectedCategories.includes(c.id)));
        break;
    }

    setSelectedCategories([]);
    setBulkAction('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">
            Organize your products into categories for better management
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
            onClick={handleCreateCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Category
          </motion.button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'Total Categories',
            value: stats.totalCategories,
            icon: <Folder className="w-5 h-5" />,
            color: 'blue'
          },
          {
            label: 'Active Categories',
            value: stats.activeCategories,
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'green'
          },
          {
            label: 'Featured',
            value: stats.featuredCategories,
            icon: <Star className="w-5 h-5" />,
            color: 'purple'
          },
          {
            label: 'Total Products',
            value: stats.totalProducts,
            icon: <Package className="w-5 h-5" />,
            color: 'orange'
          },
          {
            label: 'Avg Products',
            value: stats.averageProducts,
            icon: <Users className="w-5 h-5" />,
            color: 'indigo'
          },
          {
            label: 'Total Revenue',
            value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`,
            icon: <TrendingUp className="w-5 h-5" />,
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
                placeholder="Search categories by name, description, or slug..."
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
          {selectedCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedCategories.length} categor(ies) selected
                  </span>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-3 py-1 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Bulk Actions</option>
                    <option value="activate">Activate</option>
                    <option value="deactivate">Deactivate</option>
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
                  onClick={() => setSelectedCategories([])}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              isSelected={selectedCategories.includes(category.id)}
              onSelect={(selected) => {
                if (selected) {
                  setSelectedCategories(prev => [...prev, category.id]);
                } else {
                  setSelectedCategories(prev => prev.filter(id => id !== category.id));
                }
              }}
              onView={handleViewCategory}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onToggleStatus={handleToggleStatus}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Folder className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || featuredFilter !== 'all'
              ? 'Try adjusting your search filters'
              : 'Get started by creating your first category'
            }
          </p>
          <div className="mt-6">
            <Button onClick={handleCreateCategory}>
              <Plus size={16} className="mr-2" />
              Add Category
            </Button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <ViewCategoryModal
        category={viewingCategory}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingCategory(null);
        }}
        onEdit={handleEditCategory}
      />

      <EditCategoryModal
        category={editingCategory}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
      />
    </div>
  );
}

// Category Card Component
function CategoryCard({
  category,
  index,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured
}: {
  category: Category;
  index: number;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onToggleStatus: (categoryId: string) => void;
  onToggleFeatured: (categoryId: string) => void;
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
      key={category.id}
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

          {/* Category Header */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-16 h-16 bg-gradient-to-r ${getGradient(index)} rounded-xl flex items-center justify-center`}>
              <Folder className="w-8 h-8 text-white" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(category)}>
                  <Eye size={16} className="mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(category)}>
                  <Edit size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(category.id)}>
                  {category.isActive ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleFeatured(category.id)}>
                  {category.featured ? 'Remove Featured' : 'Mark Featured'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(category.id)}
                  className="text-red-600"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Category Info */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{category.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {category.description || 'No description provided'}
              </p>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-sm font-bold text-gray-900">{category.productsCount || 0}</div>
                <div className="text-xs text-gray-500">Products</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-sm font-bold text-gray-900">
                  ${((category.productsCount || 0) * 250).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Revenue</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-sm font-bold text-gray-900">4.2</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
            </div>

            {/* Category Meta */}
            <div className="flex items-center justify-between text-sm">
              <div className="space-y-1">
                <div className="text-gray-500">Slug: {category.slug}</div>
                <div className="text-gray-500">Order: #{category.sortOrder}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-1">
                  {category.featured && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      Featured
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    category.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Updated {new Date(category.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Generate realistic category data
function generateRealisticCategories(): Category[] {
  const categoriesData = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets, smartphones, laptops, and cutting-edge technology for modern living.',
      productsCount: 156,
      featured: true,
      sortOrder: 1
    },
    {
      name: 'Clothing & Fashion',
      slug: 'clothing-fashion',
      description: 'Trendy apparel, shoes, and accessories for all seasons and occasions.',
      productsCount: 234,
      featured: true,
      sortOrder: 2
    },
    {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Everything to make your house a home - furniture, decor, and garden supplies.',
      productsCount: 189,
      featured: false,
      sortOrder: 3
    },
    {
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Equipment and gear for sports enthusiasts and outdoor adventurers.',
      productsCount: 142,
      featured: true,
      sortOrder: 4
    },
    {
      name: 'Beauty & Personal Care',
      slug: 'beauty-personal-care',
      description: 'Skincare, cosmetics, haircare, and personal grooming products.',
      productsCount: 278,
      featured: false,
      sortOrder: 5
    },
    {
      name: 'Books & Media',
      slug: 'books-media',
      description: 'Books, magazines, e-books, and educational materials for all ages.',
      productsCount: 345,
      featured: false,
      sortOrder: 6
    },
    {
      name: 'Toys & Games',
      slug: 'toys-games',
      description: 'Fun and educational toys, games, and entertainment for children and families.',
      productsCount: 167,
      featured: false,
      sortOrder: 7
    },
    {
      name: 'Automotive',
      slug: 'automotive',
      description: 'Car accessories, tools, and maintenance products for vehicle owners.',
      productsCount: 98,
      featured: false,
      sortOrder: 8
    },
    {
      name: 'Health & Wellness',
      slug: 'health-wellness',
      description: 'Vitamins, supplements, fitness equipment, and wellness products.',
      productsCount: 213,
      featured: true,
      sortOrder: 9
    },
    {
      name: 'Jewelry & Watches',
      slug: 'jewelry-watches',
      description: 'Fine jewelry, watches, and luxury accessories for special occasions.',
      productsCount: 76,
      featured: false,
      sortOrder: 10
    },
    {
      name: 'Pet Supplies',
      slug: 'pet-supplies',
      description: 'Food, toys, and accessories for your beloved pets and animals.',
      productsCount: 134,
      featured: false,
      sortOrder: 11
    },
    {
      name: 'Office Supplies',
      slug: 'office-supplies',
      description: 'Stationery, furniture, and equipment for home and office workspace.',
      productsCount: 187,
      featured: false,
      sortOrder: 12
    }
  ];

  return categoriesData.map((cat, index) => ({
    id: `cat-${1000 + index}`,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    isActive: Math.random() > 0.1, // 90% active
    featured: cat.featured,
    sortOrder: cat.sortOrder,
    productsCount: cat.productsCount,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));
}
