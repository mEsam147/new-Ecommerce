'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Brand } from '@/types';

interface EditBrandModalProps {
  brand: Brand | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (brand: Brand) => void;
}

export function EditBrandModal({ brand, isOpen, onClose, onSave }: EditBrandModalProps) {
  const [formData, setFormData] = useState<Brand | null>(brand);

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
        className="bg-white rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {brand?.id ? 'Edit Brand' : 'Add Brand'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">Brand Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Brand Logo Upload */}
          <div>
            <Label>Brand Logo</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload a file</span>
                    <input type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="verified" className="text-sm font-medium">
                Verified Brand
              </Label>
              <Switch
                checked={formData.isVerified}
                onCheckedChange={(checked) => handleChange('isVerified', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="featured" className="text-sm font-medium">
                Featured Brand
              </Label>
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) => handleChange('isFeatured', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active" className="text-sm font-medium">
                Active
              </Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {brand?.id ? 'Save Changes' : 'Create Brand'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
