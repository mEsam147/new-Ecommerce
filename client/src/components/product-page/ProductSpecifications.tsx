// components/product-page/ProductSpecifications.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';

interface ProductSpecificationsProps {
  product: Product;
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({ product }) => {
  // Calculate discount percentage
  const discountPercentage = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  // Basic specifications - fixed to handle object instead of Map
  const specifications = [
    {
      label: 'Brand',
      value: product.brand || 'N/A',
    },
    {
      label: 'Category',
      value: product.category,
    },
    {
      label: 'Subcategory',
      value: product.subcategory || 'N/A',
    },
    {
      label: 'SKU',
      value: product._id, // Using _id as SKU
    },
    {
      label: 'Weight',
      value: product.shipping?.weight ? `${product.shipping.weight} kg` : 'N/A',
    },
    {
      label: 'Dimensions',
      value: product.shipping?.dimensions
        ? `${product.shipping.dimensions.length} × ${product.shipping.dimensions.width} × ${product.shipping.dimensions.height} cm`
        : 'N/A',
    },
    {
      label: 'Material',
      value: product.specifications?.material || 'N/A',
    },
    {
      label: 'Color',
      value: product.specifications?.color || 'N/A',
    },
    {
      label: 'Warranty',
      value: product.specifications?.warranty || '2 years',
    },
  ];

  // Technical specifications - fixed to handle object
  const technicalSpecs = product.specifications ?
    Object.entries(product.specifications).filter(([key]) =>
      !['material', 'color', 'warranty', 'weight', 'dimensions'].includes(key)
    ) : [];

  // Variants information
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div className="space-y-6">
      {/* Basic Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Product Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specifications.map((spec, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-muted-foreground">{spec.label}:</span>
                <span className="text-right">
                  {spec.label === 'Category' || spec.label === 'Subcategory' ? (
                    <Badge variant="outline">{spec.value}</Badge>
                  ) : spec.label === 'Brand' && spec.value !== 'N/A' ? (
                    <Badge variant="secondary">{spec.value}</Badge>
                  ) : (
                    spec.value
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      {technicalSpecs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {technicalSpecs.map(([key, value], index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="text-right">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variants */}
      {hasVariants && (
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {product.variants!.map((variant, index) => (
                <div key={variant._id || index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Color:</span>
                      <div className="mt-1">{variant.color}</div>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>
                      <div className="mt-1">{variant.size}</div>
                    </div>
                    <div>
                      <span className="font-medium">Price:</span>
                      <div className="mt-1">${variant.price || product.price}</div>
                    </div>
                    <div>
                      <span className="font-medium">Stock:</span>
                      <div className="mt-1">
                        <Badge variant={variant.stock > 0 ? "default" : "destructive"}>
                          {variant.stock} units
                        </Badge>
                      </div>
                    </div>
                    {variant.sku && (
                      <div className="md:col-span-2">
                        <span className="font-medium">SKU:</span>
                        <div className="mt-1 text-muted-foreground">{variant.sku}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      {product.features && product.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 py-1">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-muted-foreground">Selling Price:</span>
              <span className="font-bold">${product.price}</span>
            </div>
            {product.comparePrice && product.comparePrice > product.price && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-muted-foreground">Original Price:</span>
                <span className="text-muted-foreground line-through">${product.comparePrice}</span>
              </div>
            )}
            {discountPercentage > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-muted-foreground">Discount:</span>
                <Badge variant="destructive">{discountPercentage}% OFF</Badge>
              </div>
            )}
            {product.costPrice && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-muted-foreground">Cost Price:</span>
                <span className="text-muted-foreground">${product.costPrice}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inventory & Shipping */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory & Shipping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-muted-foreground">Stock Status:</span>
              <Badge variant={product.inventory.quantity > 0 ? "default" : "destructive"}>
                {product.inventory.quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-muted-foreground">Available Quantity:</span>
              <span>{product.inventory.quantity}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-muted-foreground">Low Stock Alert:</span>
              <span>{product.inventory.lowStockAlert}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-muted-foreground">Track Inventory:</span>
              <span>{product.inventory.trackQuantity ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-muted-foreground">Free Shipping:</span>
              <span>{product.shipping?.freeShipping ? 'Yes' : 'No'}</span>
            </div>
            {product.shipping?.weight && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-muted-foreground">Shipping Weight:</span>
                <span>{product.shipping.weight} kg</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sales & Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Sales & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-muted-foreground">Total Sales:</span>
              <span>{product.salesCount || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-muted-foreground">View Count:</span>
              <span>{product.viewCount || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-muted-foreground">Product Status:</span>
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-muted-foreground">Featured Product:</span>
              <Badge variant={product.isFeatured ? "default" : "outline"}>
                {product.isFeatured ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-muted-foreground">Customer Rating:</span>
              <div className="flex items-center gap-1">
                <span className="font-bold">{product.rating.average.toFixed(1)}</span>
                <span className="text-muted-foreground">({product.rating.count} reviews)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductSpecifications;
