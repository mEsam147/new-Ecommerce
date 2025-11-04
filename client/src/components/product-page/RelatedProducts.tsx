// components/product-page/RelatedProducts.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { productsApi } from '@/lib/services/productsApi';
import { useAddToCartMutation } from '@/lib/services/cartApi';
import { Product } from '@/types';
import { useToast } from '@/lib/hooks/useToast';

interface RelatedProductsProps {
  products: Product[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  const {success , error:toastError} = useToast()
  const [addToCart] = useAddToCartMutation();

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
      }).unwrap();

      success(`${product.title} has been added to your shopping cart.`);
    } catch (error) {
      toastError('Failed to add product to cart');
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product._id} className="group hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4">
            {/* Product Image */}
            <Link href={`/shop/product/${product.slug}`}>
              <div className="aspect-square relative overflow-hidden rounded-lg mb-4 bg-muted">
                <img
                  src={product?.images[0] || '/placeholder-product.jpg'}
                  alt={product.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                {product?.comparePrice && product?.comparePrice > product.price && (
                  <Badge variant="destructive" className="absolute top-2 left-2">
                    {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                  </Badge>
                )}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </Link>

            {/* Product Info */}
            <div className="space-y-2">
              <Link href={`/shop/product/${product.slug}`}>
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
              </Link>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating.average.toFixed(1)}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.rating.count})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">${product.price}</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.comparePrice}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center justify-between">
                <span className={`text-xs ${
                  product?.inventory?.quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product?.inventory?.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="sm"
                className="w-full"
                onClick={() => handleAddToCart(product)}
                disabled={product?.inventory?.quantity === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RelatedProducts;
