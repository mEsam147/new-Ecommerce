// app/wishlist/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Merge,
  LogIn,
  Search,
  ShoppingCart,
  Loader2,
  X,
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
import ProductCard from '@/components/common/ProductCard';

interface ActionState {
  clearing: boolean;
  merging: boolean;
  addingAll: boolean;
  removingProducts: Set<string>;
}

export default function WishlistPage() {
  const {
    items,
    totalItems,
    loading,
    needsWishlistMerge,
    clearWishlist,
    handleMergeWishlists,
    removeFromWishlist
  } = useWishlist();

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [actionState, setActionState] = useState<ActionState>({
    clearing: false,
    merging: false,
    addingAll: false,
    removingProducts: new Set(),
  });

  // Process wishlist items
  const { products, filteredProducts, sortedProducts } = useMemo(() => {
    // Extract products from wishlist items
    const products = items.map(item => ({
      ...(item.product || item),
      wishlistItemId: item.id || item._id,
      addedAt: item.addedAt || item.createdAt,
    }));

    // Filter products
    const filteredProducts = searchTerm ? products.filter(product => {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.title.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
      );
    }) : products;

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime();
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'rating':
          return (b.rating?.average || 0) - (a.rating?.average || 0);
        default:
          return 0;
      }
    });

    return { products, filteredProducts, sortedProducts };
  }, [items, searchTerm, sortBy]);

  // Action handlers
  const handleClearWishlist = async () => {
    if (actionState.clearing || items.length === 0) return;

    setActionState(prev => ({ ...prev, clearing: true }));
    try {
      await clearWishlist();
      success('Wishlist cleared successfully');
    } catch (err) {
      error('Failed to clear wishlist');
    } finally {
      setActionState(prev => ({ ...prev, clearing: false }));
    }
  };

  const handleMerge = async () => {
    if (actionState.merging) return;

    setActionState(prev => ({ ...prev, merging: true }));
    try {
      const result = await handleMergeWishlists();
      if (result.success) {
        success(result.message || 'Wishlists merged successfully');
      }
    } catch (err) {
      // Error handled in hook
    } finally {
      setActionState(prev => ({ ...prev, merging: false }));
    }
  };

  const handleAddAllToCart = async () => {
    if (actionState.addingAll || filteredProducts.length === 0) return;

    setActionState(prev => ({ ...prev, addingAll: true }));
    try {
      let successCount = 0;

      for (const product of filteredProducts) {
        try {
          await addToCart({ product, quantity: 1 });
          successCount++;
        } catch (err) {
          console.error(`Failed to add ${product.title} to cart`);
        }
      }

      if (successCount > 0) {
        success(`Added ${successCount} item${successCount === 1 ? '' : 's'} to cart!`);
      } else {
        error('Failed to add any items to cart');
      }
    } catch (err) {
      error('Failed to add items to cart');
    } finally {
      setActionState(prev => ({ ...prev, addingAll: false }));
    }
  };

  const handleRemoveFromWishlist = async (productId: string, productTitle?: string) => {
    if (actionState.removingProducts.has(productId)) return;

    setActionState(prev => ({
      ...prev,
      removingProducts: new Set(prev.removingProducts).add(productId)
    }));

    try {
      await removeFromWishlist(productId, productTitle);
    } finally {
      setActionState(prev => {
        const newRemoving = new Set(prev.removingProducts);
        newRemoving.delete(productId);
        return { ...prev, removingProducts: newRemoving };
      });
    }
  };

  const handleQuickAddToCart = async (product: any) => {
    try {
      await addToCart({ product, quantity: 1 });
      success(`Added ${product.title} to cart!`);
    } catch (err) {
      error('Failed to add item to cart');
    }
  };

  // Loading state
  if (loading && items.length === 0) {
    return <WishlistSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className="p-3 bg-primary/10 rounded-full">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Wishlist</h1>
              <p className="text-muted-foreground mt-1">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {needsWishlistMerge && (
              <Button
                onClick={handleMerge}
                disabled={actionState.merging}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                {actionState.merging ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Merge className="w-4 h-4 mr-2" />
                )}
                {actionState.merging ? 'Merging...' : 'Merge Items'}
              </Button>
            )}

            {products.length > 0 && (
              <>
                <Button
                  onClick={handleAddAllToCart}
                  disabled={actionState.addingAll}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {actionState.addingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 mr-2" />
                  )}
                  Add All to Cart
                </Button>

                <Button
                  onClick={handleClearWishlist}
                  disabled={actionState.clearing}
                  variant="outline"
                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  {actionState.clearing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Clear All
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

        {/* Notifications */}
        {needsWishlistMerge && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Merge className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Merge your wishlist items</p>
                    <p className="text-sm text-muted-foreground">
                      You have items in your guest wishlist. Merge them to your account to save them permanently.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleMerge}
                  disabled={actionState.merging}
                  size="sm"
                >
                  {actionState.merging ? 'Merging...' : 'Merge Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isAuthenticated && products.length > 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-medium">Save your wishlist permanently</p>
                    <p className="text-sm text-muted-foreground">
                      Create an account or log in to save your wishlist items across devices.
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="border-amber-300 text-amber-700">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        {products.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search in wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
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
        {products.length === 0 && !loading && (
          <EmptyWishlistState />
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {totalItems} items
                {searchTerm && ` for "${searchTerm}"`}
              </p>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="text-muted-foreground"
                >
                  Clear search
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product, index) => (
                <ProductCard

                  key={product._id}
                  product={product}
                  isRemoving={actionState.removingProducts.has(product._id)}
                  onRemove={() => handleRemoveFromWishlist(product._id, product.title)}
                  onAddToCart={() => handleQuickAddToCart(product)}
                />
              ))}
            </div>

            {/* Bottom Actions */}
            {filteredProducts.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t">
                <Button
                  onClick={handleAddAllToCart}
                  disabled={actionState.addingAll}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {actionState.addingAll ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Adding All to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add All to Cart ({filteredProducts.length} items)
                    </>
                  )}
                </Button>

                <Button asChild variant="outline" size="lg">
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
  );
}


// Empty state component
function EmptyWishlistState() {
  return (
    <Card className="text-center py-16">
      <CardContent className="space-y-6">
        <div className="w-24 h-24 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
          <Heart className="w-12 h-12 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Your wishlist is empty</h3>
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
  );
}

// Skeleton component
function WishlistSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32 mt-4 lg:mt-0" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
