// components/shop/ProductCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { useAppSelector } from '@/lib/hooks/redux';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Heart,
  Eye,
  ShoppingCart,
  Star,
  Zap,
  Shield,
  Truck,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className,
  priority = false
}) => {
  // Each card manages its own hover state independently
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { addToCart, isInCart, getItemCount } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Use selectors directly to avoid hook recursion issues
  const productInCart = useAppSelector(isInCart(product?._id));
  const cartItemCount = useAppSelector(getItemCount(product?._id));
  const isInWishlistState = useAppSelector(isInWishlist(product?._id));

  // Compute derived values
  const images = product?.images || [];
  const mainImage = images[0]?.url || '/images/placeholder-product.jpg';
  const secondaryImage = images[1]?.url || mainImage;
  const currentImage = isHovered && images.length > 1 ? secondaryImage : mainImage;

  const isOnSale = product?.comparePrice && product?.comparePrice > product?.price;
  const discountPercentage = isOnSale && product?.comparePrice
    ? Math.round(((product?.comparePrice - product?.price) / product?.comparePrice) * 100)
    : 0;

  const inStock = product?.inventory?.trackQuantity
    ? product?.inventory?.quantity > 0
    : true;

  const isLowStock = product?.inventory?.trackQuantity &&
                    product?.inventory?.quantity > 0 &&
                    product?.inventory?.quantity <= (product?.inventory?.lowStockAlert || 10);

  const isNewArrival = product?.tags?.includes('new') ||
                      (product?.createdAt &&
                       Date.now() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000); // 7 days

  const isFeatured = product?.isFeatured;
  const isBestSeller = product?.tags?.includes('bestseller');
  const rating = product?.rating?.average || 0;
  const reviewCount = product?.rating?.count || 0;
  const hasVariants = product?.variants && product.variants.length > 0;

  // Calculate shipping info
  const freeShipping = product?.shipping?.freeShipping || product?.price > 50;
  const fastDelivery = product?.shipping?.fastDelivery;

  // Handle image loading and errors
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(true); // Still mark as loaded to hide skeleton
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock || addingToCart) return;

    setAddingToCart(true);
    try {
      await addToCart({
        product,
        quantity: 1
      });

      // Success feedback
      if (typeof window !== 'undefined') {
        // You could trigger a toast notification here
        console.log('✅ Product added to cart');
      }
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (addingToWishlist) return;

    setAddingToWishlist(true);
    try {
      if (isInWishlistState) {
        await removeFromWishlist(product?._id);
      } else {
        await addToWishlist({ product });
      }
    } catch (error) {
      console.error('❌ Wishlist toggle failed:', error);
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement quick view modal
    console.log('Quick view:', product?._id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked on action buttons, don't navigate
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('.action-button') ||
      target.closest('.product-actions')
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Format price with proper formatting
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-500 hover:shadow-2xl border border-border/50 bg-card/50 backdrop-blur-sm",
          "hover:border-primary/20 hover:scale-[1.02] hover:-translate-y-1",
          !inStock && "opacity-60 grayscale",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        // Each card manages its own hover state
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={`/shop/product/${product?.slug}`}
          onClick={handleCardClick}
          className="block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
        >
          {/* Image Container */}
          <CardHeader className="p-0 relative">
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30">
              {/* Main Image with Loading State */}
              <div className="relative w-full h-full">
                <Image
                  src={currentImage}
                  alt={product?.title || 'Product image'}
                  fill
                  className={cn(
                    "object-cover transition-all duration-700 ease-out",
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
                    isHovered && images.length > 1 ? 'scale-110' : 'scale-100'
                  )}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  priority={priority}
                />

                {/* Loading Skeleton */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
                )}

                {/* Image Navigation Dots */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all duration-300",
                          index === currentImageIndex
                            ? "bg-primary scale-125"
                            : "bg-white/60 hover:bg-white/80"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentImageIndex(index);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Top Badges - Always visible */}
              <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
                {isOnSale && (
                  <Badge
                    variant="destructive"
                    className="font-bold text-xs px-2 py-1 shadow-lg"
                  >
                    🔥 {discountPercentage}% OFF
                  </Badge>
                )}
                {isNewArrival && (
                  <Badge
                    variant="default"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 font-bold text-xs px-2 py-1 shadow-lg"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    NEW
                  </Badge>
                )}
                {isBestSeller && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-500 text-white border-0 font-bold text-xs px-2 py-1 shadow-lg"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    BESTSELLER
                  </Badge>
                )}
                {isFeatured && (
                  <Badge
                    variant="outline"
                    className="bg-background/95 backdrop-blur-sm font-bold text-xs px-2 py-1 border-primary text-primary shadow-lg"
                  >
                    FEATURED
                  </Badge>
                )}
              </div>

              {/* Stock Status Badge - Always visible */}
              <div className="absolute top-3 right-3 z-20">
                {!inStock ? (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-semibold text-xs">
                    OUT OF STOCK
                  </Badge>
                ) : isLowStock ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold text-xs">
                    LOW STOCK
                  </Badge>
                ) : productInCart ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 font-semibold text-xs">
                    {cartItemCount} IN CART
                  </Badge>
                ) : null}
              </div>

              {/* Hover Actions Overlay - Only shows on hover for THIS card */}
              <div className={cn(
                "absolute inset-0 bg-black/0 transition-all duration-500 flex items-center justify-center",
                isHovered ? "bg-black/5 opacity-100" : "opacity-0"
              )}>
                <div className={cn(
                  "transform transition-all duration-500 delay-100",
                  isHovered ? "translate-y-0" : "translate-y-4",
                  "flex gap-3 product-actions"
                )}>
                  {/* Quick View Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className={cn(
                          "w-12 h-12 bg-background/95 backdrop-blur-sm border border-border/50",
                          "hover:bg-background hover:scale-110 hover:shadow-lg transition-all duration-300",
                          "shadow-md action-button"
                        )}
                        onClick={handleQuickView}
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Quick Preview</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Wishlist Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className={cn(
                          "w-12 h-12 bg-background/95 backdrop-blur-sm border border-border/50",
                          "hover:bg-background hover:scale-110 hover:shadow-lg transition-all duration-300",
                          isInWishlistState && "text-destructive bg-destructive/10 border-destructive/20",
                          addingToWishlist && "opacity-50 cursor-not-allowed",
                          "shadow-md action-button"
                        )}
                        onClick={handleWishlistToggle}
                        disabled={addingToWishlist}
                      >
                        {addingToWishlist ? (
                          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Heart
                            className={cn(
                              "w-5 h-5 transition-all duration-300",
                              isInWishlistState ? "fill-current scale-110" : ""
                            )}
                          />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{isInWishlistState ? "Remove from Wishlist" : "Add to Wishlist"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Shipping Badges - Always visible */}
              <div className="absolute bottom-3 left-3 flex flex-col gap-1 z-10">
                {freeShipping && (
                  <div className="flex items-center gap-1 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    <Truck className="w-3 h-3" />
                    <span>Free Shipping</span>
                  </div>
                )}
                {fastDelivery && (
                  <div className="flex items-center gap-1 bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    <Clock className="w-3 h-3" />
                    <span>Fast Delivery</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Product Info */}
          <CardContent className="p-5 space-y-3">
            {/* Category and Brand */}
            <div className="flex items-center justify-between text-xs">
              {product?.category && (
                <span className="text-muted-foreground font-medium uppercase tracking-wide">
                  {product.category}
                </span>
              )}
              {product?.brand && (
                <span className="text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">
                  {product.brand}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-foreground text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300 min-h-[2.5rem]">
              {product?.title}
            </h3>

            {/* Rating and Reviews */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4 transition-colors",
                        star <= Math.floor(rating)
                          ? "text-yellow-400 fill-current drop-shadow-sm"
                          : star <= rating
                            ? "text-yellow-400 fill-current opacity-50"
                            : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                  <span className="text-sm font-semibold text-foreground ml-1">
                    {rating.toFixed(1)}
                  </span>
                </div>
                {reviewCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({reviewCount.toLocaleString()})
                  </span>
                )}
              </div>

              {/* Variants Indicator */}
              {hasVariants && (
                <Badge variant="outline" className="text-xs">
                  {product.variants?.length} options
                </Badge>
              )}
            </div>

            {/* Description (on hover) */}
            {product?.description && (
              <p className={cn(
                "text-xs text-muted-foreground line-clamp-2 transition-all duration-300",
                isHovered ? "opacity-100 max-h-20" : "opacity-0 max-h-0"
              )}>
                {product.description}
              </p>
            )}

            {/* Stock Progress Bar */}
            {product?.inventory?.trackQuantity && product.inventory.quantity > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Stock</span>
                  <span className={cn(
                    "font-semibold",
                    product.inventory.quantity > 10 ? "text-green-600" : "text-amber-600"
                  )}>
                    {product.inventory.quantity} left
                  </span>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-1.5">
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-1000",
                      product.inventory.quantity > 10 ? "bg-green-500" : "bg-amber-500",
                      product.inventory.quantity <= 5 ? "animate-pulse" : ""
                    )}
                    style={{
                      width: `${Math.min(100, (product.inventory.quantity / 50) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Link>

        {/* Footer with Price and Add to Cart */}
        <CardFooter className="p-5 pt-0">
          <div className="flex items-center justify-between w-full gap-3">
            {/* Price Section */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(product?.price)}
                </span>
                {isOnSale && product.comparePrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>

              {/* Price per unit if available */}
              {product?.unit && (
                <span className="text-xs text-muted-foreground">
                  {formatPrice(product.price / (product.unit.amount || 1))}/{product.unit.unit}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              size="sm"
              className={cn(
                "min-w-[120px] transition-all duration-300 action-button relative overflow-hidden",
                "hover:shadow-lg hover:scale-105 active:scale-95",
                productInCart
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-primary hover:bg-primary/90",
                !inStock && "bg-muted text-muted-foreground hover:bg-muted",
                addingToCart && "opacity-70 cursor-not-allowed"
              )}
            >
              {/* Animated Background */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent",
                isHovered ? "translate-x-[100%]" : "translate-x-[-100%]",
                "transition-transform duration-1000",
                addingToCart && "animate-shimmer"
              )} />

              {/* Button Content */}
              {addingToCart ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </div>
              ) : !inStock ? (
                <div className="flex items-center gap-2">
                  <span>Out of Stock</span>
                </div>
              ) : productInCart ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Add More</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </div>
              )}
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/50">
            {product?.warranty && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    <span>Warranty</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{product.warranty} warranty</p>
                </TooltipContent>
              </Tooltip>
            )}

            {product?.returnPolicy?.allowed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3" />
                    <span>Easy Returns</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{product.returnPolicy.periodDays}-day returns</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default ProductCard;
