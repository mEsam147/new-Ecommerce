// app/cart/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Ticket,
  CheckCircle,
  XCircle,
  Loader2,
  Heart,
  Shield,
  Truck,
  RotateCcw,
  Clock,
  AlertCircle,
  Sparkles,
  Tag
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotal,
    total,
    discount,
    loading,
    isEmpty,
    applyCouponCode,
    removeCouponCode,
    updateQuantity,
    removeFromCart,
    clearCart,
    couponValidationLoading,
    couponValidationError,
    appliedCoupon,
    // NEW: Coupon state from useCart hook
    availableCoupons,
    loadingCoupons,
    couponInput,
    setCouponInput,
    applyCouponFromInput,
    quickApplyCoupon,
    hasAvailableCoupons,
    canApplyCoupon,
    isCouponLoading
  } = useCart();

  const { isAuthenticated } = useAuth();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);

  // Handle initial loading state
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated && items.length > 0) {
      try {
        localStorage.setItem('guestCart', JSON.stringify(items));
      } catch (err) {
        console.error('Failed to save guest cart:', err);
      }
    }
  }, [items, isAuthenticated]);

  // Enhanced quantity change with stock validation
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    const item = items.find(item => (item.id || item._id) === itemId);
    if (!item) return;

    const product = item.product || item;
    const maxStock = product.inventory?.quantity || product.stock || 10;

    if (newQuantity > maxStock) {
      setError(`Only ${maxStock} items available in stock`);
      return;
    }

    setError(null);
    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      await updateQuantity({ itemId, quantity: newQuantity });
    } catch (err) {
      setError('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setError(null);
    setRemovingItems(prev => new Set(prev).add(itemId));

    try {
      await removeFromCart(itemId);
    } catch (err) {
      setError('Failed to remove item. Please try again.');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    setError(null);
    setClearingCart(true);

    try {
      await clearCart();
      // Clear localStorage for guest users
      if (!isAuthenticated) {
        localStorage.removeItem('guestCart');
      }
    } catch (err) {
      setError('Failed to clear cart. Please try again.');
    } finally {
      setClearingCart(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    console.log('🎫 handleApplyCoupon - Applying coupon:', couponInput);
    setError(null);

    const success = await applyCouponFromInput();
    console.log('🎫 handleApplyCoupon - Result:', success);

    if (success) {
      setShowAvailableCoupons(false);
    }
  };

  const handleQuickApplyCoupon = async (code: string) => {
    setError(null);
    const success = await quickApplyCoupon(code);
    if (success) {
      setShowAvailableCoupons(false);
    }
  };

  const handleRemoveAppliedCoupon = () => {
    removeCouponCode();
    setCouponInput('');
    setError(null);
    setShowAvailableCoupons(true);
  };

  const handleCheckout = () => router.push('/checkout');
  const handleContinueShopping = () => router.push('/products');

  // Memoized item display info
  const getEnhancedItemDisplayInfo = useCallback((item: any) => {
    const productId = item.productId || item.product?._id || item.product;
    const productTitle = item.product?.title || 'Product';
    const productImage = item.product?.images?.[0]?.url || item.product?.images?.[0] || '/images/placeholder-product.jpg';
    const price = item.price || item.product?.price || 0;
    const quantity = item.quantity || item.qty || 1;
    const size = item.size || item.variant?.size;
    const color = item.color || item.variant?.color;
    const inventory = item.product?.inventory || item.inventory;

    return {
      id: item.id || item._id,
      productId,
      title: productTitle,
      image: productImage,
      price,
      quantity,
      size,
      color,
      inventory,
      totalPrice: price * quantity
    };
  }, []);

  const enhancedItems = useMemo(() =>
    items.map(item => getEnhancedItemDisplayInfo(item)),
    [items, getEnhancedItemDisplayInfo]
  );

  // Trust features data
  const trustFeatures = [
    { icon: Shield, text: "Secure Payment", subtext: "256-bit SSL encryption", color: "text-purple-600" },
    { icon: Truck, text: "Free Shipping", subtext: "On orders over $50", color: "text-green-600" },
    { icon: RotateCcw, text: "Easy Returns", subtext: "30-day guarantee", color: "text-blue-600" },
    { icon: Clock, text: "24/7 Support", subtext: "Always here to help", color: "text-orange-600" },
  ];

  // Enhanced available coupons display with real data from hook
  const getCouponDisplayInfo = (coupon: any) => {
    const discountText = coupon.discountType === 'percentage'
      ? `${coupon.discountValue}% OFF`
      : coupon.discountType === 'fixed'
      ? `$${coupon.discountValue} OFF`
      : coupon.discountType === 'free_shipping'
      ? 'FREE SHIPPING'
      : coupon.displayText || coupon.description;

    const discountAmount = coupon.discountAmount > 0
      ? `Save $${coupon.discountAmount.toFixed(2)}`
      : '';

    const minimumText = coupon.minimumAmount > 0
      ? `Min. $${coupon.minimumAmount}`
      : 'No minimum';

    return {
      code: coupon.code,
      discountText,
      discountAmount,
      minimumText,
      type: coupon.discountType,
      isFreeShipping: coupon.discountType === 'free_shipping',
      description: coupon.description
    };
  };

  // Loading Skeleton Component
  const CartSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="p-6">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex gap-4 p-4 border-b last:border-b-0">
                      <Skeleton className="w-20 h-20 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Trust Badges Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <Skeleton key={item} className="h-20 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Order Summary Skeleton */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-lg" />
                </CardContent>
              </Card>

              {/* Coupon Section Skeleton */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading skeleton while initial loading
  if (isInitialLoading) {
    return <CartSkeleton />;
  }

  // Show empty state only after loading is complete and cart is actually empty
  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <ShoppingBag className="w-16 h-16 text-blue-400" />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Discover amazing products and add them to your cart
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                onClick={handleContinueShopping}
                className="gap-2 px-8 py-3 text-lg h-auto bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
              </Button>

              <Link href="/">
                <Button variant="outline" className="gap-2 px-8 py-3 text-lg h-auto">
                  <ArrowLeft className="w-5 h-5" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Recommended Products Section */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 bg-gray-300 rounded w-3/4" />
                      <Skeleton className="h-4 bg-gray-300 rounded w-1/2" />
                      <Skeleton className="h-6 bg-gray-300 rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                Shopping Cart
              </h1>
              <Badge variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              Review your items and proceed to checkout
              {!isAuthenticated && (
                <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  Guest mode
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleContinueShopping}
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>

            <Button
              variant="outline"
              onClick={handleClearCart}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 border-destructive/20"
              disabled={loading || clearingCart}
            >
              {clearingCart ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Table */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-background border-b">
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  Cart Items
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-hidden">
                  {/* Table Header - Desktop */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-muted/30 border-b text-sm font-semibold text-muted-foreground">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-3 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>

                  {/* Cart Items */}
                  <div className="divide-y divide-border">
                    {enhancedItems.map((displayItem, index) => {
                      const isUpdating = updatingItems.has(displayItem.id);
                      const isRemoving = removingItems.has(displayItem.id);
                      const isLowStock = displayItem.inventory?.quantity <= 5 && displayItem.inventory?.quantity > 0;

                      return (
                        <div
                          key={displayItem.id}
                          className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6 hover:bg-muted/30 transition-colors duration-200"
                        >
                          {/* Product Info */}
                          <div className="md:col-span-5 flex gap-3 md:gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="w-16 h-16 md:w-20 md:h-20 bg-background rounded-lg border border-border overflow-hidden shadow-sm">
                                <Image
                                  src={displayItem.image}
                                  alt={displayItem.title}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                  priority={index < 3}
                                />
                              </div>

                              {/* Quantity Badge */}
                              <div className="absolute -top-1 -left-1 md:-top-2 md:-left-2">
                                <Badge className="bg-primary text-primary-foreground text-xs h-4 md:h-5 px-1 md:px-1.5 min-w-4 md:min-w-5">
                                  {displayItem.quantity}
                                </Badge>
                              </div>

                              {/* Low Stock Badge */}
                              {isLowStock && (
                                <div className="absolute -bottom-1 -right-1">
                                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 bg-orange-50">
                                    {displayItem.inventory.quantity} left
                                  </Badge>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/products/${displayItem.productId}`}
                                className="font-semibold text-foreground hover:text-primary line-clamp-2 text-sm md:text-base transition-colors"
                              >
                                {displayItem.title}
                              </Link>

                              {/* Mobile price display */}
                              <div className="md:hidden flex items-center gap-2 mt-1">
                                <span className="font-semibold text-foreground text-sm">
                                  ${displayItem.price.toFixed(2)}
                                </span>
                                {displayItem.quantity > 1 && (
                                  <span className="text-xs text-muted-foreground">
                                    (${displayItem.totalPrice.toFixed(2)})
                                  </span>
                                )}
                              </div>

                              {/* Variants */}
                              {(displayItem.size || displayItem.color) && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {[displayItem.size, displayItem.color].filter(Boolean).join(' • ')}
                                </p>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-3 mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(displayItem.id)}
                                  disabled={isRemoving || loading}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2 gap-1"
                                >
                                  {isRemoving ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                  Remove
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs h-7 px-2 gap-1"
                                >
                                  <Heart className="w-3 h-3" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Price - Desktop */}
                          <div className="hidden md:flex md:col-span-2 flex-col items-center gap-1">
                            <span className="font-semibold text-foreground">
                              ${displayItem.price.toFixed(2)}
                            </span>
                            {displayItem.quantity > 1 && (
                              <span className="text-xs text-muted-foreground">
                                ${displayItem.totalPrice.toFixed(2)} total
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="md:col-span-3 flex items-center justify-between md:justify-center">
                            <span className="text-sm text-muted-foreground md:hidden">Quantity:</span>
                            <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 md:h-8 md:w-8 rounded hover:bg-muted"
                                onClick={() => handleQuantityChange(displayItem.id, displayItem.quantity - 1)}
                                disabled={displayItem.quantity <= 1 || isUpdating || loading}
                                aria-label={`Decrease quantity of ${displayItem.title}`}
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Minus className="w-3 h-3" />
                                )}
                              </Button>

                              <span className="text-sm font-medium w-6 text-center text-foreground">
                                {displayItem.quantity}
                              </span>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 md:h-8 md:w-8 rounded hover:bg-muted"
                                onClick={() => handleQuantityChange(displayItem.id, displayItem.quantity + 1)}
                                disabled={isUpdating || loading}
                                aria-label={`Increase quantity of ${displayItem.title}`}
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Plus className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Total */}
                          <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                            <span className="text-sm text-muted-foreground md:hidden">Total:</span>
                            <span className="font-bold text-base md:text-lg text-foreground">
                              ${displayItem.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {trustFeatures.map((feature, index) => (
                <div key={index} className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <feature.icon className={`w-8 h-8 mx-auto mb-2 ${feature.color}`} />
                  <p className="font-semibold text-sm text-gray-900 mb-1">{feature.text}</p>
                  <p className="text-xs text-gray-500">{feature.subtext}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Coupon Section */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-background border-b">
                <CardTitle className="text-xl font-semibold text-foreground">
                  Order Summary
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Summary Items */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-green-600">-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-foreground">Free</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium text-foreground">Calculated at checkout</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full gap-2 py-5 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </Button>

                {!isAuthenticated && (
                  <p className="text-sm text-muted-foreground text-center">
                    <Link
                      href="/auth/login"
                      className="text-primary hover:text-primary/80 font-medium hover:underline"
                    >
                      Sign in
                    </Link>{' '}
                    for faster checkout
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Coupon Section */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    Apply Coupon
                  </div>
                  {hasAvailableCoupons && !appliedCoupon && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {availableCoupons.length} available
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {appliedCoupon ? (
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Coupon Applied!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You saved ${discount.toFixed(2)} with {appliedCoupon.code}
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleRemoveAppliedCoupon}
                      className="w-full text-destructive hover:text-destructive hover:border-destructive/50 gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Remove Coupon
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className={cn(
                          "w-full uppercase font-mono",
                          couponValidationError && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                        disabled={isCouponLoading}
                      />
                      {couponValidationError && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          {couponValidationError}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleApplyCoupon}
                      disabled={!canApplyCoupon || isCouponLoading}
                      className="w-full gap-2"
                    >
                      {isCouponLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Ticket className="w-4 h-4" />
                          Apply Coupon
                        </>
                      )}
                    </Button>

                    {/* Available Coupons Section */}
                    {hasAvailableCoupons && (
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Tag className="w-4 h-4 text-green-600" />
                            Available Coupons
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                            className="text-xs h-6 px-2"
                          >
                            {showAvailableCoupons ? 'Hide' : 'Show'}
                          </Button>
                        </div>

                        {showAvailableCoupons && (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {loadingCoupons ? (
                              // Loading state for available coupons
                              <div className="space-y-2">
                                {[1, 2, 3].map((item) => (
                                  <div key={item} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                    <Skeleton className="h-4 w-16 bg-muted" />
                                    <div className="flex-1 space-y-1">
                                      <Skeleton className="h-3 w-24 bg-muted" />
                                      <Skeleton className="h-2 w-20 bg-muted" />
                                    </div>
                                    <Skeleton className="h-8 w-16 bg-muted rounded-md" />
                                  </div>
                                ))}
                              </div>
                            ) : availableCoupons.length > 0 ? (
                              // Available coupons list
                              availableCoupons.map((coupon, index) => {
                                const displayInfo = getCouponDisplayInfo(coupon);
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                                    onClick={() => handleQuickApplyCoupon(coupon.code)}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono font-bold text-green-800 text-sm">
                                          {displayInfo.code}
                                        </span>
                                        {displayInfo.isFreeShipping && (
                                          <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                                            FREE SHIPPING
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm font-semibold text-green-700">
                                        {displayInfo.discountText}
                                      </p>
                                      {displayInfo.discountAmount && (
                                        <p className="text-xs text-green-600">
                                          {displayInfo.discountAmount}
                                        </p>
                                      )}
                                      <p className="text-xs text-green-500 mt-1">
                                        {displayInfo.minimumText}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuickApplyCoupon(coupon.code);
                                      }}
                                    >
                                      Apply
                                    </Button>
                                  </div>
                                );
                              })
                            ) : (
                              // No available coupons state
                              <div className="text-center py-4 text-muted-foreground">
                                <Ticket className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No coupons available</p>
                                <p className="text-xs">Add more items to unlock coupons</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* No available coupons message */}
                    {!hasAvailableCoupons && !loadingCoupons && (
                      <div className="pt-4 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground">
                          No coupons available for your cart
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
