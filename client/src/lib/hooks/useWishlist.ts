// lib/hooks/useWishlist.ts
'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
  variant?: 'button' | 'icon' | 'card';
}

interface UseWishlistOptions {
  enableAutoRefresh?: boolean;
  showSuccessToasts?: boolean;
  showErrorToasts?: boolean;
}

export const useWishlist = (options: UseWishlistOptions = {}) => {
  const {
    enableAutoRefresh = true,
    showSuccessToasts = true,
    showErrorToasts = true,
  } = options;

  const dispatch = useAppDispatch();
  const { success, error, info, warning } = useToast();
  const { addToCart } = useCart();

  // Get auth state
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);

  // Use refs to prevent unnecessary re-renders
  const recentActionsRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  // Local state for better UX
  const [localLoading, setLocalLoading] = useState<string | null>(null);
  const [actionQueue, setActionQueue] = useState<Array<() => Promise<void>>>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Selectors - memoize these to prevent unnecessary re-renders
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-refresh on auth changes - FIXED: removed refreshWishlist dependency
  useEffect(() => {
    if (enableAutoRefresh && isAuthenticated && isMountedRef.current) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, enableAutoRefresh, dispatch]);

  // Process action queue - FIXED: simplified queue processing
  useEffect(() => {
    if (actionQueue.length > 0 && !isProcessingQueue && isMountedRef.current) {
      setIsProcessingQueue(true);
      const processNext = async () => {
        const nextAction = actionQueue[0];
        try {
          await nextAction();
        } catch (err) {
          console.error('Queue action failed:', err);
        } finally {
          if (isMountedRef.current) {
            setActionQueue(prev => prev.slice(1));
            setIsProcessingQueue(false);
          }
        }
      };
      processNext();
    }
  }, [actionQueue, isProcessingQueue]);

  // Enhanced add to wishlist with optimistic updates - FIXED: removed problematic dependencies
  const addToWishlist = useCallback(async ({
    product,
    variant = 'button'
  }: AddToWishlistParams) => {
    const productId = product._id;
    const actionKey = `add-${productId}`;

    // Prevent duplicate actions
    if (localLoading === productId || recentActionsRef.current.has(actionKey)) {
      if (showSuccessToasts) {
        info('Already in your wishlist!');
      }
      return false;
    }

    setLocalLoading(productId);
    recentActionsRef.current.add(actionKey);

    try {
      // Optimistic update
      const optimisticProduct = {
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
          brand: product.brand,
          slug: product.slug,
          category: product.category,
        },
        addedAt: new Date().toISOString(),
      };

      if (isAuthenticated && user) {
        await addToWishlistApi({ productId }).unwrap();
        await dispatch(fetchWishlist());

        if (showSuccessToasts) {
          success(`❤️ Added ${product.title} to wishlist!`);
        }
      } else {
        dispatch(addToGuestWishlist(optimisticProduct));

        if (showSuccessToasts) {
          success(`❤️ Added ${product.title} to wishlist!`, {
            action: {
              label: 'Sign In to Save',
              onClick: () => window.location.href = '/auth/login'
            }
          });
        }
      }

      return true;
    } catch (err: any) {
      console.error('Add to wishlist error:', err);

      // Revert optimistic update
      if (!isAuthenticated) {
        dispatch(removeFromGuestWishlist(productId));
      }

      const errorMessage = err?.data?.message || err?.message || 'Failed to add item to wishlist';

      if (showErrorToasts) {
        if (errorMessage.includes('already in wishlist')) {
          info('Already in your wishlist!');
        } else {
          error(`Failed to add to wishlist: ${errorMessage}`);
        }
      }
      return false;
    } finally {
      if (isMountedRef.current) {
        setLocalLoading(null);
        // Clear recent action after a delay
        setTimeout(() => {
          recentActionsRef.current.delete(actionKey);
        }, 2000);
      }
    }
  }, [isAuthenticated, user, addToWishlistApi, dispatch, success, error, info, showSuccessToasts, showErrorToasts]);

  // Enhanced remove from wishlist - FIXED: simplified
  const removeFromWishlist = useCallback(async (productId: string, productTitle?: string) => {
    if (localLoading === productId) return false;

    setLocalLoading(productId);

    try {
      if (isAuthenticated && user) {
        await removeFromWishlistApi(productId).unwrap();
        await dispatch(fetchWishlist());
      } else {
        dispatch(removeFromGuestWishlist(productId));
      }

      if (showSuccessToasts) {
        success(productTitle
          ? `Removed ${productTitle} from wishlist`
          : 'Item removed from wishlist'
        );
      }

      return true;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to remove item from wishlist';
      if (showErrorToasts) {
        error(errorMessage);
      }
      return false;
    } finally {
      if (isMountedRef.current) {
        setLocalLoading(null);
      }
    }
  }, [isAuthenticated, user, removeFromWishlistApi, dispatch, success, error, showSuccessToasts, showErrorToasts]);

  // Enhanced clear wishlist - FIXED: simplified
  const clearWishlist = useCallback(async () => {
    if (items.length === 0) {
      if (showSuccessToasts) {
        info('Wishlist is already empty');
      }
      return true;
    }

    // Add confirmation for clearing large wishlists
    if (items.length > 3 && showSuccessToasts) {
      const confirmed = window.confirm(`Are you sure you want to remove all ${items.length} items from your wishlist?`);
      if (!confirmed) return false;
    }

    try {
      if (isAuthenticated && user) {
        await clearWishlistApi().unwrap();
        await dispatch(fetchWishlist());
      } else {
        dispatch(clearGuestWishlist());
      }

      if (showSuccessToasts) {
        success(`Cleared ${items.length} items from wishlist`);
      }

      return true;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to clear wishlist';
      if (showErrorToasts) {
        error(errorMessage);
      }
      return false;
    }
  }, [dispatch, isAuthenticated, user, clearWishlistApi, success, error, info, items.length, showSuccessToasts, showErrorToasts]);

  // Enhanced merge wishlists - FIXED: simplified
  const handleMergeWishlists = useCallback(async () => {
    if (!needsWishlistMerge) {
      if (showSuccessToasts) {
        info('No wishlist items to merge');
      }
      return { success: true, message: 'No wishlist merge needed' };
    }

    try {
      if (showSuccessToasts) {
        info('Merging your wishlist items...');
      }

      const result = await dispatch(mergeWishlists()).unwrap();

      if (showSuccessToasts) {
        success(`✅ ${result.mergedCount} items added to your wishlist!`);
      }

      return {
        success: true,
        data: result,
        message: `Successfully merged ${result.mergedCount} items`
      };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to merge wishlists';
      if (showErrorToasts) {
        error(errorMessage);
      }
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to merge wishlists'
      };
    }
  }, [dispatch, needsWishlistMerge, success, error, info, showSuccessToasts, showErrorToasts]);

  // Enhanced refresh - FIXED: simplified
  const refreshWishlist = useCallback(async (force = false) => {
    if (isAuthenticated && isMountedRef.current) {
      try {
        await dispatch(fetchWishlist()).unwrap();
        return true;
      } catch (err) {
        console.error('Failed to refresh wishlist:', err);
        if (showErrorToasts) {
          error('Failed to refresh wishlist');
        }
        return false;
      }
    }
    return true;
  }, [dispatch, isAuthenticated, error, showErrorToasts]);

  // Check if product is in wishlist - FIXED: use selector directly
  const isInWishlist = useCallback((productId: string) => {
    return (state: any) => selectIsInWishlist(productId)(state);
  }, []);

  // Get item by ID
  const getItemById = useCallback((productId: string) => {
    return items.find((item: any) =>
      item.productId === productId || item.product?._id === productId
    );
  }, [items]);

  // Check if specific product is being processed
  const isProductLoading = useCallback((productId: string) =>
    localLoading === productId,
    [localLoading]
  );

  // Memoized wishlist state with enhanced properties - FIXED: simplified
  const wishlistState = useMemo(() => ({
    // State
    items,
    guestWishlist,
    userWishlist,
    totalItems,
    loading: loading || syncing || localLoading !== null,
    syncing,
    needsWishlistMerge,
    mergeStatus,
    isEmpty: items.length === 0,

    // Enhanced properties
    hasItems: items.length > 0,
    itemCount: items.length,
  }), [
    items, guestWishlist, userWishlist, totalItems, loading, syncing,
    needsWishlistMerge, mergeStatus, localLoading
  ]);

  return {
    // State
    ...wishlistState,

    // Actions
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    handleMergeWishlists,
    refreshWishlist,

    // Utilities
    isInWishlist,
    getItemById,
    isProductLoading,
    isAuthenticated,
  };
};

export type UseWishlistReturn = ReturnType<typeof useWishlist>;
