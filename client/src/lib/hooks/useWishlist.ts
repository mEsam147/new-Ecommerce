// lib/hooks/useWishlist.ts
'use client';

import { useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import {
  addToGuestWishlist,
  removeFromGuestWishlist,
  clearGuestWishlist,
  clearAllWishlists,
  mergeWishlists,
  syncGuestWishlist,
  fetchWishlist,
  selectWishlistItems,
  selectWishlistTotalItems,
  selectIsInWishlist,
  selectNeedsWishlistMerge,
  selectWishlistLoading,
  selectWishlistSyncing,
  selectMergeStatus,
  selectGuestWishlist,
  selectUserWishlist,
} from '@/lib/features/wishlist/wishlistSlice';
import { useToast } from './useToast';
import { Product } from '@/types';
import { wishlistApi } from '@/lib/services/wishlistApi';
import { useCart } from './useCart';

interface AddToWishlistParams {
  product: Product;
}

export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const { success, error } = useToast();
  const { addToCart } = useCart();

  // Get auth state
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);

  // Selectors
  const items = useAppSelector(selectWishlistItems);
  const guestWishlist = useAppSelector(selectGuestWishlist);
  const userWishlist = useAppSelector(selectUserWishlist);
  const totalItems = useAppSelector(selectWishlistTotalItems);
  const loading = useAppSelector(selectWishlistLoading);
  const syncing = useAppSelector(selectWishlistSyncing);
  const needsWishlistMerge = useAppSelector(selectNeedsWishlistMerge);
  const mergeStatus = useAppSelector(selectMergeStatus);

  // RTK Query mutations
  const [addToWishlistApi] = wishlistApi.useAddToWishlistMutation();
  const [removeFromWishlistApi] = wishlistApi.useRemoveFromWishlistMutation();
  const [clearWishlistApi] = wishlistApi.useClearWishlistMutation();
  const [moveToCartApi] = wishlistApi.useMoveToCartMutation();

  // Add to wishlist
  const addToWishlist = useCallback(async ({
    product
  }: AddToWishlistParams) => {
    try {
      console.log('💝 useWishlist.addToWishlist - Starting, product:', product._id);

      if (isAuthenticated && user) {
        console.log('💝 useWishlist.addToWishlist - User authenticated, using API');
        await addToWishlistApi({ productId: product._id }).unwrap();

        // Refresh the wishlist to get updated data
        await dispatch(fetchWishlist());

        success(`Added ${product.title} to wishlist!`);
        return true;
      } else {
        console.log('💝 useWishlist.addToWishlist - Guest mode, using local storage');
        dispatch(addToGuestWishlist({
          productId: product._id,
          product: {
            _id: product._id,
            title: product.title,
            images: product.images,
            inventory: product.inventory,
            price: product.price,
            comparePrice: product.comparePrice,
            rating: product.rating,
            isActive: product.isActive,
          },
        }));

        success(`Added ${product.title} to wishlist!`);
        return true;
      }
    } catch (err: any) {
      console.error('💝 useWishlist.addToWishlist - Error:', err);
      const errorMessage = err?.data?.message || err?.message || 'Failed to add item to wishlist';

      // Don't show error if item is already in wishlist (it's a user-friendly state)
      if (!errorMessage.includes('already in wishlist')) {
        error(errorMessage);
      }
      return false;
    }
  }, [dispatch, isAuthenticated, user, addToWishlistApi, success, error]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      if (isAuthenticated && user) {
        await removeFromWishlistApi(productId).unwrap();
        await dispatch(fetchWishlist());
      } else {
        dispatch(removeFromGuestWishlist(productId));
      }

      success('Item removed from wishlist');
      return true;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to remove item from wishlist';
      error(errorMessage);
      return false;
    }
  }, [dispatch, isAuthenticated, user, removeFromWishlistApi, success, error]);

  // Clear entire wishlist
  const clearWishlist = useCallback(async () => {
    try {
      if (isAuthenticated && user) {
        await clearWishlistApi().unwrap();
        await dispatch(fetchWishlist());
      } else {
        dispatch(clearGuestWishlist());
      }

      success('Wishlist cleared');
      return true;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to clear wishlist';
      error(errorMessage);
      return false;
    }
  }, [dispatch, isAuthenticated, user, clearWishlistApi, success, error]);

  // Move item to cart
  const moveToCart = useCallback(async (productId: string, size?: string, color?: string, quantity?: number) => {
    try {
      if (isAuthenticated && user) {
        // Use the API to move to cart
        await moveToCartApi({ productId, size, color, quantity }).unwrap();

        // Refresh wishlist to remove the item
        await dispatch(fetchWishlist());

        success('Item moved to cart successfully!');
      } else {
        // For guest users, add to cart and remove from wishlist
        const product = items.find((item: any) =>
          item.productId === productId || item.product?._id === productId
        )?.product;

        if (product) {
          await addToCart({ product, quantity: quantity || 1, size, color });
          await removeFromWishlist(productId);
        }
      }

      return true;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to move item to cart';
      error(errorMessage);
      return false;
    }
  }, [dispatch, isAuthenticated, user, moveToCartApi, addToCart, removeFromWishlist, items, success, error]);

  // Merge guest wishlist with user wishlist
  const handleMergeWishlists = useCallback(async () => {
    try {
      if (!needsWishlistMerge) {
        return { success: true, message: 'No wishlist merge needed' };
      }

      const result = await dispatch(mergeWishlists()).unwrap();
      success('Your wishlist items have been merged successfully!');
      return { success: true, data: result };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to merge wishlists';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [dispatch, needsWishlistMerge, success, error]);

  // Sync guest wishlist
  const syncWishlist = useCallback(async () => {
    try {
      await dispatch(syncGuestWishlist()).unwrap();
      success('Wishlist synced successfully!');
      return true;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to sync wishlist';
      error(errorMessage);
      return false;
    }
  }, [dispatch, success, error]);

  // Refresh wishlist data
  const refreshWishlist = useCallback(async () => {
    if (isAuthenticated) {
      try {
        console.log('💝 Refreshing wishlist...');
        await dispatch(fetchWishlist()).unwrap();
        console.log('💝 Wishlist refresh completed');
      } catch (err) {
        console.error('💝 Failed to refresh wishlist:', err);
      }
    }
  }, [dispatch, isAuthenticated]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId: string) => {
    return (state: any) => selectIsInWishlist(productId)(state);
  }, []);

  // Get item by ID
  const getItemById = useCallback((productId: string) => {
    return items.find((item: any) =>
      item.productId === productId || item.product?._id === productId
    );
  }, [items]);

  // Memoized wishlist state
  const wishlistState = useMemo(() => ({
    items,
    guestWishlist,
    userWishlist,
    totalItems,
    loading,
    syncing,
    needsWishlistMerge,
    mergeStatus,
    isEmpty: items.length === 0
  }), [items, guestWishlist, userWishlist, totalItems, loading, syncing, needsWishlistMerge, mergeStatus]);

  return {
    // State
    ...wishlistState,

    // Actions
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    handleMergeWishlists,
    syncWishlist,
    refreshWishlist,

    // Utilities
    isInWishlist,
    getItemById,
    isAuthenticated,
    hasItems: items.length > 0
  };
};

export type UseWishlistReturn = ReturnType<typeof useWishlist>;
