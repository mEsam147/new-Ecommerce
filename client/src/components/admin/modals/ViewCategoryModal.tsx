'use client';

import { motion } from 'framer-motion';
import { X, Edit, Package, Calendar, TrendingUp, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Category } from '@/types';

interface ViewCategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (category: Category) => void;
}

export function ViewCategoryModal({ category, isOpen, onClose, onEdit }: ViewCategoryModalProps) {
  if (!isOpen || !category) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Category Details</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Header */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Package className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h1>
                  <div className="flex items-center gap-2">
                    {category.featured && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      category.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {category.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">{category.description}</p>
              )}
            </div>

            {/* Category Stats */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{category.productsCount || 0}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {Math.floor((category.productsCount || 0) * 0.15)}
                </div>
                <div className="text-sm text-gray-600">Monthly Sales</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {Math.floor((category.productsCount || 0) * 2.5)}
                </div>
                <div className="text-sm text-gray-600">Customers</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">4.2</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>

            {/* Category Details */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Category Information</h3>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Slug</span>
                    <span className="font-medium">{category.slug}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Sort Order</span>
                    <span className="font-medium">{category.sortOrder}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium ${
                      category.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Featured</span>
                    <span className={`font-medium ${
                      category.featured ? 'text-purple-600' : 'text-gray-600'
                    }`}>
                      {category.featured ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Timeline</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-gray-600">
                        {new Date(category.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {new Date(category.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="lg:col-span-3">
              <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Revenue</div>
                  <div className="text-lg font-bold text-gray-900">
                    ${((category.productsCount || 0) * 250).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">+12.5% this month</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Growth</div>
                  <div className="text-lg font-bold text-gray-900">+24%</div>
                  <div className="text-sm text-green-600">vs last month</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Popularity</div>
                  <div className="text-lg font-bold text-gray-900">High</div>
                  <div className="text-sm text-blue-600">Top 3 category</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
