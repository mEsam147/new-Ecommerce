// components/admin/CreateProductForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAdminProducts } from '@/lib/hooks/useAdminProducts';
import { useGetCategoriesQuery } from '@/lib/services/categoriesApi';
import { useGetBrandsQuery } from '@/lib/services/brandsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Upload, X } from 'lucide-react';

interface CreateProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ProductFormData {
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  category: string;
  brand: string;
  sku: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  isFeatured: boolean;
  isActive: boolean;
  inventory: {
    trackQuantity: boolean;
    quantity: number;
    lowStockAlert: number;
  };
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    freeShipping: boolean;
  };
  specifications: {
    weight: string;
    dimensions: string;
    material: string;
    color: string;
    warranty: string;
  };
}

export function CreateProductForm({ onSuccess, onCancel }: CreateProductFormProps) {
  const { createProduct, creating } = useAdminProducts();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    defaultValues: {
      isActive: true,
      isFeatured: false,
      inventory: {
        trackQuantity: true,
        quantity: 0,
        lowStockAlert: 5,
      },
      shipping: {
        freeShipping: false,
        weight: 0,
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
        },
      },
      specifications: {
        warranty: '2 years',
      },
    },
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    files.forEach(file => {
      if (images.length >= 5) {
        alert('Maximum 5 images allowed');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);

      setImages(prev => [...prev, file]);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, {
      size: '',
      color: '',
      stock: 0,
      sku: '',
      price: watch('price') || 0,
    }]);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setVariants(prev => prev.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const formData = new FormData();

      // Append basic product data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'inventory' || key === 'shipping' || key === 'specifications') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append variants
      if (variants.length > 0) {
        formData.append('variants', JSON.stringify(variants));
      }

      // Append images
      images.forEach((image, index) => {
        formData.append('images', image);
        formData.append('imageAlt', data.title);
      });

      await createProduct(formData);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  {...register('title', { required: 'Product title is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product title"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  {...register('sku')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Product SKU"
                />
              </div>
            </div>

            {/* Category and Brand */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  {...register('brand')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.name}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compare Price
                </label>
                <input
                  {...register('comparePrice', { min: 0 })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price
                </label>
                <input
                  {...register('costPrice', { min: 0 })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                {...register('shortDescription')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description for product listings"
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detailed product description"
                maxLength={2000}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="product-images"
                />
                <label
                  htmlFor="product-images"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload images (max 5)
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </span>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  {...register('inventory.quantity', { min: 0 })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Stock Alert
                </label>
                <input
                  {...register('inventory.lowStockAlert', { min: 0 })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  {...register('inventory.trackQuantity')}
                  type="checkbox"
                  id="track-quantity"
                  className="mr-2"
                />
                <label htmlFor="track-quantity" className="text-sm text-gray-700">
                  Track Quantity
                </label>
              </div>
            </div>

            {/* Variants */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Product Variants
                </label>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus size={16} />
                  Add Variant
                </button>
              </div>

              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border rounded-lg">
                  <input
                    type="text"
                    placeholder="Size"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Color"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Price"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="flex gap-6">
              <div className="flex items-center">
                <input
                  {...register('isActive')}
                  type="checkbox"
                  id="is-active"
                  className="mr-2"
                />
                <label htmlFor="is-active" className="text-sm text-gray-700">
                  Active Product
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('isFeatured')}
                  type="checkbox"
                  id="is-featured"
                  className="mr-2"
                />
                <label htmlFor="is-featured" className="text-sm text-gray-700">
                  Featured Product
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? <LoadingSpinner size="sm" /> : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
