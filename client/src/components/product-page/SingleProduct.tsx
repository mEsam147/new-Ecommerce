// app/shop/product/[slug]/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetProductBySlugQuery } from '@/lib/services/productsApi';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useAppSelector } from '@/lib/hooks/redux';

// Components
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Star, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft, Plus, Minus, ShoppingCart, Check, AlertCircle, Zap, Clock } from 'lucide-react';
import ProductImageGallery from '@/components/product-page/ProductImageGallery';
import ProductReviews from '@/components/product-page/ProductReviews';
import RelatedProducts from '@/components/product-page/RelatedProducts';
import ProductSpecifications from '@/components/product-page/ProductSpecifications';
import { useToast } from '@/lib/hooks/useToast';
import { cn } from '@/lib/utils';

interface ProductVariant {
  _id: string;
  size?: string;
  color?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku: string;
}

interface ProductReview {
  _id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
  };
  createdAt: string;
}

interface ProductData {
  product: {
    _id: string;
    title: string;
    description: string;
    shortDescription?: string;
    price: number;
    comparePrice?: number;
    images: Array<{ url: string; alt?: string }>;
    category: string;
    brand: string;
    inventory: {
      quantity: number;
      trackQuantity: boolean;
    };
    variants?: ProductVariant[];
    features?: string[];
    rating: {
      average: number;
      count: number;
    };
    salesCount: number;
    viewCount: number;
    isFeatured: boolean;
    tags: string[];
    createdAt?: string;
  };
  relatedProducts: any[];
  reviews: ProductReview[];
  reviewStats: any[];
}

export default function SingleProduct() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { success, error: toastError } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Use custom hooks for cart and wishlist
  const { addToCart, isInCart, getItemCount } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Fetch product data
  const { data, isLoading, error } = useGetProductBySlugQuery(slug);
  const productData = data?.data as ProductData | undefined;
  const product = productData?.product;
  const relatedProducts = productData?.relatedProducts || [];
  const reviews = productData?.reviews || [];

  // Use selectors directly to get cart and wishlist state
  const productInCart = useAppSelector(isInCart(product?._id || ''));
  const cartItemCount = useAppSelector(getItemCount(product?._id || ''));
  const isInWishlistState = useAppSelector(isInWishlist(product?._id || ''));

  // Set default variant when product loads
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const inStockVariant = product.variants.find((v: ProductVariant) => v.stock > 0) || product.variants[0];
      setSelectedVariant(inStockVariant);
    }
  }, [product]);

  // Memoized calculations for better performance
  const { currentPrice, currentComparePrice, currentStock, discountPercentage, maxQuantity } = useMemo(() => {
    const price = selectedVariant?.price || product?.price || 0;
    const comparePrice = selectedVariant?.comparePrice || product?.comparePrice;
    const stock = selectedVariant?.stock || product?.inventory?.quantity || 0;
    const discount = comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;
    const maxQty = Math.min(stock, 10);

    return {
      currentPrice: price,
      currentComparePrice: comparePrice,
      currentStock: stock,
      discountPercentage: discount,
      maxQuantity: maxQty
    };
  }, [selectedVariant, product]);

  // Check if product is new (less than 7 days old)
  const isNewProduct = useMemo(() => {
    if (!product?.createdAt) return false;
    const createdDate = new Date(product.createdAt);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return createdDate > sevenDaysAgo;
  }, [product]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push('/shop')} size="lg">
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => router.back()} size="lg">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        product,
        quantity,
        size: selectedVariant?.size,
        color: selectedVariant?.color
      });

      success(`${quantity} × ${product.title} added to cart!`);

      // Add animation effect
      const cartButton = document.getElementById('add-to-cart-btn');
      if (cartButton) {
        cartButton.classList.add('animate-pulse');
        setTimeout(() => cartButton.classList.remove('animate-pulse'), 1000);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to add product to cart';
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

    setIsAddingToCart(true);
    try {
      await addToCart({
        product,
        quantity,
        size: selectedVariant?.size,
        color: selectedVariant?.color
      });

      // Redirect to cart page after adding
      router.push('/cart');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to add product to cart';
      toastError(errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    setIsTogglingWishlist(true);
    try {
      if (isInWishlistState) {
        await removeFromWishlist(product._id);
        success('Removed from wishlist');
      } else {
        await addToWishlist({ product });
        success('Added to wishlist');

        // Add heart animation
        const heartButton = document.getElementById('wishlist-btn');
        if (heartButton) {
          heartButton.classList.add('animate-bounce');
          setTimeout(() => heartButton.classList.remove('animate-bounce'), 1000);
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update wishlist';
      toastError(errorMessage);
    } finally {
      setIsTogglingWishlist(false);
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
        success('Shared successfully!');
      } catch (error) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Link copied to clipboard!');
    }
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1);

    // Add selection animation
    const variantButton = document.getElementById(`variant-${variant._id}`);
    if (variantButton) {
      variantButton.classList.add('ring-2', 'ring-primary', 'scale-105');
      setTimeout(() => {
        variantButton.classList.remove('ring-2', 'ring-primary', 'scale-105');
      }, 300);
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

  const quickAddQuantity = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  // Stock status messages
  const getStockStatus = () => {
    if (currentStock === 0) {
      return {
        text: 'Out of Stock',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: AlertCircle
      };
    } else if (currentStock <= 5) {
      return {
        text: `Only ${currentStock} left in stock`,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: AlertCircle
      };
    } else if (currentStock <= 20) {
      return {
        text: `${currentStock} in stock`,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: Check
      };
    } else {
      return {
        text: 'In Stock',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: Check
      };
    }
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {isLoading ? (
            <Skeleton className="h-4 w-64" />
          ) : (
            <Breadcrumb>
              <BreadcrumbList className="flex-wrap">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="text-sm hover:text-primary transition-colors">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/shop" className="text-sm hover:text-primary transition-colors">
                    Shop
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={`/shop/category/${product?.category}`}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {product?.category}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-semibold max-w-[150px] sm:max-w-[200px] truncate">
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
          className="mb-4 hover:scale-105 transition-all duration-200 group"
        >
          <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </Button>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {isLoading ? (
          <ProductPageSkeleton />
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <ProductImageGallery
                images={product.images}
                selectedImage={selectedImage}
                onSelectImage={setSelectedImage}
                productName={product.title}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Header Section */}
              <div className="space-y-4">
                {/* Brand and Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {product.brand}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {product.category}
                  </Badge>
                  {product.isFeatured && (
                    <Badge variant="default" className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1">
                      <Zap className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {isNewProduct && (
                    <Badge variant="default" className="text-sm bg-blue-500 px-3 py-1">
                      New Arrival
                    </Badge>
                  )}
                  {product.tags?.includes('bestseller') && (
                    <Badge variant="secondary" className="text-sm bg-amber-500 text-white px-3 py-1">
                      Best Seller
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                  {product.title}
                </h1>

                {/* Rating, Reviews, and Stock */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-4 h-4 transition-colors",
                              star <= Math.floor(product.rating.average)
                                ? "text-yellow-400 fill-current"
                                : star <= product.rating.average
                                ? "text-yellow-400 fill-current opacity-50"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-sm">{product.rating.average.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.rating.count.toLocaleString()} reviews)
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${stockStatus.bg} ${stockStatus.border}`}>
                    <StockIcon className={`w-4 h-4 ${stockStatus.color}`} />
                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Alert */}
              {currentStock > 0 && currentStock <= 10 && (
                <div className={`p-4 rounded-lg border ${stockStatus.bg} ${stockStatus.border} animate-pulse`}>
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`w-5 h-5 ${stockStatus.color}`} />
                    <div>
                      <p className={`text-sm font-medium ${stockStatus.color}`}>
                        {currentStock <= 5
                          ? `Hurry! Only ${currentStock} left in stock - selling fast!`
                          : 'Limited stock available'
                        }
                      </p>
                      {currentStock <= 5 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Order now to avoid disappointment
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Status */}
              {productInCart && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3 text-green-700">
                    <Check className="w-5 h-5" />
                    <div>
                      <p className="text-sm font-medium">
                        {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in your cart
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Ready for checkout
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Section */}
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-foreground">
                    ${currentPrice.toLocaleString()}
                  </span>
                  {currentComparePrice && currentComparePrice > currentPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        ${currentComparePrice.toLocaleString()}
                      </span>
                      <Badge variant="destructive" className="text-sm px-3 py-1 animate-pulse">
                        Save {discountPercentage}%
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tax included. Shipping calculated at checkout.
                </p>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 py-1">
                  {product.shortDescription}
                </p>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Select Options</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.variants.map((variant: ProductVariant) => (
                      <Button
                        key={variant._id}
                        id={`variant-${variant._id}`}
                        variant={selectedVariant?._id === variant._id ? "default" : "outline"}
                        onClick={() => handleVariantSelect(variant)}
                        className={cn(
                          "justify-start h-auto py-4 transition-all duration-200 relative group",
                          selectedVariant?._id === variant._id && "ring-2 ring-primary ring-offset-2"
                        )}
                        disabled={variant.stock === 0}
                      >
                        <div className="text-left flex-1">
                          <div className="font-medium flex items-center gap-2">
                            {variant.color || 'Standard'}
                            {variant.stock === 0 && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex justify-between items-center mt-1">
                            <span>{variant.size} - ${variant.price.toLocaleString()}</span>
                            {variant.stock > 0 && variant.stock <= 5 && (
                              <Badge variant="secondary" className="text-xs bg-orange-500 text-white">
                                Low Stock
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-6 p-6 bg-card border rounded-xl shadow-sm">
                {/* Quantity Selector */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quantity</span>
                    <span className="text-xs text-muted-foreground">
                      Max: {maxQuantity} per order
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center border rounded-lg bg-background">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1 || currentStock === 0}
                        className="h-12 w-12 hover:bg-muted transition-all hover:scale-105"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= maxQuantity || currentStock === 0}
                        className="h-12 w-12 hover:bg-muted transition-all hover:scale-105"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Quick Add Buttons */}
                    {maxQuantity > 1 && (
                      <div className="flex gap-2">
                        {[1, 2, 3].map((num) => (
                          <Button
                            key={num}
                            variant="outline"
                            size="sm"
                            onClick={() => quickAddQuantity(num)}
                            disabled={quantity + num > maxQuantity || currentStock === 0}
                            className="h-8 text-xs"
                          >
                            +{num}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stock Progress Bar */}
                  {currentStock > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Stock Level</span>
                        <span>{currentStock} available</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all duration-1000",
                            currentStock > 10 ? "bg-green-500" :
                            currentStock > 5 ? "bg-yellow-500" : "bg-orange-500"
                          )}
                          style={{
                            width: `${Math.min((currentStock / Math.max(currentStock, 10)) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Button
                      id="add-to-cart-btn"
                      size="lg"
                      className="flex-1 h-14 transition-all hover:scale-105 hover:shadow-lg"
                      onClick={handleAddToCart}
                      disabled={currentStock === 0 || isAddingToCart}
                    >
                      {isAddingToCart ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </div>
                      ) : currentStock === 0 ? (
                        'Out of Stock'
                      ) : productInCart ? (
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          Add More ({cartItemCount} in cart)
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          Add to Cart
                        </div>
                      )}
                    </Button>

                    <Button
                      id="wishlist-btn"
                      variant="outline"
                      size="icon"
                      onClick={handleWishlistToggle}
                      className={cn(
                        "h-14 w-14 transition-all hover:scale-105 hover:shadow-lg",
                        isInWishlistState
                          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                          : "hover:bg-muted/50"
                      )}
                      disabled={!product || isTogglingWishlist}
                    >
                      {isTogglingWishlist ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Heart className={cn(
                          "w-5 h-5 transition-all",
                          isInWishlistState && "fill-current scale-110"
                        )} />
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="secondary"
                    className="w-full h-14 transition-all hover:scale-105 hover:shadow-lg text-base font-semibold"
                    size="lg"
                    onClick={handleBuyNow}
                    disabled={currentStock === 0 || isAddingToCart}
                  >
                    {currentStock === 0 ? 'Out of Stock' : 'Buy Now - Secure Checkout'}
                  </Button>
                </div>
              </div>

              {/* Sales Info */}
              {product.salesCount > 0 && (
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>{product.salesCount.toLocaleString()}+</strong> happy customers •{' '}
                    <strong>{product.viewCount.toLocaleString()}+</strong> views this month
                  </p>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background hover:scale-105 transition-transform duration-200">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Free Shipping</div>
                    <div className="text-xs text-muted-foreground">On orders over $50</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background hover:scale-105 transition-transform duration-200">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Easy Returns</div>
                    <div className="text-xs text-muted-foreground">30-day return policy</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background hover:scale-105 transition-transform duration-200">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">2-Year Warranty</div>
                    <div className="text-xs text-muted-foreground">Full protection</div>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <span className="text-sm font-medium">Share this product</span>
                  <p className="text-xs text-muted-foreground">Tell your friends about this item</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="transition-all hover:scale-105 hover:shadow-lg"
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
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 p-1 bg-muted/50 rounded-lg">
              <TabsTrigger
                value="description"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Reviews ({reviews.length})
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Shipping & Returns
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="py-6 animate-in fade-in-0 duration-500">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground">{product.description}</p>

                {product.features && product.features.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Key Features</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="py-6 animate-in fade-in-0 duration-500">
              <ProductSpecifications product={product} />
            </TabsContent>

            <TabsContent value="reviews" className="py-6 animate-in fade-in-0 duration-500">
              <ProductReviews
                product={product}
                reviews={reviews}
                reviewStats={productData?.reviewStats || []}
              />
            </TabsContent>

            <TabsContent value="shipping" className="py-6 animate-in fade-in-0 duration-500">
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Shipping Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="font-medium">Standard Shipping</span>
                        <span className="text-green-600 font-semibold">$4.99</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="font-medium">Express Shipping</span>
                        <span className="text-blue-600 font-semibold">$9.99</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="font-medium">Free Shipping</span>
                        <span className="text-green-600 font-semibold">Orders over $50</span>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Delivery: 3-5 business days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Return Policy</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">30-Day Money Back Guarantee</h4>
                        <p className="text-sm text-green-700">
                          We offer a 30-day return policy for all unused items in their original packaging.
                          Return shipping is free for defective items.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                          Your satisfaction is our priority. If you're not happy with your purchase,
                          we'll make it right.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="bg-muted/30 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <RelatedProducts products={relatedProducts} />
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Skeleton Loader
const ProductPageSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
    {/* Image Gallery Skeleton */}
    <div className="space-y-4">
      <Skeleton className="aspect-square rounded-2xl" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>

    {/* Product Info Skeleton */}
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-8 w-3/4 rounded" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-32 rounded" />
          <Skeleton className="h-6 w-24 rounded" />
        </div>
      </div>

      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-20 w-full rounded-lg" />

      <div className="space-y-4 p-6 border rounded-xl">
        <Skeleton className="h-10 w-full rounded" />
        <div className="flex gap-3">
          <Skeleton className="h-14 flex-1 rounded" />
          <Skeleton className="h-14 w-14 rounded" />
        </div>
        <Skeleton className="h-14 w-full rounded" />
      </div>

      <div className="grid grid-cols-3 gap-4 py-6 border-y">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);
