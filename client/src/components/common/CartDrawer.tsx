// components/layout/CartDrawer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2, Loader2, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';

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
  } = useCart();

  const { isAuthenticated, manualMergeCarts } = useAuth();
  const { needsCartMerge } = useCart();

  const [isMounted, setIsMounted] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [clearingCart, setClearingCart] = useState(false);

  // Handle mount state for drawer
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsMounted(false), 300);
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
    setClearingCart(true);
    try {
      await clearCart();
    } finally {
      setClearingCart(false);
    }
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

  // Enhanced helper function to handle unpopulated product data
  const getEnhancedItemDisplayInfo = (item: any) => {
    const productId = item.productId || item.product?._id || item.product;
    const productTitle = item.product?.title || 'Product';
    const productImage = item.product?.images?.[0]?.url || '/images/placeholder-product.jpg';
    const price = item.price || item.product?.price || 0;
    const quantity = item.quantity || item.qty || 1;
    const size = item.size || item.variant?.size;
    const color = item.color || item.variant?.color;

    return {
      id: item.id || item._id,
      productId,
      title: productTitle,
      image: productImage,
      price,
      quantity,
      size,
      color,
      totalPrice: price * quantity
    };
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleBackdropClick}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50",
          "transform transition-transform duration-300 ease-out",
          "flex flex-col h-full",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Cart
                </h2>
                <p className="text-sm text-gray-500">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  {!isAuthenticated && ' • Guest'}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-md hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Merge Cart Banner */}
          {needsCartMerge && isAuthenticated && (
            <div className="bg-blue-50 border-y border-blue-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3"
                >
                  {isMerging ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Merge'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Cart Content */}
          <div className="flex-1 overflow-hidden">
            {isEmpty ? (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Discover amazing products and add them to your cart
                </p>

                <Button
                  onClick={onClose}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start Shopping
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <ScrollArea className="h-[calc(100vh-380px)]">
                  <div className="p-4 space-y-3">
                    {items.map((item) => {
                      const displayItem = getEnhancedItemDisplayInfo(item);
                      const isUpdating = updatingItems.has(displayItem.id);

                      return (
                        <div
                          key={displayItem.id}
                          className="flex gap-3 p-3 rounded-lg border border-gray-200 bg-white"
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={displayItem.image}
                                alt={displayItem.title}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-medium text-sm leading-tight line-clamp-2 text-gray-900 flex-1 pr-2">
                                {displayItem.title}
                              </h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(displayItem.id)}
                                className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                disabled={isUpdating || loading}
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                              </Button>
                            </div>

                            {/* Variants */}
                            {(displayItem.size || displayItem.color) && (
                              <p className="text-xs text-gray-500 mb-2">
                                {[displayItem.size, displayItem.color].filter(Boolean).join(' • ')}
                              </p>
                            )}

                            {/* Price & Quantity */}
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm text-gray-900">
                                ${displayItem.price.toFixed(2)}
                              </span>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded hover:bg-white"
                                  onClick={() => handleQuantityChange(displayItem.id, displayItem.quantity - 1)}
                                  disabled={displayItem.quantity <= 1 || isUpdating || loading}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>

                                <span className="text-sm font-medium w-6 text-center text-gray-700">
                                  {displayItem.quantity}
                                </span>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded hover:bg-white"
                                  onClick={() => handleQuantityChange(displayItem.id, displayItem.quantity + 1)}
                                  disabled={isUpdating || loading}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-white p-4 space-y-4">
                  {/* Summary */}
                  <div className="space-y-2">
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

                    <div className="flex justify-between text-base font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Checkout Now
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 border-gray-300 hover:border-gray-400"
                        asChild
                        disabled={loading}
                      >
                        <Link href={"/cart"}>
                            <ShoppingCart className="w-4 h-4" />
                        View Cart
                        </Link>

                      </Button>

                      <Button
                        variant="outline"
                        className="flex-1 border-gray-300 hover:border-gray-400"
                        onClick={onClose}
                        disabled={loading}
                      >
                        Continue
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={handleClearCart}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
                      disabled={loading || clearingCart}
                    >
                      {clearingCart ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Clear All Items
                    </Button>

                    {!isAuthenticated && (
                      <p className="text-xs text-gray-500 text-center">
                        <Link
                          href="/auth/login"
                          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                          onClick={onClose}
                        >
                          Sign in
                        </Link>{' '}
                        for faster checkout
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
