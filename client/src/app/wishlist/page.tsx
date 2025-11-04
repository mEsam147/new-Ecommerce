// app/wishlist/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';
import { WishlistItem } from '@/components/wishlist/WishlistItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Merge,
  LogIn,
  Search,
  Filter,
  ShoppingCart,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/lib/hooks/useToast';
import Link from 'next/link';

export default function WishlistPage() {
  const {
    items,
    totalItems,
    loading,
    needsWishlistMerge,
    mergeStatus,
    clearWishlist,
    handleMergeWishlists,
    refreshWishlist
  } = useWishlist();

  const { isAuthenticated, user } = useAuth();
  const { addToCart, updateQuantity, items: cartItems, loading: cartLoading } = useCart();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [clearing, setClearing] = useState(false);
  const [merging, setMerging] = useState(false);
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  const [addedToCart, setAddedToCart] = useState<{ [key: string]: boolean }>({});

  // Filter and sort items
  const filteredItems = items.filter(item => {
    const product = item.product || item;
    const searchLower = searchTerm.toLowerCase();
    return (
      product.title.toLowerCase().includes(searchLower) ||
      product.brand?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower)
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const productA = a.product || a;
    const productB = b.product || b;

    switch (sortBy) {
      case 'recent':
        return new Date(b.addedAt || b.createdAt).getTime() - new Date(a.addedAt || a.createdAt).getTime();
      case 'price-low':
        return (productA.price || 0) - (productB.price || 0);
      case 'price-high':
        return (productB.price || 0) - (productA.price || 0);
      case 'name':
        return (productA.title || '').localeCompare(productB.title || '');
      case 'rating':
        return (productB.rating?.average || 0) - (productA.rating?.average || 0);
      default:
        return 0;
    }
  });

  useEffect(() => {
    // Refresh wishlist when component mounts if authenticated
    if (isAuthenticated) {
      refreshWishlist();
    }
  }, [isAuthenticated, refreshWishlist]);

  const handleClearWishlist = async () => {
    if (clearing || items.length === 0) return;

    setClearing(true);
    try {
      await clearWishlist();
      success('Wishlist cleared successfully');
    } catch (err) {
      error('Failed to clear wishlist');
    } finally {
      setClearing(false);
    }
  };

  const handleMerge = async () => {
    if (merging) return;

    setMerging(true);
    try {
      const result = await handleMergeWishlists();
      if (result.success) {
        success(result.message || 'Wishlists merged successfully');
      }
    } catch (err) {
      // Error is handled in the hook
    } finally {
      setMerging(false);
    }
  };

  // Handle Add to Cart from Wishlist
  const handleAddToCart = async (item: any) => {
    const product = item.product || item;
    const itemId = item.id || item._id;

    if (addingToCart[itemId]) return;

    setAddingToCart(prev => ({ ...prev, [itemId]: true }));

    try {
      const result = await addToCart({
        product,
        quantity: 1
      });

      if (result) {
        setAddedToCart(prev => ({ ...prev, [itemId]: true }));
        success(`Added ${product.title} to cart!`);

        // Reset the added state after 2 seconds
        setTimeout(() => {
          setAddedToCart(prev => ({ ...prev, [itemId]: false }));
        }, 2000);
      }
    } catch (err) {
      error('Failed to add item to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Handle Add All to Cart with proper deduplication
  const handleAddAllToCart = async () => {
    if (filteredItems.length === 0) return;

    let successCount = 0;
    let updatedCount = 0;

    for (const item of filteredItems) {
      const product = item.product || item;
      const itemId = item.id || item._id;

      try {
        // Use the addToCart function which handles deduplication internally
        const result = await addToCart({
          product,
          quantity: 1
        });

        if (result) {
          successCount++;
        }
      } catch (err) {
        console.error(`Failed to add ${product.title} to cart`);
      }
    }

    if (successCount > 0) {
      success(`Added ${successCount} item${successCount === 1 ? '' : 's'} to cart!`);
    } else {
      error('Failed to add items to cart');
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32 mt-4 lg:mt-0" />
          </div>

          {/* Controls Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Items Skeleton */}
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="flex items-center gap-4 mb-4 lg:mb-0">
              <div className="p-3 bg-primary/10 rounded-full">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  My Wishlist
                </h1>
                <p className="text-muted-foreground mt-1">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} saved for later
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {needsWishlistMerge && (
                <Button
                  onClick={handleMerge}
                  disabled={merging}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  {merging ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Merging...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Merge className="w-4 h-4" />
                      <span>Merge Items</span>
                    </div>
                  )}
                </Button>
              )}

              {filteredItems.length > 0 && (
                <>
                  <Button
                    onClick={handleAddAllToCart}
                    disabled={cartLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {cartLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Adding...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add All to Cart</span>
                      </div>
                    )}
                  </Button>

                  <Button
                    onClick={handleClearWishlist}
                    disabled={clearing}
                    variant="outline"
                    className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                  >
                    {clearing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Clearing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        <span>Clear All</span>
                      </div>
                    )}
                  </Button>
                </>
              )}

              <Button asChild>
                <Link href="/shop">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          {/* Merge Notification */}
          {needsWishlistMerge && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Merge className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        Merge your wishlist items
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You have {items.length} items in your guest wishlist. Merge them to your account to save them permanently.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleMerge}
                    disabled={merging}
                    size="sm"
                  >
                    {merging ? 'Merging...' : 'Merge Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Authentication Prompt */}
          {!isAuthenticated && items.length > 0 && (
            <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LogIn className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-foreground">
                        Save your wishlist permanently
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Create an account or log in to save your wishlist items across devices.
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="border-amber-300 text-amber-700">
                    <Link href="/auth/login">
                      Sign In
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter Controls */}
          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search in wishlist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Empty State */}
          {items.length === 0 && (
            <Card className="text-center py-16">
              <CardContent className="space-y-6">
                <div className="w-24 h-24 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                  <Heart className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Your wishlist is empty
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Start exploring our products and add items you love to your wishlist for easy access later.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg">
                    <Link href="/shop">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Start Shopping
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/shop?filter=featured">
                      View Featured Products
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wishlist Items */}
          {items.length > 0 && (
            <div className="space-y-4">
              {/* Results Info */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredItems.length} of {totalItems} items
                  {searchTerm && (
                    <span> for "<strong>{searchTerm}</strong>"</span>
                  )}
                </p>
                {filteredItems.length !== totalItems && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </Button>
                )}
              </div>

              {/* Items Grid */}
              <div className="space-y-4">
                {sortedItems.map((item, index) => {
                  const itemId = item.id || item._id || `wishlist-item-${index}`;
                  const isAdding = addingToCart[itemId];
                  const isAdded = addedToCart[itemId];

                  return (
                    <div key={itemId} className="relative">
                      <WishlistItem
                        item={item}
                        onAddToCart={() => handleAddToCart(item)}
                        isAddingToCart={isAdding}
                        addedToCart={isAdded}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              {filteredItems.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-border/50">
                  <Button
                    onClick={handleAddAllToCart}
                    disabled={cartLoading}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {cartLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Adding All to Cart...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add All to Cart ({filteredItems.length} items)</span>
                      </div>
                    )}
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                  >
                    <Link href="/shop">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Discover More Products
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
