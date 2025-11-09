// app/admin/products/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types';
import { useProducts } from '@/lib/hooks/useAdminProducts';
import { toast } from 'react-hot-toast';

export default function CreateProductPage() {
  const router = useRouter();
  const { handleCreateProduct } = useProducts();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: 0,
    comparePrice: undefined,
    category: '',
    brand: '',
    images: [],
    variants: [],
    features: [],
    specifications: {
      weight: '',
      dimensions: '',
      warranty: '2 years',
      material: '',
      color: ''
    },
    tags: [],
    isActive: true,
    isFeatured: false,
    inventory: {
      trackQuantity: true,
      quantity: 0,
      lowStockAlert: 10
    },
    shipping: {
      weight: 0,
      freeShipping: false
    },
    rating: {
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      average: 0,
      count: 0
    },
    salesCount: 0,
    viewCount: 0,
    coupons: []
  });

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await handleCreateProduct(formData);
      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInventoryChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      inventory: { ...prev.inventory!, [field]: value }
    }));
  };

  const handleSpecificationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications!, [field]: value }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors',
    'Beauty & Personal Care', 'Books & Media', 'Toys & Games', 'Automotive',
    'Smartphones', 'Laptops', 'Headphones', 'Shoes', 'Furniture', 'Skincare'
  ];

  const brands = [
    'Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Dell', 'HP', 'Lenovo',
    'Microsoft', 'Canon', 'Bose', 'KitchenAid', 'Dyson', 'Philips', 'LG',
    'Google', 'OnePlus', 'IKEA', 'Zara', 'L\'Oréal', 'CeraVe', 'The Ordinary'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
          <p className="text-gray-600 mt-2">
            Add a new product to your catalog
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter product title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Product Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="product-slug"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => handleChange('shortDescription', e.target.value)}
                    placeholder="Brief description of the product"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe your product in detail..."
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="comparePrice">Compare Price</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      value={formData.comparePrice || ''}
                      onChange={(e) => handleChange('comparePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.inventory?.quantity}
                      onChange={(e) => handleInventoryChange('quantity', parseInt(e.target.value))}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                    <Input
                      id="lowStockAlert"
                      type="number"
                      value={formData.inventory?.lowStockAlert}
                      onChange={(e) => handleInventoryChange('lowStockAlert', parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.inventory?.trackQuantity}
                    onCheckedChange={(checked) => handleInventoryChange('trackQuantity', checked)}
                  />
                  <Label>Track Quantity</Label>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={formData.specifications?.weight}
                      onChange={(e) => handleSpecificationChange('weight', e.target.value)}
                      placeholder="e.g., 1.5kg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.specifications?.dimensions}
                      onChange={(e) => handleSpecificationChange('dimensions', e.target.value)}
                      placeholder="e.g., 30×20×10 cm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={formData.specifications?.material}
                      onChange={(e) => handleSpecificationChange('material', e.target.value)}
                      placeholder="e.g., Plastic, Metal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.specifications?.color}
                      onChange={(e) => handleSpecificationChange('color', e.target.value)}
                      placeholder="e.g., Black, White"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex text-sm text-gray-600">
                    <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload images</span>
                      <input
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>

                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange('category', value)}
                    required
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
                  <Select value={formData.brand} onValueChange={(value) => handleChange('brand', value)}>
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
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags?.join(', ')}
                    onChange={(e) => handleChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shippingWeight">Weight (kg)</Label>
                  <Input
                    id="shippingWeight"
                    type="number"
                    value={formData.shipping?.weight}
                    onChange={(e) => handleChange('shipping', { ...formData.shipping, weight: parseFloat(e.target.value) })}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="freeShipping" className="text-sm font-medium">
                    Free Shipping
                  </Label>
                  <Switch
                    checked={formData.shipping?.freeShipping}
                    onCheckedChange={(checked) => handleChange('shipping', { ...formData.shipping, freeShipping: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="active" className="text-sm font-medium">
                    Active
                  </Label>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleChange('isActive', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="text-sm font-medium">
                    Featured
                  </Label>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleChange('isFeatured', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Create Product
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
