// components/profile/WishlistTab.tsx
'use client';

import React, { useState } from 'react';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Heart, Trash2, ArrowRight, Image as ImageIcon, Calendar } from 'lucide-react';
import Link from 'next/link';
import * as motion from 'framer-motion/client';

export const WishlistTab: React.FC = () => {
  const {
    items: wishlistItems,
    isLoading: wishlistLoading,
    removeFromWishlist,
    clearWishlist
  } = useWishlist();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Handle single item deletion
  const handleRemoveClick = (productId: string, productName: string) => {
    setItemToDelete({ id: productId, name: productName });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await removeFromWishlist(itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleClearAllClick = () => {
    setClearAllModalOpen(true);
  };

  const handleConfirmClearAll = async () => {
    await clearWishlist();
    setClearAllModalOpen(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate stock status based on inventory
  const getStockStatus = (inventory: any) => {
    if (!inventory?.trackQuantity) return { status: 'Available', variant: 'default' as const };

    const quantity = inventory.quantity || 0;
    if (quantity === 0) return { status: 'Out of Stock', variant: 'secondary' as const };
    if (quantity <= inventory.lowStockAlert) return { status: 'Low Stock', variant: 'outline' as const };
    return { status: 'In Stock', variant: 'default' as const };
  };

  // Generate product slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  if (wishlistLoading) {
    return <WishlistSkeleton />;
  }

  // Transform the API response to work with our table
  const tableItems = wishlistItems.map((item: any) => {
    const product = item.product;
    const productId = product?._id;
    const productName = product?.title || 'Unknown Product';
    const productImage = product?.images?.[0]?.url;
    const productPrice = product?.price;
    const inventory = product?.inventory;
    const rating = product?.rating;
    const addedAt = item.addedAt;

    return {
      id: item._id,
      productId,
      productName,
      productImage,
      productPrice,
      inventory,
      rating,
      addedAt,
      slug: generateSlug(productName)
    };
  });

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                My Wishlist
                {tableItems.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {tableItems.length} {tableItems.length === 1 ? 'item' : 'items'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Your saved items for later
              </CardDescription>
            </div>
            {tableItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllClick}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {tableItems.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Price</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Rating</TableHead>
                      <TableHead className="text-center">Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableItems.map((item) => {
                      const stockInfo = getStockStatus(item.inventory);
                      const rating = item.rating?.average;
                      const reviewCount = item.rating?.count;

                      return (
                        <motion.tr
                          key={item.id}
                          variants={itemVariants}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          {/* Product Image */}
                          <TableCell>
                            <Link
                              href={`/shop/product/${item.slug}`}
                              className="block w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center"
                            >
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              )}
                            </Link>
                          </TableCell>

                          {/* Product Name and Info */}
                          <TableCell>
                            <Link
                              href={`/shop/product/${item.slug}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              <div className="font-medium text-gray-900 line-clamp-2 hover:underline">
                                {item.productName}
                              </div>
                            </Link>
                            {item.inventory?.trackQuantity && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.inventory.quantity} in stock
                              </p>
                            )}
                          </TableCell>

                          {/* Price */}
                          <TableCell className="text-center">
                            <span className="font-semibold text-gray-900">
                              ${item.productPrice?.toFixed(2) || 'N/A'}
                            </span>
                          </TableCell>

                          {/* Stock Status */}
                          <TableCell className="text-center">
                            <Badge
                              variant={stockInfo.variant}
                              className="text-xs"
                            >
                              {stockInfo.status}
                            </Badge>
                          </TableCell>

                          {/* Rating */}
                          <TableCell className="text-center">
                            {rating ? (
                              <div className="flex flex-col items-center space-y-1">
                                <div className="flex text-yellow-400 text-sm">
                                  {'★'.repeat(Math.floor(rating))}
                                  {'☆'.repeat(5 - Math.floor(rating))}
                                </div>
                                <span className="text-xs text-gray-500">
                                  ({reviewCount || 0} reviews)
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No ratings</span>
                            )}
                          </TableCell>

                          {/* Added Date */}
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.addedAt)}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                                asChild
                              >
                                <Link href={`/shop/product/${item.slug}`}>
                                  View
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                                onClick={() => handleRemoveClick(item.productId, item.productName)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-12 h-12 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Save items you love for later. Click the heart icon on any product to add it to your wishlist.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/shop">
                      Explore Products
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/categories">
                      Browse Categories
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Single Item Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Remove from Wishlist
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>"{itemToDelete?.name}"</strong> from your wishlist?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Items Modal */}
      <Dialog open={clearAllModalOpen} onOpenChange={setClearAllModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Clear Entire Wishlist
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to clear your entire wishlist? This will remove all {tableItems.length} items
              and this action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setClearAllModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmClearAll}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Wishlist Skeleton Component (Table Version)
const WishlistSkeleton: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </TableHead>
                <TableHead>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </TableHead>
                <TableHead className="text-center">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                </TableHead>
                <TableHead className="text-center">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                </TableHead>
                <TableHead className="text-center">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                </TableHead>
                <TableHead className="text-center">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                </TableHead>
                <TableHead className="text-right">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="w-16 h-16 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
