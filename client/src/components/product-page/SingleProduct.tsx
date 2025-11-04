// app/shop/product/[slug]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetProductBySlugQuery } from '@/lib/services/productsApi';
import { useAddToCartMutation } from '@/lib/services/cartApi';
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from '@/lib/services/wishlistApi';

// Components
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Star, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft, Plus, Minus, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import ProductImageGallery from '@/components/product-page/ProductImageGallery';
import ProductReviews from '@/components/product-page/ProductReviews';
import RelatedProducts from '@/components/product-page/RelatedProducts';
import ProductSpecifications from '@/components/product-page/ProductSpecifications';
import { useToast } from '@/lib/hooks/useToast';

export default function SingleProduct() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { success, error: toastError } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch product data
  const { data, isLoading, error } = useGetProductBySlugQuery(slug);
  const product = data?.data.product;
  const relatedProducts = data?.data.relatedProducts || [];
  const reviews = data?.data.reviews || [];

  // Cart mutations
  const [addToCart] = useAddToCartMutation();

  // Wishlist queries and mutations
  const { data: wishlistData } = useGetWishlistQuery();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  // Check if product is in wishlist
  useEffect(() => {
    if (wishlistData?.data && product) {
      const inWishlist = wishlistData.data.some((item: any) => item.product._id === product._id);
      setIsInWishlist(inWishlist);
    }
  }, [wishlistData, product]);

  // Set default variant when product loads
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      // Select first in-stock variant, or first variant if all are out of stock
      const inStockVariant = product.variants.find((v: any) => v.stock > 0) || product.variants[0];
      setSelectedVariant(inStockVariant);
    }
  }, [product]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/shop')}>
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  // Calculate current price and stock based on selected variant
  const currentPrice = selectedVariant?.price || product?.price || 0;
  const currentComparePrice = selectedVariant?.comparePrice || product?.comparePrice;
  const currentStock = selectedVariant?.stock || product?.inventory?.quantity || 0;

  const discountPercentage = currentComparePrice && currentComparePrice > currentPrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  // Calculate maximum quantity that can be added (respecting stock limits)
  const maxQuantity = Math.min(currentStock, 10); // Limit to 10 or available stock

  const handleAddToCart = async () => {
    if (!product) return;

    // Validate stock
    if (currentStock === 0) {
      toastError('This product is out of stock');
      return;
    }

    if (quantity > currentStock) {
      toastError(`Only ${currentStock} items available in stock`);
      setQuantity(currentStock);
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart({
        productId: product._id,
        quantity,
        variant: selectedVariant?._id || null,
        size: selectedVariant?.size,
        color: selectedVariant?.color
      }).unwrap();

      success(`${quantity} × ${product.title} added to cart!`);

      // Add animation effect
      const cartButton = document.getElementById('add-to-cart-btn');
      if (cartButton) {
        cartButton.classList.add('animate-pulse');
        setTimeout(() => cartButton.classList.remove('animate-pulse'), 1000);
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to add product to cart';
      toastError(errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    // Validate stock
    if (currentStock === 0) {
      toastError('This product is out of stock');
      return;
    }

    if (quantity > currentStock) {
      toastError(`Only ${currentStock} items available in stock`);
      setQuantity(currentStock);
      return;
    }

    try {
      await addToCart({
        productId: product._id,
        quantity,
        variant: selectedVariant?._id || null,
        size: selectedVariant?.size,
        color: selectedVariant?.color
      }).unwrap();

      // Redirect to cart page after adding
      router.push('/cart');
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to add product to cart';
      toastError(errorMessage);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    try {
      if (isInWishlist) {
        await removeFromWishlist(product._id).unwrap();
        setIsInWishlist(false);
        success('Removed from wishlist');
      } else {
        await addToWishlist(product._id).unwrap();
        setIsInWishlist(true);
        success('Added to wishlist');

        // Add heart animation
        const heartButton = document.getElementById('wishlist-btn');
        if (heartButton) {
          heartButton.classList.add('animate-bounce');
          setTimeout(() => heartButton.classList.remove('animate-bounce'), 1000);
        }
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to update wishlist';
      toastError(errorMessage);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Link copied to clipboard!');
    }
  };

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);

    // Reset quantity to 1 when variant changes
    setQuantity(1);

    // Add selection animation
    const variantButton = document.getElementById(`variant-${variant._id}`);
    if (variantButton) {
      variantButton.classList.add('ring-2', 'ring-primary');
      setTimeout(() => variantButton.classList.remove('ring-2', 'ring-primary'), 300);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxQuantity) {
      toastError(`Maximum ${maxQuantity} items allowed`);
      return;
    }
    setQuantity(newQuantity);
  };

  // Stock status messages
  const getStockStatus = () => {
    if (currentStock === 0) {
      return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    } else if (currentStock <= 5) {
      return { text: `Only ${currentStock} left in stock`, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    } else if (currentStock <= 20) {
      return { text: `${currentStock} in stock`, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    } else {
      return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {isLoading ? (
            <Skeleton className="h-4 w-64" />
          ) : (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/shop/category/${product?.category}`}>
                    {product?.category}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[200px] truncate">
                    {product?.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 hover:scale-105 transition-transform"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <ProductPageSkeleton />
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <ProductImageGallery
                images={product.images}
                selectedImage={selectedImage}
                onSelectImage={setSelectedImage}
                productName={product.title}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Brand and Category */}
              <div className="space-y-2">
                <Badge variant="secondary" className="text-sm">
                  {product.brand}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {product.category}
                </Badge>
                {product.isFeatured && (
                  <Badge variant="default" className="text-sm bg-gradient-to-r from-purple-500 to-pink-500">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                {product.title}
              </h1>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{product.rating.average.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({product.rating.count.toLocaleString()} reviews)
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className={`flex items-center gap-1 ${stockStatus.color}`}>
                  {currentStock <= 5 && currentStock > 0 && (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="font-medium">{stockStatus.text}</span>
                </div>
              </div>

              {/* Stock Alert */}
              {currentStock > 0 && currentStock <= 10 && (
                <div className={`p-3 rounded-lg border ${stockStatus.bg} ${stockStatus.border}`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 ${stockStatus.color}`} />
                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                      {currentStock <= 5
                        ? `Hurry! Only ${currentStock} left in stock`
                        : 'Limited stock available'
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold">${currentPrice.toLocaleString()}</span>
                  {currentComparePrice && currentComparePrice > currentPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        ${currentComparePrice.toLocaleString()}
                      </span>
                      <Badge variant="destructive" className="text-sm animate-pulse">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Tax included. Shipping calculated at checkout.
                </p>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Select Options</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map((variant: any) => (
                      <Button
                        key={variant._id}
                        id={`variant-${variant._id}`}
                        variant={selectedVariant?._id === variant._id ? "default" : "outline"}
                        onClick={() => handleVariantSelect(variant)}
                        className="justify-start h-auto py-3 transition-all hover:scale-105 relative"
                        disabled={variant.stock === 0}
                      >
                        <div className="text-left">
                          <div className="font-medium">{variant.color}</div>
                          <div className="text-sm text-muted-foreground">
                            {variant.size} - ${variant.price.toLocaleString()}
                            {variant.stock === 0 && (
                              <span className="text-red-500 ml-1">(Out of Stock)</span>
                            )}
                          </div>
                        </div>
                        {variant.stock > 0 && variant.stock <= 5 && (
                          <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs bg-orange-500">
                            Low Stock
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quantity</span>
                    <span className="text-xs text-muted-foreground">
                      Max: {maxQuantity} per order
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1 || currentStock === 0}
                        className="hover:scale-110 transition-transform"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= maxQuantity || currentStock === 0}
                        className="hover:scale-110 transition-transform"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Stock Progress Bar */}
                    {currentStock > 0 && (
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Stock</span>
                          <span>{currentStock} available</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((currentStock / Math.max(currentStock, 10)) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <Button
                    id="add-to-cart-btn"
                    size="lg"
                    className="flex-1 transition-all hover:scale-105"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || currentStock === 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isAddingToCart ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </span>
                    ) : currentStock === 0 ? (
                      'Out of Stock'
                    ) : (
                      'Add to Cart'
                    )}
                  </Button>

                  <Button
                    id="wishlist-btn"
                    variant="outline"
                    size="icon"
                    onClick={handleWishlistToggle}
                    className="h-11 w-11 transition-all hover:scale-110"
                    disabled={!product}
                  >
                    <Heart className={`w-4 h-4 transition-all ${
                      isInWishlist ? 'fill-red-500 text-red-500 scale-110' : ''
                    }`} />
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  className="w-full transition-all hover:scale-105"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={currentStock === 0}
                >
                  {currentStock === 0 ? 'Out of Stock' : 'Buy Now'}
                </Button>
              </div>

              {/* Sales Info */}
              {product.salesCount > 0 && (
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>{product.salesCount.toLocaleString()}</strong> units sold •{' '}
                    <strong>{product.viewCount.toLocaleString()}</strong> views
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y">
                <div className="flex items-center gap-3 transition-transform hover:scale-105">
                  <Truck className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Free Shipping</div>
                    <div className="text-sm text-muted-foreground">On orders over $50</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 transition-transform hover:scale-105">
                  <RotateCcw className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Easy Returns</div>
                    <div className="text-sm text-muted-foreground">30-day return policy</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 transition-transform hover:scale-105">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">2-Year Warranty</div>
                    <div className="text-sm text-muted-foreground">Full protection</div>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Share this product:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="transition-all hover:scale-105"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Product Details Tabs */}
      {product && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="py-6">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg leading-relaxed">{product.description}</p>

                {product.features && product.features.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="py-6">
              <ProductSpecifications product={product} />
            </TabsContent>

            <TabsContent value="reviews" className="py-6">
              <ProductReviews
                product={product}
                reviews={reviews}
                reviewStats={data?.data.reviewStats || []}
              />
            </TabsContent>

            <TabsContent value="shipping" className="py-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Standard Shipping</span>
                      <span>$4.99 (Free on orders over $50)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Express Shipping</span>
                      <span>$9.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Time</span>
                      <span>3-5 business days</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Return Policy</h3>
                  <p className="text-muted-foreground">
                    We offer a 30-day return policy for all unused items in their original packaging.
                    Return shipping is free for defective items.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="bg-muted/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <RelatedProducts products={relatedProducts} />
          </div>
        </div>
      )}
    </div>
  );
}

// Skeleton Loader
const ProductPageSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
    {/* Image Gallery Skeleton */}
    <div className="space-y-4">
      <Skeleton className="aspect-square rounded-xl" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>

    {/* Product Info Skeleton */}
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-10 w-3/4" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-3 gap-4 py-6 border-y">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);
