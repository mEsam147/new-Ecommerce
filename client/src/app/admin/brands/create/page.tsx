'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Globe, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brand } from '@/types';
import Image from 'next/image';

export default function CreateBrandPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: '',
    slug: '',
    description: '',
    isVerified: false,
    isFeatured: false,
    isActive: true,
    productCount: 0,
    followerCount: 0,
    rating: {
      average: 0,
      count: 0
    }
  });

  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Brand created:', formData);
      setIsLoading(false);
      router.push('/admin/brands');
    }, 2000);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedLogo(file);
    }
  };

  const removeLogo = () => {
    setUploadedLogo(null);
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
          <h1 className="text-3xl font-bold text-gray-900">Create Brand</h1>
          <p className="text-gray-600 mt-2">
            Add a new brand partnership to your store
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
                  <Label htmlFor="name">Brand Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter brand name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Brand Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="brand-slug"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be used in URLs. Use lowercase letters, numbers, and hyphens.
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Brand Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe the brand, its values, and product focus..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Provide a compelling description to showcase the brand to customers.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Brand Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedLogo ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <Image
                      width={100}
                      height={100}
                        src={URL.createObjectURL(uploadedLogo)}
                        alt="Brand logo preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div>
                      <Label htmlFor="change-logo">Change Logo</Label>
                      <Input
                        id="change-logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload brand logo</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG, SVG up to 5MB. Recommended: 400x400px
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social & Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Social & Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        https://
                      </span>
                      <Input
                        id="website"
                        placeholder="brand-website.com"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        @
                      </span>
                      <Input
                        id="instagram"
                        placeholder="username"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@brand.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="active" className="text-sm font-medium">
                    Active Brand
                  </Label>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleChange('isActive', checked)}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Inactive brands won't be visible to customers.
                </p>

                <div className="flex items-center justify-between">
                  <Label htmlFor="verified" className="text-sm font-medium">
                    Verified Brand
                  </Label>
                  <Switch
                    checked={formData.isVerified}
                    onCheckedChange={(checked) => handleChange('isVerified', checked)}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Verified brands show a trust badge to customers.
                </p>

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="text-sm font-medium">
                    Featured Brand
                  </Label>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleChange('isFeatured', checked)}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Featured brands are highlighted throughout the store.
                </p>
              </CardContent>
            </Card>

            {/* Initial Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Initial Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productCount">Product Count</Label>
                  <Input
                    id="productCount"
                    type="number"
                    value={formData.productCount}
                    onChange={(e) => handleChange('productCount', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="followerCount">Follower Count</Label>
                  <Input
                    id="followerCount"
                    type="number"
                    value={formData.followerCount}
                    onChange={(e) => handleChange('followerCount', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ratingAverage">Rating Average</Label>
                    <Input
                      id="ratingAverage"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating?.average}
                      onChange={(e) => handleChange('rating', {
                        ...formData.rating,
                        average: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ratingCount">Rating Count</Label>
                    <Input
                      id="ratingCount"
                      type="number"
                      value={formData.rating?.count}
                      onChange={(e) => handleChange('rating', {
                        ...formData.rating,
                        count: parseInt(e.target.value) || 0
                      })}
                      min="0"
                    />
                  </div>
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
                      Create Brand
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
