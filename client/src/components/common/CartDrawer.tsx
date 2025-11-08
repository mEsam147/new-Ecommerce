// components/layout/CartDrawer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Loader2,
  ShoppingCart,
  Sparkles,
  Tag,
  Shield,
  Truck,
  CreditCard,
  Trash,
  ExternalLink
} from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    items,
    totalItems,
    subtotal,
    total,
    discount,
    updateQuantity,
    removeFromCart,
    clearCart,
    loading,
    isEmpty,
    needsCartMerge,
  } = useCart();

  const { isAuthenticated, manualMergeCarts } = useAuth();

  const [isMounted, setIsMounted] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [clearingCart, setClearingCart] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Handle mount state for drawer
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsAnimatingOut(false);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setIsMounted(false);
        setIsAnimatingOut(false);
      }, 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close drawer when pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateQuantity({ itemId, quantity: newQuantity });
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (items.length === 0) return;

    setClearingCart(true);
    try {
      await clearCart();
      setShowClearConfirm(false);
    } finally {
      setClearingCart(false);
    }
  };

  const handleShowClearConfirm = () => {
    if (items.length === 0) return;
    setShowClearConfirm(true);
  };

  const handleCancelClear = () => {
    setShowClearConfirm(false);
  };

  const handleMergeCart = async () => {
    setIsMerging(true);
    try {
      await manualMergeCarts();
    } finally {
      setIsMerging(false);
    }
  };

  const handleCheckout = () => {
    onClose();
    window.location.href = '/checkout';
  };

  const handleViewCartPage = () => {
    onClose();
    window.location.href = '/cart';
  };

  // Enhanced helper function to handle unpopulated product data
  const getEnhancedItemDisplayInfo = (item: any) => {
    const productId = item.productId || item.product?._id || item.product;
    const productTitle = item.product?.title || 'Product';
    const productImage = item.product?.images?.[0]?.url || '/images/placeholder-product.jpg';
    const price = item.price || item.product?.price || 0;
    const quantity = item.quantity || item.qty || 1;
    const size = item.size || item.variant?.size;
    const color = item.color || item.variant?.color;
    const comparePrice = item.product?.comparePrice;

    return {
      id: item.id || item._id,
      productId,
      title: productTitle,
      image: productImage,
      price,
      comparePrice,
      quantity,
      size,
      color,
      totalPrice: price * quantity,
      hasDiscount: comparePrice && comparePrice > price
    };
  };

  // Calculate savings
  const totalSavings = items.reduce((acc, item) => {
    const displayItem = getEnhancedItemDisplayInfo(item);
    if (displayItem.hasDiscount) {
      return acc + ((displayItem.comparePrice! - displayItem.price) * displayItem.quantity);
    }
    return acc;
  }, 0);

  // Free shipping progress
  const FREE_SHIPPING_THRESHOLD = 50;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const needsForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  if (!isMounted) return null;

  return (
    <>
      {/* Enhanced Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      />

      {/* Enhanced Drawer */}
      <motion.div
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col h-full"
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                </motion.div>
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 min-w-5 px-1 text-xs font-bold border-2 border-white shadow-lg"
                      >
                        {totalItems > 99 ? '99+' : totalItems}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Your Cart
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                  {!isAuthenticated && (
                    <>
                      <span>•</span>
                      <span className="text-orange-500 font-medium">Guest</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Clear Cart Button in Header */}
              {!isEmpty && (
                <motion.button
                  onClick={handleShowClearConfirm}
                  className="h-9 w-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all duration-200 border border-gray-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Clear all items"
                  disabled={clearingCart}
                >
                  {clearingCart ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash className="w-4 h-4" />
                  )}
                </motion.button>
              )}

              <motion.button
                onClick={onClose}
                className="h-9 w-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-all duration-200 border border-gray-200"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-gray-500" />
              </motion.button>
            </div>
          </div>

          {/* Clear Cart Confirmation Dialog */}
          <AnimatePresence>
            {showClearConfirm && (
              <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Trash2 className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Clear Cart?
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Are you sure you want to remove all {items.length} items from your cart? This action cannot be undone.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleCancelClear}
                      className="flex-1 border-gray-300 hover:border-gray-400"
                      disabled={clearingCart}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleClearCart}
                      className="flex-1 gap-2"
                      disabled={clearingCart}
                    >
                      {clearingCart ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Clear All
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Merge Cart Banner */}
          {needsCartMerge && isAuthenticated && (
            <motion.div
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-200 px-4 py-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Merge your cart?
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    You have items from your guest session
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleMergeCart}
                  disabled={isMerging}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 shadow-md"
                >
                  {isMerging ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Merge Now'
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Free Shipping Progress */}
          {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
            <div className="px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  ${needsForFreeShipping.toFixed(2)} away from free shipping!
                </span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${shippingProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Cart Content */}
          <div className="flex-1 overflow-hidden">
            {isEmpty ? (
              // Enhanced Empty State
              <motion.div
                className="flex flex-col items-center justify-center h-full p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <ShoppingCart className="w-10 h-10 text-gray-400" />
                </div>

                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-8 text-lg max-w-sm">
                  Discover amazing products and add them to your cart
                </p>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Button
                    onClick={onClose}
                    className="gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3 text-base"
                    size="lg"
                  >
                    Start Shopping
                    <ArrowRight className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="outline"
                    asChild
                    className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  >
                    <Link href="/products" onClick={onClose}>
                      Browse Products
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Enhanced Cart Items */}
                <ScrollArea className="h-[calc(100vh-440px)]">
                  <div className="p-6 space-y-4">
                    <AnimatePresence>
                      {items.map((item, index) => {
                        const displayItem = getEnhancedItemDisplayInfo(item);
                        const isUpdating = updatingItems.has(displayItem.id);

                        return (
                          <motion.div
                            key={displayItem.id}
                            className="flex gap-4 p-4 rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ delay: index * 0.1 }}
                            layout
                          >
                            {/* Product Image */}
                            <div className="flex-shrink-0 relative">
                              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                                <Image
                                  src={displayItem.image}
                                  alt={displayItem.title}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              {/* Discount Badge */}
                              {displayItem.hasDiscount && (
                                <div className="absolute -top-1 -left-1">
                                  <Badge variant="default" className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                                    <Tag className="w-3 h-3 mr-1" />
                                    Save
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-sm leading-tight line-clamp-2 text-gray-900 flex-1 pr-2">
                                  {displayItem.title}
                                </h4>
                                <motion.button
                                  onClick={() => handleRemoveItem(displayItem.id)}
                                  className="h-7 w-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all duration-200"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  disabled={isUpdating || loading}
                                >
                                  {isUpdating ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <X className="w-3 h-3" />
                                  )}
                                </motion.button>
                              </div>

                              {/* Variants */}
                              {(displayItem.size || displayItem.color) && (
                                <p className="text-xs text-gray-500 font-medium">
                                  {[displayItem.size, displayItem.color].filter(Boolean).join(' • ')}
                                </p>
                              )}

                              {/* Price & Quantity */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-base text-gray-900">
                                    ${displayItem.price.toFixed(2)}
                                  </span>
                                  {displayItem.hasDiscount && (
                                    <span className="text-sm text-gray-500 line-through">
                                      ${displayItem.comparePrice!.toFixed(2)}
                                    </span>
                                  )}
                                </div>

                                {/* Enhanced Quantity Controls */}
                                <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg hover:bg-white hover:text-red-500 transition-all"
                                    onClick={() => handleQuantityChange(displayItem.id, displayItem.quantity - 1)}
                                    disabled={displayItem.quantity <= 1 || isUpdating || loading}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>

                                  <span className="text-sm font-bold w-6 text-center text-gray-700">
                                    {displayItem.quantity}
                                  </span>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg hover:bg-white hover:text-green-500 transition-all"
                                    onClick={() => handleQuantityChange(displayItem.id, displayItem.quantity + 1)}
                                    disabled={isUpdating || loading}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Item Total */}
                              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                                <span className="text-xs text-gray-500">Item total:</span>
                                <span className="font-semibold text-gray-900">
                                  ${displayItem.totalPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </ScrollArea>

                {/* Enhanced Footer */}
                <div className="border-t border-gray-200 bg-white p-6 space-y-6">


                  {/* Enhanced Summary */}
                  <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Savings</span>
                        <span className="font-semibold text-green-600">
                          -${totalSavings.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium text-green-600">-${discount.toFixed(2)}</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${total.toFixed(2)}
                      </span>
                    </div>

                    {subtotal >= FREE_SHIPPING_THRESHOLD && (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 rounded-lg p-2">
                        <Truck className="w-4 h-4" />
                        <span>Free shipping applied! 🎉</span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Actions */}
                  <div className="space-y-3">
                    <Button
                      className="w-full gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3 text-base font-semibold"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Checkout Now
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                        onClick={handleViewCartPage}
                        disabled={loading}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Cart Page
                      </Button>

                      <Button
                        variant="outline"
                        className="flex-1 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                        onClick={onClose}
                        disabled={loading}
                      >
                        Continue
                      </Button>
                    </div>

                    {/* Enhanced Clear Cart Button */}
                    <Button
                      variant="ghost"
                      onClick={handleShowClearConfirm}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium py-2 transition-all duration-200 border border-red-200 hover:border-red-300"
                      disabled={loading || clearingCart}
                    >
                      {clearingCart ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Clear All Items ({items.length})
                    </Button>

                    {!isAuthenticated && (
                      <p className="text-xs text-gray-500 text-center">
                        <Link
                          href="/auth/login"
                          className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                          onClick={onClose}
                        >
                          Sign in
                        </Link>{' '}
                        for faster checkout and saved cart
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};
