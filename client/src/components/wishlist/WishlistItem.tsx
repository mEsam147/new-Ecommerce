// components/wishlist/WishlistItem.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  ShoppingCart,
  CheckCircle,
  Loader2,
  Trash2,
  Eye,
  Plus,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useCart } from '@/lib/hooks/useCart';
import { useToast } from '@/lib/hooks/useToast';

interface WishlistItemProps {
  item: any;
  onAddToCart?: () => void;
  isAddingToCart?: boolean;
  addedToCart?: boolean;
}

export function WishlistItem({
  item,
  onAddToCart,
  isAddingToCart = false,
  addedToCart = false
}: WishlistItemProps) {
  const { removeFromWishlist, removingItem } = useWishlist();
  const { addToCart, updateQuantity, items: cartItems, getItemCount } = useCart();
  const { error, success } = useToast();

  const product = item.product || item;
  const itemId = item.id || item._id;

  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [isInCart, setIsInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  // Check if item is already in cart
  useEffect(() => {
    const checkCartStatus = () => {
      const cartItem = cartItems.find((cartItem: any) => {
        const cartProductId = cartItem.productId || cartItem.product?._id;
        return cartProductId === product._id;
      });

      if (cartItem) {
        setIsInCart(true);
        setCartItemId(cartItem.id || cartItem._id);
        setCartQuantity(cartItem.quantity || 0);
      } else {
        setIsInCart(false);
        setCartItemId(null);
        setCartQuantity(0);
      }
    };

    checkCartStatus();
  }, [cartItems, product._id]);

  const handleRemove = async () => {
    try {
      await removeFromWishlist(itemId);
    } catch (err) {
      error('Failed to remove item from wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (isInCart && cartItemId) {
      // Item already in cart, update quantity
      try {
        const newQuantity = cartQuantity + currentQuantity;
        await updateQuantity({
          itemId: cartItemId,
          quantity: newQuantity
        });
        success(`Updated ${product.title} quantity to ${newQuantity} in cart!`);
        if (onAddToCart) onAddToCart();
      } catch (err) {
        error('Failed to update item quantity in cart');
      }
    } else {
      // Add new item to cart
      if (onAddToCart) {
        onAddToCart();
      }
    }
  };

  const handleIncreaseQuantity = () => {
    setCurrentQuantity(prev => {
      const maxAvailable = product.inventory?.quantity || 10;
      return prev < maxAvailable ? prev + 1 : prev;
    });
  };

  const handleDecreaseQuantity = () => {
    setCurrentQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  const getStockStatus = () => {
    if (!product.inventory?.trackQuantity) return 'In Stock';

    if (product.inventory.quantity === 0) return 'Out of Stock';
    if (product.inventory.quantity <= 10) return `Only ${product.inventory.quantity} left`;
    return 'In Stock';
  };

  const getStockVariant = () => {
    if (!product.inventory?.trackQuantity) return "outline";

    if (product.inventory.quantity === 0) return "destructive";
    if (product.inventory.quantity <= 10) return "secondary";
    return "outline";
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-border/50 group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Product Image */}
          <Link
            href={`/products/${product.slug || product._id}`}
            className="flex-shrink-0"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg border border-border overflow-hidden bg-muted/50 group-hover:shadow-sm transition-shadow">
              <img
                src={product.images?.[0]?.url || product.image || '/images/placeholder-product.jpg'}
                alt={product.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
          </Link>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${product.slug || product._id}`}
                  className="hover:underline"
                >
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {product.title}
                  </h3>
                </Link>

                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {product.description || 'No description available'}
                </p>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-lg font-bold text-foreground">
                    ${product.price}
                  </span>

                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}

                  <Badge
                    variant={getStockVariant()}
                    className="text-xs"
                  >
                    {getStockStatus()}
                  </Badge>

                  {product.rating?.average && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>⭐ {product.rating.average}</span>
                      <span>({product.rating.count || 0})</span>
                    </div>
                  )}

                  {isInCart && (
                    <Badge variant="default" className="text-xs bg-blue-600">
                      In Cart: {cartQuantity}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {/* Quantity Selector */}
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleDecreaseQuantity}
                    disabled={currentQuantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium w-6 text-center">
                    {currentQuantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleIncreaseQuantity}
                    disabled={product.inventory?.trackQuantity && currentQuantity >= product.inventory.quantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || addedToCart || (product.inventory?.trackQuantity && product.inventory.quantity === 0)}
                  size="sm"
                  className={`w-32 ${
                    addedToCart
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : isInCart
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-primary hover:bg-primary/90 text-white'
                  }`}
                >
                  {isAddingToCart ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs">Adding...</span>
                    </div>
                  ) : addedToCart ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs">Added!</span>
                    </div>
                  ) : isInCart ? (
                    <div className="flex items-center gap-2">
                      <Plus className="w-3 h-3" />
                      <span className="text-xs">Add More</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-3 h-3" />
                      <span className="text-xs">Add to Cart</span>
                    </div>
                  )}
                </Button>

                {/* View Product Button */}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-32"
                >
                  <Link href={`/products/${product.slug || product._id}`}>
                    <Eye className="w-3 h-3 mr-1" />
                    <span className="text-xs">View Product</span>
                  </Link>
                </Button>

                {/* Remove Button */}
                <Button
                  onClick={handleRemove}
                  disabled={removingItem === itemId}
                  variant="ghost"
                  size="sm"
                  className="w-32 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {removingItem === itemId ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs">Removing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-3 h-3" />
                      <span className="text-xs">Remove</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>Added: {new Date(item.addedAt || item.createdAt).toLocaleDateString()}</span>

              {product.brand && (
                <span>Brand: {product.brand}</span>
              )}

              {product.category && (
                <span>Category: {product.category}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
