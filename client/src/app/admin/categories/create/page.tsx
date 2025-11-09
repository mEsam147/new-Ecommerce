'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '@/types';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    featured: false,
    sortOrder: 0,
    productsCount: 0
  });

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Category created:', formData);
      setIsLoading(false);
      router.push('/admin/categories');
    }, 2000);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleNameChange = (name: string) => {
    handleChange('name', name);
    if (!formData.slug) {
      handleChange('slug', generateSlug(name));
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Create Category</h1>
          <p className="text-gray-600 mt-2">
            Add a new category to organize your products
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
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Category Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="category-slug"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be used in URLs. Use lowercase letters, numbers, and hyphens.
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe this category..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Provide a detailed description to help customers understand this category.
                  </p>
                </div>

                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
                    min="0"
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Lower numbers appear first in category lists.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Category Image */}
            <Card>
              <CardHeader>
                <CardTitle>Category Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedImage ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={URL.createObjectURL(uploadedImage)}
                        alt="Category preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div>
                      <Label htmlFor="change-image">Change Image</Label>
                      <Input
                        id="change-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload an image</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG, GIF up to 10MB. Recommended: 400x400px
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="active" className="text-sm font-medium">
                    Active Category
                  </Label>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleChange('isActive', checked)}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Inactive categories won't be visible to customers.
                </p>

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="text-sm font-medium">
                    Featured Category
                  </Label>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleChange('featured', checked)}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Featured categories will be highlighted on the homepage.
                </p>
              </CardContent>
            </Card>

            {/* SEO Information */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="Optional meta title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Optional meta description for search engines"
                    rows={3}
                    className="mt-1"
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
                  disabled={isLoading || !formData.name || !formData.slug}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Create Category
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
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
