'use client';

import { motion } from 'framer-motion';
import { X, Star, Package, TrendingUp, Tag, Calendar, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

interface ViewProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export function ViewProductModal({ product, isOpen, onClose, onEdit }: ViewProductModalProps) {
  if (!isOpen || !product) return null;

  const getStockStatus = (quantity: number, lowStockAlert: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    if (quantity <= lowStockAlert) return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' };
    return { status: 'In Stock', color: 'text-green-600 bg-green-50' };
  };

  const stockStatus = getStockStatus(product.inventory.quantity, product.inventory.lowStockAlert);

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
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Product Details</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center mb-4">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-2" />
                    <p>No Image Available</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images?.map((image, index) => (
                  <div key={index} className="bg-gray-100 rounded h-20 flex items-center justify-center">
                    <img
                      src={image.url}
                      alt={image.alt || `Product image ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <p className="text-gray-600 mb-4">{product.description}</p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="font-semibold">{product.rating.average}</span>
                    <span className="text-gray-500">({product.rating.count} reviews)</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    SKU: {product.sku || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Pricing</h3>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-900">${product.price}</div>
                  {product.comparePrice && (
                    <div className="text-lg text-gray-500 line-through">${product.comparePrice}</div>
                  )}
                  {product.comparePrice && (
                    <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                      Save ${(product.comparePrice - product.price).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Inventory</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="text-lg font-semibold">{product.inventory.quantity} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Low Stock Alert</p>
                    <p className="text-lg font-semibold">{product.inventory.lowStockAlert} units</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Stock Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                      {stockStatus.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{product.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Sales</p>
                    <p className="font-medium">{product.salesCount} sold</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Updated</p>
                    <p className="font-medium">{new Date(product.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2">
                {product.isActive ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    Inactive
                  </span>
                )}
                {product.isFeatured && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Featured
                  </span>
                )}
                {product.brand && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {product.brand}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
