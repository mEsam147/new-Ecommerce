// components/admin/modals/EditProductModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Product } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  isLoading?: boolean;
}

export function EditProductModal({ product, isOpen, onClose, onSave, isLoading = false }: EditProductModalProps) {
  const [formData, setFormData] = useState<Product | null>(product);

  useEffect(() => {
    setFormData(product);
  }, [product]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleInventoryChange = (field: string, value: any) => {
    setFormData(prev => prev ? {
      ...prev,
      inventory: { ...prev.inventory, [field]: value }
    } : null);
  };

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors',
    'Beauty & Personal Care', 'Books & Media', 'Toys & Games', 'Automotive'
  ];

  const brands = [
    'Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Dell', 'HP', 'Lenovo',
    'Microsoft', 'Canon', 'Bose', 'KitchenAid', 'Dyson', 'Philips', 'LG'
  ];

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
          <h2 className="text-xl font-semibold">Edit Product</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading}>
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div>
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="comparePrice">Compare Price</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    value={formData.comparePrice || ''}
                    onChange={(e) => handleChange('comparePrice', parseFloat(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Organization</h3>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Select
                  value={formData.brand || ''}
                  onValueChange={(value) => handleChange('brand', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku || ''}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.inventory.quantity}
                  onChange={(e) => handleInventoryChange('quantity', parseInt(e.target.value))}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                <Input
                  id="lowStockAlert"
                  type="number"
                  value={formData.inventory.lowStockAlert}
                  onChange={(e) => handleInventoryChange('lowStockAlert', parseInt(e.target.value))}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={formData.inventory.trackQuantity}
                  onCheckedChange={(checked) => handleInventoryChange('trackQuantity', checked)}
                  disabled={isLoading}
                />
                <Label>Track Quantity</Label>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status</h3>
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleChange('isActive', checked)}
                  disabled={isLoading}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleChange('isFeatured', checked)}
                  disabled={isLoading}
                />
                <Label>Featured</Label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Product Images</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload images</span>
                  <input type="file" className="sr-only" multiple disabled={isLoading} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
