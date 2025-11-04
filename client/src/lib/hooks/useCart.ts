
// // // 'use client';

// // // import { useCallback, useMemo, useEffect } from 'react';
// // // import { useAppSelector, useAppDispatch } from './redux';
// // // import {
// // //   addToGuestCart,
// // //   updateGuestCartItem,
// // //   removeFromGuestCart,
// // //   clearGuestCart,
// // //   moveFromWishlistToCart,
// // //   mergeCarts,
// // //   syncGuestCart,
// // //   fetchCart,
// // //   selectCartItems,
// // //   selectCartTotalItems,
// // //   selectCartSubtotal as selectCartSubtotalRaw,
// // //   selectCartLoading,
// // //   selectCartSyncing
// // //   selectIsInCart,
// // //   selectCartItemCount,
// // //   selectNeedsCartMerge,
// // //   selectGuestCart,
// // //   selectUserCart,
// // //   selectMergeStatus
// // // } from '@/lib/features/carts/cartsSlice';
// // // // Import coupon actions and selectors
// // // import {
// // //   validateCoupon,
// // //   removeCoupon,
// // //   selectAppliedCoupon,
// // //   selectCouponValidationLoading,
// // //   selectCouponValidationError,
// // //   selectCouponDiscount,
// // //   selectCartSubtotal
// // // } from '@/lib/features/coupon/couponSlice';
// // // import { useToast } from './useToast';
// // // import { Product } from '@/types';
// // // import { cartApi } from '@/lib/services/cartApi';
// // // import { RootState, store } from '../store';

// // // interface AddToCartParams {
// // //   product: Product;
// // //   quantity?: number;
// // //   size?: string;
// // //   color?: string;
// // // }

// // // interface UpdateCartItemParams {
// // //   itemId: string;
// // //   quantity: number;
// // // }

// // // export const useCart = () => {
// // //   const dispatch = useAppDispatch();
// // //   const { success, error } = useToast();

// // //   // Get auth state directly from Redux to avoid circular dependency
// // //   const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);

// // //   // Cart Selectors
// // //   const items = useAppSelector(selectCartItems);
// // //   const guestCart = useAppSelector(selectGuestCart);
// // //   const userCart = useAppSelector(selectUserCart);
// // //   const totalItems = useAppSelector(selectCartTotalItems);
// // //   const cartSubtotal = useAppSelector(selectCartSubtotalRaw);
// // //   const cartLoading = useAppSelector(selectCartLoading);
// // //   const cartSyncing = useAppSelector(selectCartSyncing);
// // //   const needsCartMerge = useAppSelector(selectNeedsCartMerge);
// // //   const mergeStatus = useAppSelector(selectMergeStatus);

// // //   // Coupon Selectors
// // //   const appliedCoupon = useAppSelector(selectAppliedCoupon);
// // //   const couponValidationLoading = useAppSelector(selectCouponValidationLoading);
// // //   const couponValidationError = useAppSelector(selectCouponValidationError);
// // //   const couponDiscount = useAppSelector(selectCouponDiscount);

// // //   // RTK Query mutations
// // //   const [addToCartApi, { isLoading: isAddingToCart }] = cartApi.useAddToCartMutation();
// // //   const [updateCartItemApi] = cartApi.useUpdateCartItemMutation();
// // //   const [removeCartItemApi] = cartApi.useRemoveCartItemMutation();
// // //   const [clearCartApi] = cartApi.useClearCartMutation();

// // //   // Auto-refresh cart when authentication state changes
// // //   useEffect(() => {
// // //     if (isAuthenticated) {
// // //       refreshCart();
// // //     }
// // //   }, [isAuthenticated]);

// // //   // Enhanced item normalization
// // //   const normalizeCartItem = useCallback((item: any) => {
// // //     if (item.productId) {
// // //       // Guest cart item
// // //       return {
// // //         id: item.id,
// // //         productId: item.productId,
// // //         product: item.product,
// // //         quantity: item.quantity,
// // //         price: item.price,
// // //         size: item.size,
// // //         color: item.color,
// // //       };
// // //     } else {
// // //       // User cart item from API
// // //       return {
// // //         id: item._id,
// // //         productId: item.product?._id,
// // //         product: item.product,
// // //         quantity: item.quantity,
// // //         price: item.price,
// // //         size: item.variant?.size,
// // //         color: item.variant?.color,
// // //       };
// // //     }
// // //   }, []);

// // //   // Enhanced cart items with normalization
// // //   const normalizedItems = useMemo(() => {
// // //     return items.map(normalizeCartItem);
// // //   }, [items, normalizeCartItem]);

// // //   // Calculate total with coupon discount
// // //   const total = useMemo(() => {
// // //     const shipping = 0;
// // //     const tax = cartSubtotal * 0.1;
// // //     return Math.max(0, cartSubtotal - couponDiscount + shipping + tax);
// // //   }, [cartSubtotal, couponDiscount]);

// // //   // Memoized cart state
// // //   const cartState = useMemo(() => ({
// // //     items: normalizedItems,
// // //     guestCart,
// // //     userCart,
// // //     totalItems,
// // //     subtotal: cartSubtotal,
// // //     total,
// // //     discount: couponDiscount,
// // //     appliedCoupon,
// // //     loading: cartLoading || isAddingToCart,
// // //     syncing: cartSyncing,
// // //     needsCartMerge,
// // //     mergeStatus,
// // //     isEmpty: normalizedItems.length === 0,
// // //     // Coupon specific states
// // //     couponValidationLoading,
// // //     couponValidationError
// // //   }), [
// // //     normalizedItems, guestCart, userCart, totalItems, cartSubtotal, total,
// // //     couponDiscount, appliedCoupon, cartLoading, isAddingToCart, cartSyncing,
// // //     needsCartMerge, mergeStatus, couponValidationLoading, couponValidationError
// // //   ]);

// // //   // // Add to cart function
// // //   // const addToCart = useCallback(async ({
// // //   //   product,
// // //   //   quantity = 1,
// // //   //   size,
// // //   //   color
// // //   // }: AddToCartParams) => {
// // //   //   try {
// // //   //     console.log('🛒 useCart.addToCart - Starting, product:', product._id, 'quantity:', quantity);

// // //   //     if (isAuthenticated && user) {
// // //   //       console.log('🛒 useCart.addToCart - User authenticated, using API');
// // //   //       const requestData: any = {
// // //   //         productId: product._id,
// // //   //         quantity,
// // //   //       };

// // //   //       if (size) requestData.size = size;
// // //   //       if (color) requestData.color = color;

// // //   //       await addToCartApi(requestData).unwrap();
// // //   //       await dispatch(fetchCart());

// // //   //       success(`Added ${product.title} to cart!`);
// // //   //       return true;
// // //   //     } else {
// // //   //       console.log('🛒 useCart.addToCart - Guest mode, using local storage');
// // //   //       dispatch(addToGuestCart({
// // //   //         productId: product._id,
// // //   //         quantity,
// // //   //         size,
// // //   //         color,
// // //   //         price: product.price,
// // //   //         product: {
// // //   //           _id: product._id,
// // //   //           title: product.title,
// // //   //           images: product.images,
// // //   //           inventory: product.inventory,
// // //   //           slug: product.slug,
// // //   //           price: product.price,
// // //   //         },
// // //   //       }));

// // //   //       success(`Added ${product.title} to cart!`);
// // //   //       return true;
// // //   //     }
// // //   //   } catch (err: any) {
// // //   //     console.error('🛒 useCart.addToCart - Error:', err);
// // //   //     const errorMessage = err?.data?.message || err?.message || 'Failed to add item to cart';
// // //   //     error(errorMessage);
// // //   //     return false;
// // //   //   }
// // //   // }, [dispatch, isAuthenticated, user, addToCartApi, success, error]);


// // //   const addToCart = useCallback(async ({
// // //   product,
// // //   quantity = 1,
// // //   size,
// // //   color
// // // }: AddToCartParams) => {
// // //   try {
// // //     console.log('🛒 useCart.addToCart - Starting, product:', product._id, 'quantity:', quantity);

// // //     // Check inventory
// // //     if (product.inventory?.trackQuantity && product.inventory.quantity < quantity) {
// // //       error(`Only ${product.inventory.quantity} items available in stock`);
// // //       return false;
// // //     }

// // //     if (isAuthenticated && user) {
// // //       console.log('🛒 useCart.addToCart - User authenticated, using API');

// // //       // Check if item already exists in cart to avoid duplicates
// // //       const currentState = store.getState() as RootState;
// // //       const existingCartItems = selectCartItems(currentState);

// // //       const existingItem = existingCartItems.find((item: any) => {
// // //         const itemProductId = item.productId || item.product?._id;
// // //         const itemSize = item.size || item.variant?.size;
// // //         const itemColor = item.color || item.variant?.color;

// // //         return itemProductId === product._id &&
// // //                itemSize === size &&
// // //                itemColor === color;
// // //       });

// // //       if (existingItem) {
// // //         // Item exists, update quantity instead of adding new one
// // //         console.log('🛒 useCart.addToCart - Item exists, updating quantity');
// // //         const newQuantity = (existingItem.quantity || 0) + quantity;

// // //         await updateCartItemApi({
// // //           itemId: existingItem._id || existingItem.id,
// // //           quantity: newQuantity
// // //         }).unwrap();

// // //         await dispatch(fetchCart());
// // //         success(`Updated quantity of ${product.title} in cart!`);
// // //         return true;
// // //       } else {
// // //         // Add new item
// // //         const requestData: any = {
// // //           productId: product._id,
// // //           quantity,
// // //         };

// // //         if (size) requestData.size = size;
// // //         if (color) requestData.color = color;

// // //         await addToCartApi(requestData).unwrap();
// // //         await dispatch(fetchCart());

// // //         success(`Added ${product.title} to cart!`);
// // //         return true;
// // //       }
// // //     } else {
// // //       console.log('🛒 useCart.addToCart - Guest mode, using local storage');

// // //       // Check if item already exists in guest cart
// // //       const currentState = store.getState() as RootState;
// // //       const existingGuestItems = currentState.cart.guestCart;

// // //       const existingItem = existingGuestItems.find(item =>
// // //         item.productId === product._id &&
// // //         item.size === size &&
// // //         item.color === color
// // //       );

// // //       if (existingItem) {
// // //         // Update quantity for existing item
// // //         dispatch(updateGuestCartItem({
// // //           id: existingItem.id,
// // //           quantity: existingItem.quantity + quantity
// // //         }));
// // //         success(`Updated quantity of ${product.title} in cart!`);
// // //       } else {
// // //         // Add new item
// // //         dispatch(addToGuestCart({
// // //           productId: product._id,
// // //           quantity,
// // //           size,
// // //           color,
// // //           price: product.price,
// // //           product: {
// // //             _id: product._id,
// // //             title: product.title,
// // //             images: product.images,
// // //             inventory: product.inventory,
// // //             slug: product.slug,
// // //             price: product.price,
// // //           },
// // //         }));
// // //         success(`Added ${product.title} to cart!`);
// // //       }
// // //       return true;
// // //     }
// // //   } catch (err: any) {
// // //     console.error('🛒 useCart.addToCart - Error:', err);

// // //     // Handle specific error cases
// // //     let errorMessage = 'Failed to add item to cart';
// // //     if (err?.status === 400) {
// // //       errorMessage = err?.data?.message || 'Invalid product or quantity';
// // //     } else if (err?.status === 404) {
// // //       errorMessage = 'Product not found';
// // //     } else if (err?.status === 409) {
// // //       errorMessage = 'Product is out of stock';
// // //     } else {
// // //       errorMessage = err?.data?.message || err?.message || errorMessage;
// // //     }

// // //     error(errorMessage);
// // //     return false;
// // //   }
// // // }, [dispatch, isAuthenticated, user, addToCartApi, updateCartItemApi, success, error]);

// // //   const updateQuantity = useCallback(async ({
// // //     itemId,
// // //     quantity
// // //   }: UpdateCartItemParams) => {
// // //     try {
// // //       if (isAuthenticated && user) {
// // //         await updateCartItemApi({
// // //           itemId,
// // //           quantity
// // //         }).unwrap();
// // //         await dispatch(fetchCart());
// // //       } else {
// // //         dispatch(updateGuestCartItem({ id: itemId, quantity }));
// // //       }
// // //       return true;
// // //     } catch (err: any) {
// // //       const errorMessage = err?.data?.message || 'Failed to update item quantity';
// // //       error(errorMessage);
// // //       return false;
// // //     }
// // //   }, [dispatch, isAuthenticated, user, updateCartItemApi, error]);

// // //   // Enhanced remove from cart
// // //   const removeFromCart = useCallback(async (itemId: string) => {
// // //     try {
// // //       if (isAuthenticated && user) {
// // //         await removeCartItemApi(itemId).unwrap();
// // //         await dispatch(fetchCart());
// // //       } else {
// // //         dispatch(removeFromGuestCart(itemId));
// // //       }
// // //       success('Item removed from cart');
// // //       return true;
// // //     } catch (err: any) {
// // //       const errorMessage = err?.data?.message || 'Failed to remove item from cart';
// // //       error(errorMessage);
// // //       return false;
// // //     }
// // //   }, [dispatch, isAuthenticated, user, removeCartItemApi, success, error]);

// // //   // Clear entire cart
// // //   const clearCart = useCallback(async () => {
// // //     try {
// // //       if (isAuthenticated && user) {
// // //         await clearCartApi().unwrap();
// // //         await dispatch(fetchCart());
// // //       } else {
// // //         dispatch(clearGuestCart());
// // //       }
// // //       dispatch(removeCoupon());
// // //       success('Cart cleared');
// // //       return true;
// // //     } catch (err: any) {
// // //       const errorMessage = err?.data?.message || 'Failed to clear cart';
// // //       error(errorMessage);
// // //       return false;
// // //     }
// // //   }, [dispatch, isAuthenticated, user, clearCartApi, success, error]);

// // //   // Apply coupon code (FIXED)
// // //   const applyCouponCode = useCallback(async (code: string) => {
// // //     try {
// // //       console.log('🎫 useCart.applyCouponCode - Applying coupon:', code);

// // //       // Prepare products data for validation
// // //       const products = normalizedItems.map(item => ({
// // //         product: item.productId,
// // //         price: item.price,
// // //         quantity: item.quantity
// // //       }));

// // //       const result = await dispatch(validateCoupon({
// // //         code: code.toUpperCase().trim(),
// // //         cartAmount: cartSubtotal,
// // //         products
// // //       })).unwrap();

// // //       console.log('🎫 useCart.applyCouponCode - Coupon applied successfully:', result);
// // //       success(`Coupon ${code} applied successfully!`);
// // //       return true;
// // //     } catch (err: any) {
// // //       console.error('🎫 useCart.applyCouponCode - Error:', err);
// // //       const errorMessage = err.payload || 'Failed to apply coupon';
// // //       error(errorMessage);
// // //       return false;
// // //     }
// // //   }, [dispatch, cartSubtotal, normalizedItems, success, error]);

// // //   // Remove applied coupon
// // //   const removeCouponCode = useCallback(() => {
// // //     dispatch(removeCoupon());
// // //     success('Coupon removed');
// // //   }, [dispatch, success]);

// // //   // Merge guest cart with user cart
// // //   const handleMergeCarts = useCallback(async () => {
// // //     try {
// // //       if (!needsCartMerge) {
// // //         return { success: true, message: 'No cart merge needed' };
// // //       }
// // //       const result = await dispatch(mergeCarts()).unwrap();
// // //       success('Your cart items have been merged successfully!');
// // //       return { success: true, data: result };
// // //     } catch (err: any) {
// // //       const errorMessage = err?.data?.message || 'Failed to merge carts';
// // //       error(errorMessage);
// // //       return { success: false, error: errorMessage };
// // //     }
// // //   }, [dispatch, needsCartMerge, success, error]);

// // //   // Sync guest cart
// // //   const syncCart = useCallback(async () => {
// // //     try {
// // //       await dispatch(syncGuestCart()).unwrap();
// // //       success('Cart synced successfully!');
// // //       return true;
// // //     } catch (err: any) {
// // //       const errorMessage = err?.data?.message || 'Failed to sync cart';
// // //       error(errorMessage);
// // //       return false;
// // //     }
// // //   }, [dispatch, success, error]);

// // //   // Refresh cart data
// // //   const refreshCart = useCallback(async () => {
// // //     if (isAuthenticated) {
// // //       try {
// // //         console.log('🛒 Refreshing cart...');
// // //         await dispatch(fetchCart()).unwrap();
// // //       } catch (err) {
// // //         console.error('🛒 Failed to refresh cart:', err);
// // //       }
// // //     }
// // //   }, [dispatch, isAuthenticated]);

// // //   // Move item from wishlist to cart
// // //   const moveToCartFromWishlist = useCallback(async (product: Product, quantity?: number) => {
// // //     try {
// // //       if (isAuthenticated && user) {
// // //         await addToCartApi({
// // //           productId: product._id,
// // //           quantity: quantity || 1,
// // //         }).unwrap();
// // //         await dispatch(fetchCart());
// // //       } else {
// // //         dispatch(moveFromWishlistToCart({
// // //           productId: product._id,
// // //           product,
// // //           quantity
// // //         }));
// // //       }
// // //       success(`Moved ${product.title} to cart!`);
// // //       return true;
// // //     } catch (err) {
// // //       error('Failed to move item to cart');
// // //       return false;
// // //     }
// // //   }, [dispatch, isAuthenticated, user, addToCartApi, success, error]);

// // //   // Check if product is in cart
// // //   const isInCart = useCallback((productId: string) => {
// // //     return (state: any) => selectIsInCart(productId)(state);
// // //   }, []);

// // //   // Get item count for specific product
// // //   const getItemCount = useCallback((productId: string) => {
// // //     return (state: any) => selectCartItemCount(productId)(state);
// // //   }, []);

// // //   // Get item by ID
// // //   const getItemById = useCallback((itemId: string) => {
// // //     return normalizedItems.find(item => item.id === itemId);
// // //   }, [normalizedItems]);

// // //   // Get item display info for UI components
// // //   const getItemDisplayInfo = useCallback((item: any) => {
// // //     const normalizedItem = normalizeCartItem(item);
// // //     return {
// // //       id: normalizedItem.id,
// // //       productId: normalizedItem.productId,
// // //       title: normalizedItem.product?.title || normalizedItem.product?.name,
// // //       image: normalizedItem.product?.images?.[0]?.url || normalizedItem.product?.image || '/images/placeholder-product.jpg',
// // //       price: normalizedItem.price,
// // //       quantity: normalizedItem.quantity,
// // //       size: normalizedItem.size,
// // //       color: normalizedItem.color,
// // //       totalPrice: (normalizedItem.price || 0) * (normalizedItem.quantity || 1)
// // //     };
// // //   }, [normalizeCartItem]);

// // //   return {
// // //     // State
// // //     ...cartState,

// // //     // Actions
// // //     addToCart,
// // //     updateQuantity,
// // //     removeFromCart,
// // //     clearCart,
// // //     handleMergeCarts,
// // //     syncCart,
// // //     refreshCart,
// // //     applyCouponCode,
// // //     removeCouponCode,
// // //     moveToCartFromWishlist,

// // //     // Utilities
// // //     isInCart,
// // //     getItemCount,
// // //     getItemById,
// // //     getItemDisplayInfo,
// // //     isAuthenticated,
// // //     hasItems: normalizedItems.length > 0
// // //   };
// // // };

// // // export type UseCartReturn = ReturnType<typeof useCart>;

// // // lib/hooks/useCart.ts
// // 'use client';

// // import { useCallback, useMemo, useEffect } from 'react';
// // import { useAppSelector, useAppDispatch } from './redux';
// // import {
// //   addToGuestCart,
// //   updateGuestCartItem,
// //   removeFromGuestCart,
// //   clearGuestCart,
// //   moveFromWishlistToCart,
// //   mergeCarts,
// //   syncGuestCart,
// //   fetchCart,
// //   selectCartItems,
// //   selectCartTotalItems,
// //   selectCartSubtotal as selectCartSubtotalRaw,
// //   selectCartLoading,
// //   selectCartSyncing,
// //   selectIsInCart,
// //   selectCartItemCount,
// //   selectNeedsCartMerge,
// //   selectGuestCart,
// //   selectUserCart,
// //   selectMergeStatus
// // } from '@/lib/features/carts/cartsSlice';
// // import {
// //   validateCoupon,
// //   removeCoupon,
// //   selectAppliedCoupon,
// //   selectCouponValidationLoading,
// //   selectCouponValidationError,
// //   selectCouponDiscount,
// //   selectCartSubtotal
// // } from '@/lib/features/coupon/couponSlice';
// // import { useToast } from './useToast';
// // import { Product } from '@/types';
// // import { cartApi } from '@/lib/services/cartApi';
// // import { RootState, store } from '../store';

// // interface AddToCartParams {
// //   product: Product;
// //   quantity?: number;
// //   size?: string;
// //   color?: string;
// // }

// // interface UpdateCartItemParams {
// //   itemId: string;
// //   quantity: number;
// // }

// // export const useCart = () => {
// //   const dispatch = useAppDispatch();
// //   const { success, error } = useToast();

// //   // Get auth state directly from Redux to avoid circular dependency
// //   const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);

// //   // Cart Selectors
// //   const items = useAppSelector(selectCartItems);
// //   const guestCart = useAppSelector(selectGuestCart);
// //   const userCart = useAppSelector(selectUserCart);
// //   const totalItems = useAppSelector(selectCartTotalItems);
// //   const cartSubtotal = useAppSelector(selectCartSubtotalRaw);
// //   const cartLoading = useAppSelector(selectCartLoading);
// //   const cartSyncing = useAppSelector(selectCartSyncing);
// //   const needsCartMerge = useAppSelector(selectNeedsCartMerge);
// //   const mergeStatus = useAppSelector(selectMergeStatus);

// //   // Coupon Selectors
// //   const appliedCoupon = useAppSelector(selectAppliedCoupon);
// //   const couponValidationLoading = useAppSelector(selectCouponValidationLoading);
// //   const couponValidationError = useAppSelector(selectCouponValidationError);
// //   const couponDiscount = useAppSelector(selectCouponDiscount);

// //   // RTK Query mutations
// //   const [addToCartApi, { isLoading: isAddingToCart }] = cartApi.useAddToCartMutation();
// //   const [updateCartItemApi] = cartApi.useUpdateCartItemMutation();
// //   const [removeCartItemApi] = cartApi.useRemoveCartItemMutation();
// //   const [clearCartApi] = cartApi.useClearCartMutation();

// //   // Auto-refresh cart when authentication state changes
// //   useEffect(() => {
// //     if (isAuthenticated) {
// //       refreshCart();
// //     }
// //   }, [isAuthenticated]);

// //   // Enhanced item normalization
// //   const normalizeCartItem = useCallback((item: any) => {
// //     if (item.productId) {
// //       // Guest cart item
// //       return {
// //         id: item.id,
// //         productId: item.productId,
// //         product: item.product,
// //         quantity: item.quantity,
// //         price: item.price,
// //         size: item.size,
// //         color: item.color,
// //       };
// //     } else {
// //       // User cart item from API
// //       return {
// //         id: item._id,
// //         productId: item.product?._id,
// //         product: item.product,
// //         quantity: item.quantity,
// //         price: item.price,
// //         size: item.variant?.size,
// //         color: item.variant?.color,
// //       };
// //     }
// //   }, []);

// //   // Enhanced cart items with normalization
// //   const normalizedItems = useMemo(() => {
// //     return items.map(normalizeCartItem);
// //   }, [items, normalizeCartItem]);

// //   // Calculate total with coupon discount
// //   const total = useMemo(() => {
// //     const shipping = 0;
// //     const tax = cartSubtotal * 0.1;
// //     return Math.max(0, cartSubtotal - couponDiscount + shipping + tax);
// //   }, [cartSubtotal, couponDiscount]);

// //   // Memoized cart state
// //   const cartState = useMemo(() => ({
// //     items: normalizedItems,
// //     guestCart,
// //     userCart,
// //     totalItems,
// //     subtotal: cartSubtotal,
// //     total,
// //     discount: couponDiscount,
// //     appliedCoupon,
// //     loading: cartLoading || isAddingToCart,
// //     syncing: cartSyncing,
// //     needsCartMerge,
// //     mergeStatus,
// //     isEmpty: normalizedItems.length === 0,
// //     // Coupon specific states
// //     couponValidationLoading,
// //     couponValidationError
// //   }), [
// //     normalizedItems, guestCart, userCart, totalItems, cartSubtotal, total,
// //     couponDiscount, appliedCoupon, cartLoading, isAddingToCart, cartSyncing,
// //     needsCartMerge, mergeStatus, couponValidationLoading, couponValidationError
// //   ]);

// //   // Helper function to find existing cart item
// //   const findExistingCartItem = useCallback((product: Product, size?: string, color?: string) => {
// //     const currentState = store.getState() as RootState;
// //     const existingCartItems = selectCartItems(currentState);

// //     return existingCartItems.find((item: any) => {
// //       const itemProductId = item.productId || item.product?._id;
// //       const itemSize = item.size || item.variant?.size;
// //       const itemColor = item.color || item.variant?.color;

// //       // Match by product ID, size, and color
// //       return itemProductId === product._id &&
// //              itemSize === size &&
// //              itemColor === color;
// //     });
// //   }, []);


// //   const addToCart = useCallback(async ({
// //     product,
// //     quantity = 1,
// //     size,
// //     color
// //   }: AddToCartParams) => {
// //     try {
// //       console.log('🛒 useCart.addToCart - Starting, product:', product._id, 'quantity:', quantity);

// //       // Check inventory
// //       if (product.inventory?.trackQuantity && product.inventory.quantity < quantity) {
// //         error(`Only ${product.inventory.quantity} items available in stock`);
// //         return false;
// //       }

// //       // Find existing item in cart
// //       const existingItem = findExistingCartItem(product, size, color);

// //       if (isAuthenticated && user) {
// //         console.log('🛒 useCart.addToCart - User authenticated, using API');

// //         if (existingItem) {
// //           // Item exists, update quantity instead of adding new one
// //           console.log('🛒 useCart.addToCart - Item exists, updating quantity');
// //           const newQuantity = (existingItem.quantity || 0) + quantity;

// //           await updateCartItemApi({
// //             itemId: existingItem._id || existingItem.id,
// //             quantity: newQuantity
// //           }).unwrap();

// //           await dispatch(fetchCart());
// //           success(`Updated quantity of ${product.title} in cart! (${newQuantity} total)`);
// //           return true;
// //         } else {
// //           // Add new item
// //           console.log('🛒 useCart.addToCart - Adding new item to cart');
// //           const requestData: any = {
// //             productId: product._id,
// //             quantity,
// //           };

// //           if (size) requestData.size = size;
// //           if (color) requestData.color = color;

// //           await addToCartApi(requestData).unwrap();
// //           await dispatch(fetchCart());

// //           success(`Added ${product.title} to cart!`);
// //           return true;
// //         }
// //       } else {
// //         console.log('🛒 useCart.addToCart - Guest mode, using local storage');

// //         if (existingItem) {
// //           // Update quantity for existing item
// //           console.log('🛒 useCart.addToCart - Updating existing guest cart item');
// //           dispatch(updateGuestCartItem({
// //             id: existingItem.id,
// //             quantity: existingItem.quantity + quantity
// //           }));
// //           success(`Updated quantity of ${product.title} in cart! (${existingItem.quantity + quantity} total)`);
// //         } else {
// //           // Add new item
// //           console.log('🛒 useCart.addToCart - Adding new item to guest cart');
// //           dispatch(addToGuestCart({
// //             productId: product._id,
// //             quantity,
// //             size,
// //             color,
// //             price: product.price,
// //             product: {
// //               _id: product._id,
// //               title: product.title,
// //               images: product.images,
// //               inventory: product.inventory,
// //               slug: product.slug,
// //               price: product.price,
// //             },
// //           }));
// //           success(`Added ${product.title} to cart!`);
// //         }
// //         return true;
// //       }
// //     } catch (err: any) {
// //       console.error('🛒 useCart.addToCart - Error:', err);

// //       // Handle specific error cases
// //       let errorMessage = 'Failed to add item to cart';
// //       if (err?.status === 400) {
// //         errorMessage = err?.data?.message || 'Invalid product or quantity';
// //       } else if (err?.status === 404) {
// //         errorMessage = 'Product not found';
// //       } else if (err?.status === 409) {
// //         errorMessage = 'Product is out of stock';
// //       } else {
// //         errorMessage = err?.data?.message || err?.message || errorMessage;
// //       }

// //       error(errorMessage);
// //       return false;
// //     }
// //   }, [dispatch, isAuthenticated, user, addToCartApi, updateCartItemApi, success, error, findExistingCartItem]);


// //   const updateQuantity = useCallback(async ({
// //     itemId,
// //     quantity
// //   }: UpdateCartItemParams) => {
// //     try {
// //       if (isAuthenticated && user) {
// //         await updateCartItemApi({
// //           itemId,
// //           quantity
// //         }).unwrap();
// //         await dispatch(fetchCart());
// //       } else {
// //         dispatch(updateGuestCartItem({ id: itemId, quantity }));
// //       }
// //       return true;
// //     } catch (err: any) {
// //       const errorMessage = err?.data?.message || 'Failed to update item quantity';
// //       error(errorMessage);
// //       return false;
// //     }
// //   }, [dispatch, isAuthenticated, user, updateCartItemApi, error]);

// //   // Enhanced remove from cart
// //   const removeFromCart = useCallback(async (itemId: string) => {
// //     try {
// //       if (isAuthenticated && user) {
// //         await removeCartItemApi(itemId).unwrap();
// //         await dispatch(fetchCart());
// //       } else {
// //         dispatch(removeFromGuestCart(itemId));
// //       }
// //       success('Item removed from cart');
// //       return true;
// //     } catch (err: any) {
// //       const errorMessage = err?.data?.message || 'Failed to remove item from cart';
// //       error(errorMessage);
// //       return false;
// //     }
// //   }, [dispatch, isAuthenticated, user, removeCartItemApi, success, error]);

// //   // Clear entire cart
// //   const clearCart = useCallback(async () => {
// //     try {
// //       if (isAuthenticated && user) {
// //         await clearCartApi().unwrap();
// //         await dispatch(fetchCart());
// //       } else {
// //         dispatch(clearGuestCart());
// //       }
// //       dispatch(removeCoupon());
// //       success('Cart cleared');
// //       return true;
// //     } catch (err: any) {
// //       const errorMessage = err?.data?.message || 'Failed to clear cart';
// //       error(errorMessage);
// //       return false;
// //     }
// //   }, [dispatch, isAuthenticated, user, clearCartApi, success, error]);

// //   // Apply coupon code
// //   const applyCouponCode = useCallback(async (code: string) => {
// //     try {
// //       console.log('🎫 useCart.applyCouponCode - Applying coupon:', code);

// //       // Prepare products data for validation
// //       const products = normalizedItems.map(item => ({
// //         product: item.productId,
// //         price: item.price,
// //         quantity: item.quantity
// //       }));

// //       const result = await dispatch(validateCoupon({
// //         code: code.toUpperCase().trim(),
// //         cartAmount: cartSubtotal,
// //         products
// //       })).unwrap();

// //       console.log('🎫 useCart.applyCouponCode - Coupon applied successfully:', result);
// //       success(`Coupon ${code} applied successfully!`);
// //       return true;
// //     } catch (err: any) {
// //       console.error('🎫 useCart.applyCouponCode - Error:', err);
// //       const errorMessage = err.payload || 'Failed to apply coupon';
// //       error(errorMessage);
// //       return false;
// //     }
// //   }, [dispatch, cartSubtotal, normalizedItems, success, error]);

// //   // Remove applied coupon
// //   const removeCouponCode = useCallback(() => {
// //     dispatch(removeCoupon());
// //     success('Coupon removed');
// //   }, [dispatch, success]);

// //   // Merge guest cart with user cart
// //   const handleMergeCarts = useCallback(async () => {
// //     try {
// //       if (!needsCartMerge) {
// //         return { success: true, message: 'No cart merge needed' };
// //       }
// //       const result = await dispatch(mergeCarts()).unwrap();
// //       success('Your cart items have been merged successfully!');
// //       return { success: true, data: result };
// //     } catch (err: any) {
// //       const errorMessage = err?.data?.message || 'Failed to merge carts';
// //       error(errorMessage);
// //       return { success: false, error: errorMessage };
// //     }
// //   }, [dispatch, needsCartMerge, success, error]);

// //   // Sync guest cart
// //   const syncCart = useCallback(async () => {
// //     try {
// //       await dispatch(syncGuestCart()).unwrap();
// //       success('Cart synced successfully!');
// //       return true;
// //     } catch (err: any) {
// //       const errorMessage = err?.data?.message || 'Failed to sync cart';
// //       error(errorMessage);
// //       return false;
// //     }
// //   }, [dispatch, success, error]);

// //   // Refresh cart data
// //   const refreshCart = useCallback(async () => {
// //     if (isAuthenticated) {
// //       try {
// //         console.log('🛒 Refreshing cart...');
// //         await dispatch(fetchCart()).unwrap();
// //       } catch (err) {
// //         console.error('🛒 Failed to refresh cart:', err);
// //       }
// //     }
// //   }, [dispatch, isAuthenticated]);

// //   // Move item from wishlist to cart
// //   const moveToCartFromWishlist = useCallback(async (product: Product, quantity?: number) => {
// //     try {
// //       if (isAuthenticated && user) {
// //         await addToCartApi({
// //           productId: product._id,
// //           quantity: quantity || 1,
// //         }).unwrap();
// //         await dispatch(fetchCart());
// //       } else {
// //         dispatch(moveFromWishlistToCart({
// //           productId: product._id,
// //           product,
// //           quantity
// //         }));
// //       }
// //       success(`Moved ${product.title} to cart!`);
// //       return true;
// //     } catch (err) {
// //       error('Failed to move item to cart');
// //       return false;
// //     }
// //   }, [dispatch, isAuthenticated, user, addToCartApi, success, error]);

// //   // Check if product is in cart
// //   const isInCart = useCallback((productId: string) => {
// //     return (state: any) => selectIsInCart(productId)(state);
// //   }, []);

// //   // Get item count for specific product
// //   const getItemCount = useCallback((productId: string) => {
// //     return (state: any) => selectCartItemCount(productId)(state);
// //   }, []);

// //   // Get item by ID
// //   const getItemById = useCallback((itemId: string) => {
// //     return normalizedItems.find(item => item.id === itemId);
// //   }, [normalizedItems]);

// //   // Get item display info for UI components
// //   const getItemDisplayInfo = useCallback((item: any) => {
// //     const normalizedItem = normalizeCartItem(item);
// //     return {
// //       id: normalizedItem.id,
// //       productId: normalizedItem.productId,
// //       title: normalizedItem.product?.title || normalizedItem.product?.name,
// //       image: normalizedItem.product?.images?.[0]?.url || normalizedItem.product?.image || '/images/placeholder-product.jpg',
// //       price: normalizedItem.price,
// //       quantity: normalizedItem.quantity,
// //       size: normalizedItem.size,
// //       color: normalizedItem.color,
// //       totalPrice: (normalizedItem.price || 0) * (normalizedItem.quantity || 1)
// //     };
// //   }, [normalizeCartItem]);

// //   return {
// //     // State
// //     ...cartState,

// //     // Actions
// //     addToCart,
// //     updateQuantity,
// //     removeFromCart,
// //     clearCart,
// //     handleMergeCarts,
// //     syncCart,
// //     refreshCart,
// //     applyCouponCode,
// //     removeCouponCode,
// //     moveToCartFromWishlist,

// //     // Utilities
// //     isInCart,
// //     getItemCount,
// //     getItemById,
// //     getItemDisplayInfo,
// //     isAuthenticated,
// //     hasItems: normalizedItems.length > 0
// //   };
// // };

// // export type UseCartReturn = ReturnType<typeof useCart>;

// // lib/hooks/useCart.ts
// 'use client';

// import { useCallback, useMemo, useEffect } from 'react';
// import { useAppSelector, useAppDispatch } from './redux';
// import {
//   addToGuestCart,
//   updateGuestCartItem,
//   removeFromGuestCart,
//   clearGuestCart,
//   moveFromWishlistToCart,
//   mergeCarts,
//   syncGuestCart,
//   fetchCart,
//   selectCartItems,
//   selectCartTotalItems,
//   selectCartSubtotal as selectCartSubtotalRaw,
//   selectCartLoading,
//   selectCartSyncing,
//   selectIsInCart,
//   selectCartItemCount,
//   selectNeedsCartMerge,
//   selectGuestCart,
//   selectUserCart,
//   selectMergeStatus
// } from '@/lib/features/carts/cartsSlice';
// import {
//   validateCoupon,
//   removeCoupon,
//   selectAppliedCoupon,
//   selectCouponValidationLoading,
//   selectCouponValidationError,
//   selectCouponDiscount
// } from '@/lib/features/coupon/couponSlice';
// import { useToast } from './useToast';
// import { Product } from '@/types';
// import { cartApi } from '@/lib/services/cartApi';
// import { RootState, store } from '../store';

// interface AddToCartParams {
//   product: Product;
//   quantity?: number;
//   size?: string;
//   color?: string;
// }

// interface UpdateCartItemParams {
//   itemId: string;
//   quantity: number;
// }

// export const useCart = () => {
//   const dispatch = useAppDispatch();
//   const { success, error } = useToast();




//   // Get auth state directly from Redux to avoid circular dependency
//   const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);

//   // Cart Selectors
//   const items = useAppSelector(selectCartItems);
//   const guestCart = useAppSelector(selectGuestCart);
//   const userCart = useAppSelector(selectUserCart);
//   const totalItems = useAppSelector(selectCartTotalItems);
//   const cartSubtotal = useAppSelector(selectCartSubtotalRaw);
//   const cartLoading = useAppSelector(selectCartLoading);
//   const cartSyncing = useAppSelector(selectCartSyncing);
//   const needsCartMerge = useAppSelector(selectNeedsCartMerge);
//   const mergeStatus = useAppSelector(selectMergeStatus);

//   // Coupon Selectors
//   const appliedCoupon = useAppSelector(selectAppliedCoupon);
//   const couponValidationLoading = useAppSelector(selectCouponValidationLoading);
//   const couponValidationError = useAppSelector(selectCouponValidationError);
//   const couponDiscount = useAppSelector(selectCouponDiscount);

//   // RTK Query mutations
//   const [addToCartApi, { isLoading: isAddingToCart }] = cartApi.useAddToCartMutation();
//   const [updateCartItemApi] = cartApi.useUpdateCartItemMutation();
//   const [removeCartItemApi] = cartApi.useRemoveCartItemMutation();
//   const [clearCartApi] = cartApi.useClearCartMutation();

//   // Auto-refresh cart when authentication state changes
//   useEffect(() => {
//     if (isAuthenticated) {
//       refreshCart();
//     }
//   }, [isAuthenticated]);

//   // Enhanced item normalization
//   const normalizeCartItem = useCallback((item: any) => {
//     if (item.productId) {
//       // Guest cart item
//       return {
//         id: item.id,
//         productId: item.productId,
//         product: item.product,
//         quantity: item.quantity,
//         price: item.price,
//         size: item.size,
//         color: item.color,
//       };
//     } else {
//       // User cart item from API
//       return {
//         id: item._id,
//         productId: item.product?._id,
//         product: item.product,
//         quantity: item.quantity,
//         price: item.price,
//         size: item.variant?.size,
//         color: item.variant?.color,
//       };
//     }
//   }, []);

//   // Enhanced cart items with normalization
//   const normalizedItems = useMemo(() => {
//     return items.map(normalizeCartItem);
//   }, [items, normalizeCartItem]);

//   // Calculate total with coupon discount - FIXED: No tax added
//   const total = useMemo(() => {
//     const shipping = 0; // Free shipping
//     return Math.max(0, cartSubtotal - couponDiscount + shipping);
//   }, [cartSubtotal, couponDiscount]);

//   // Add tax as a separate value for display purposes only
//   const tax = useMemo(() => {
//     return cartSubtotal * 0.1; // 10% tax for display only
//   }, [cartSubtotal]);

//   // Memoized cart state
//   const cartState = useMemo(() => ({
//     items: normalizedItems,
//     guestCart,
//     userCart,
//     totalItems,
//     subtotal: cartSubtotal,
//     total,
//     discount: couponDiscount,
//     appliedCoupon,
//     loading: cartLoading || isAddingToCart,
//     syncing: cartSyncing,
//     needsCartMerge,
//     mergeStatus,
//     isEmpty: normalizedItems.length === 0,
//     // Coupon specific states
//     couponValidationLoading,
//     couponValidationError,
//     tax // Include tax for display purposes
//   }), [
//     normalizedItems, guestCart, userCart, totalItems, cartSubtotal, total,
//     couponDiscount, appliedCoupon, cartLoading, isAddingToCart, cartSyncing,
//     needsCartMerge, mergeStatus, couponValidationLoading, couponValidationError
//   ]);

//   // Helper function to find existing cart item
//   const findExistingCartItem = useCallback((product: Product, size?: string, color?: string) => {
//     const currentState = store.getState() as RootState;
//     const existingCartItems = selectCartItems(currentState);

//     return existingCartItems.find((item: any) => {
//       const itemProductId = item.productId || item.product?._id;
//       const itemSize = item.size || item.variant?.size;
//       const itemColor = item.color || item.variant?.color;

//       // Match by product ID, size, and color
//       return itemProductId === product._id &&
//              itemSize === size &&
//              itemColor === color;
//     });
//   }, []);

//   // Enhanced add to cart function with duplicate prevention
//   const addToCart = useCallback(async ({
//     product,
//     quantity = 1,
//     size,
//     color
//   }: AddToCartParams) => {
//     try {
//       console.log('🛒 useCart.addToCart - Starting, product:', product._id, 'quantity:', quantity);

//       // Check inventory
//       if (product.inventory?.trackQuantity && product.inventory.quantity < quantity) {
//         error(`Only ${product.inventory.quantity} items available in stock`);
//         return false;
//       }

//       // Find existing item in cart
//       const existingItem = findExistingCartItem(product, size, color);

//       if (isAuthenticated && user) {
//         console.log('🛒 useCart.addToCart - User authenticated, using API');

//         if (existingItem) {
//           // Item exists, update quantity instead of adding new one
//           console.log('🛒 useCart.addToCart - Item exists, updating quantity');
//           const newQuantity = (existingItem.quantity || 0) + quantity;

//           await updateCartItemApi({
//             itemId: existingItem._id || existingItem.id,
//             quantity: newQuantity
//           }).unwrap();

//           await dispatch(fetchCart());
//           success(`Updated quantity of ${product.title} in cart! (${newQuantity} total)`);
//           return true;
//         } else {
//           // Add new item
//           console.log('🛒 useCart.addToCart - Adding new item to cart');
//           const requestData: any = {
//             productId: product._id,
//             quantity,
//           };

//           if (size) requestData.size = size;
//           if (color) requestData.color = color;

//           await addToCartApi(requestData).unwrap();
//           await dispatch(fetchCart());

//           success(`Added ${product.title} to cart!`);
//           return true;
//         }
//       } else {
//         console.log('🛒 useCart.addToCart - Guest mode, using local storage');

//         if (existingItem) {
//           // Update quantity for existing item
//           console.log('🛒 useCart.addToCart - Updating existing guest cart item');
//           dispatch(updateGuestCartItem({
//             id: existingItem.id,
//             quantity: existingItem.quantity + quantity
//           }));
//           success(`Updated quantity of ${product.title} in cart! (${existingItem.quantity + quantity} total)`);
//         } else {
//           // Add new item
//           console.log('🛒 useCart.addToCart - Adding new item to guest cart');
//           dispatch(addToGuestCart({
//             productId: product._id,
//             quantity,
//             size,
//             color,
//             price: product.price,
//             product: {
//               _id: product._id,
//               title: product.title,
//               images: product.images,
//               inventory: product.inventory,
//               slug: product.slug,
//               price: product.price,
//             },
//           }));
//           success(`Added ${product.title} to cart!`);
//         }
//         return true;
//       }
//     } catch (err: any) {
//       console.error('🛒 useCart.addToCart - Error:', err);

//       // Handle specific error cases
//       let errorMessage = 'Failed to add item to cart';
//       if (err?.status === 400) {
//         errorMessage = err?.data?.message || 'Invalid product or quantity';
//       } else if (err?.status === 404) {
//         errorMessage = 'Product not found';
//       } else if (err?.status === 409) {
//         errorMessage = 'Product is out of stock';
//       } else {
//         errorMessage = err?.data?.message || err?.message || errorMessage;
//       }

//       error(errorMessage);
//       return false;
//     }
//   }, [dispatch, isAuthenticated, user, addToCartApi, updateCartItemApi, success, error, findExistingCartItem]);

//   // Update quantity
//   const updateQuantity = useCallback(async ({
//     itemId,
//     quantity
//   }: UpdateCartItemParams) => {
//     try {
//       if (isAuthenticated && user) {
//         await updateCartItemApi({
//           itemId,
//           quantity
//         }).unwrap();
//         await dispatch(fetchCart());
//       } else {
//         dispatch(updateGuestCartItem({ id: itemId, quantity }));
//       }
//       return true;
//     } catch (err: any) {
//       const errorMessage = err?.data?.message || 'Failed to update item quantity';
//       error(errorMessage);
//       return false;
//     }
//   }, [dispatch, isAuthenticated, user, updateCartItemApi, error]);

//   // Remove from cart
//   const removeFromCart = useCallback(async (itemId: string) => {
//     try {
//       if (isAuthenticated && user) {
//         await removeCartItemApi(itemId).unwrap();
//         await dispatch(fetchCart());
//       } else {
//         dispatch(removeFromGuestCart(itemId));
//       }
//       success('Item removed from cart');
//       return true;
//     } catch (err: any) {
//       const errorMessage = err?.data?.message || 'Failed to remove item from cart';
//       error(errorMessage);
//       return false;
//     }
//   }, [dispatch, isAuthenticated, user, removeCartItemApi, success, error]);

//   // Clear entire cart
//   const clearCart = useCallback(async () => {
//     try {
//       if (isAuthenticated && user) {
//         await clearCartApi().unwrap();
//         await dispatch(fetchCart());
//       } else {
//         dispatch(clearGuestCart());
//       }
//       dispatch(removeCoupon()); // Also remove coupon when cart is cleared
//       success('Cart cleared');
//       return true;
//     } catch (err: any) {
//       const errorMessage = err?.data?.message || 'Failed to clear cart';
//       error(errorMessage);
//       return false;
//     }
//   }, [dispatch, isAuthenticated, user, clearCartApi, success, error]);

//   // Apply coupon code - FIXED: Uses proper cart data
//   const applyCouponCode = useCallback(async (code: string) => {
//     try {
//       console.log('🎫 useCart.applyCouponCode - Applying coupon:', code);

//       // Prepare products data for validation
//       const products = normalizedItems.map(item => ({
//         productId: item.productId,
//         product: item.product,
//         price: item.price,
//         quantity: item.quantity
//       }));

//       const result = await dispatch(validateCoupon({
//         code: code.toUpperCase().trim(),
//         cartAmount: cartSubtotal,
//         products
//       })).unwrap();

//       console.log('🎫 useCart.applyCouponCode - Coupon applied successfully:', result);
//       success(`Coupon ${code} applied successfully!`);
//       return true;
//     } catch (err: any) {
//       console.error('🎫 useCart.applyCouponCode - Error:', err);
//       const errorMessage = err.payload || 'Failed to apply coupon';
//       error(errorMessage);
//       return false;
//     }
//   }, [dispatch, cartSubtotal, normalizedItems, success, error]);

//   // Remove applied coupon
//   const removeCouponCode = useCallback(() => {
//     dispatch(removeCoupon());
//     success('Coupon removed');
//   }, [dispatch, success]);

//   // Merge guest cart with user cart
//   const handleMergeCarts = useCallback(async () => {
//     try {
//       if (!needsCartMerge) {
//         return { success: true, message: 'No cart merge needed' };
//       }
//       const result = await dispatch(mergeCarts()).unwrap();
//       success('Your cart items have been merged successfully!');
//       return { success: true, data: result };
//     } catch (err: any) {
//       const errorMessage = err?.data?.message || 'Failed to merge carts';
//       error(errorMessage);
//       return { success: false, error: errorMessage };
//     }
//   }, [dispatch, needsCartMerge, success, error]);

//   // Sync guest cart
//   const syncCart = useCallback(async () => {
//     try {
//       await dispatch(syncGuestCart()).unwrap();
//       success('Cart synced successfully!');
//       return true;
//     } catch (err: any) {
//       const errorMessage = err?.data?.message || 'Failed to sync cart';
//       error(errorMessage);
//       return false;
//     }
//   }, [dispatch, success, error]);

//   // Refresh cart data
//   const refreshCart = useCallback(async () => {
//     if (isAuthenticated) {
//       try {
//         console.log('🛒 Refreshing cart...');
//         await dispatch(fetchCart()).unwrap();
//       } catch (err) {
//         console.error('🛒 Failed to refresh cart:', err);
//       }
//     }
//   }, [dispatch, isAuthenticated]);

//   // Move item from wishlist to cart
//   const moveToCartFromWishlist = useCallback(async (product: Product, quantity?: number) => {
//     try {
//       if (isAuthenticated && user) {
//         await addToCartApi({
//           productId: product._id,
//           quantity: quantity || 1,
//         }).unwrap();
//         await dispatch(fetchCart());
//       } else {
//         dispatch(moveFromWishlistToCart({
//           productId: product._id,
//           product,
//           quantity
//         }));
//       }
//       success(`Moved ${product.title} to cart!`);
//       return true;
//     } catch (err) {
//       error('Failed to move item to cart');
//       return false;
//     }
//   }, [dispatch, isAuthenticated, user, addToCartApi, success, error]);

//   // Check if product is in cart
//   const isInCart = useCallback((productId: string) => {
//     return (state: any) => selectIsInCart(productId)(state);
//   }, []);

//   // Get item count for specific product
//   const getItemCount = useCallback((productId: string) => {
//     return (state: any) => selectCartItemCount(productId)(state);
//   }, []);

//   // Get item by ID
//   const getItemById = useCallback((itemId: string) => {
//     return normalizedItems.find(item => item.id === itemId);
//   }, [normalizedItems]);

//   // Get item display info for UI components
//   const getItemDisplayInfo = useCallback((item: any) => {
//     const normalizedItem = normalizeCartItem(item);
//     return {
//       id: normalizedItem.id,
//       productId: normalizedItem.productId,
//       title: normalizedItem.product?.title || normalizedItem.product?.name,
//       image: normalizedItem.product?.images?.[0]?.url || normalizedItem.product?.image || '/images/placeholder-product.jpg',
//       price: normalizedItem.price,
//       quantity: normalizedItem.quantity,
//       size: normalizedItem.size,
//       color: normalizedItem.color,
//       totalPrice: (normalizedItem.price || 0) * (normalizedItem.quantity || 1)
//     };
//   }, [normalizeCartItem]);

//   return {
//     // State
//     ...cartState,

//     // Actions
//     addToCart,
//     updateQuantity,
//     removeFromCart,
//     clearCart,
//     handleMergeCarts,
//     syncCart,
//     refreshCart,
//     applyCouponCode,
//     removeCouponCode,
//     moveToCartFromWishlist,

//     // Utilities
//     isInCart,
//     getItemCount,
//     getItemById,
//     getItemDisplayInfo,
//     isAuthenticated,
//     hasItems: normalizedItems.length > 0
//   };
// };

// export type UseCartReturn = ReturnType<typeof useCart>;

/// lib/hooks/useCart.ts
'use client';

import { useCallback, useMemo, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import {
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  moveFromWishlistToCart,
  mergeCarts,
  syncGuestCart,
  fetchCart,
  selectCartItems,
  selectCartTotalItems,
  selectCartSubtotal as selectCartSubtotalRaw,
  selectCartLoading,
  selectCartSyncing,
  selectIsInCart,
  selectCartItemCount,
  selectNeedsCartMerge,
  selectGuestCart,
  selectUserCart,
  selectMergeStatus
} from '@/lib/features/carts/cartsSlice';
import {
  validateCoupon,
  removeCoupon,
  selectAppliedCoupon,
  selectCouponValidationLoading,
  selectCouponValidationError,
  selectCouponDiscount
} from '@/lib/features/coupon/couponSlice';
import { useToast } from './useToast';
import { Product } from '@/types';
import { cartApi } from '@/lib/services/cartApi';
import { couponsApi } from '@/lib/services/couponsApi';
import { RootState, store } from '../store';

interface AddToCartParams {
  product: Product;
  quantity?: number;
  size?: string;
  color?: string;
}

interface UpdateCartItemParams {
  itemId: string;
  quantity: number;
}

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { success, error } = useToast();

  // Get auth state directly from Redux to avoid circular dependency
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);

  // Cart Selectors
  const items = useAppSelector(selectCartItems);
  const guestCart = useAppSelector(selectGuestCart);
  const userCart = useAppSelector(selectUserCart);
  const totalItems = useAppSelector(selectCartTotalItems);
  const cartSubtotal = useAppSelector(selectCartSubtotalRaw);
  const cartLoading = useAppSelector(selectCartLoading);
  const cartSyncing = useAppSelector(selectCartSyncing);
  const needsCartMerge = useAppSelector(selectNeedsCartMerge);
  const mergeStatus = useAppSelector(selectMergeStatus);

  // Coupon Selectors
  const appliedCoupon = useAppSelector(selectAppliedCoupon);
  const couponValidationLoading = useAppSelector(selectCouponValidationLoading);
  const couponValidationError = useAppSelector(selectCouponValidationError);
  const couponDiscount = useAppSelector(selectCouponDiscount);

  // RTK Query mutations
  const [addToCartApi, { isLoading: isAddingToCart }] = cartApi.useAddToCartMutation();
  const [updateCartItemApi] = cartApi.useUpdateCartItemMutation();
  const [removeCartItemApi] = cartApi.useRemoveCartItemMutation();
  const [clearCartApi] = cartApi.useClearCartMutation();

  // Enhanced item normalization
  const normalizeCartItem = useCallback((item: any) => {
    if (item.productId) {
      // Guest cart item
      return {
        id: item.id,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
      };
    } else {
      // User cart item from API
      return {
        id: item._id,
        productId: item.product?._id,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        size: item.variant?.size,
        color: item.variant?.color,
      };
    }
  }, []);

  // Enhanced cart items with normalization
  const normalizedItems = useMemo(() => {
    return items.map(normalizeCartItem);
  }, [items, normalizeCartItem]);

  // Calculate isEmpty
  const isEmpty = useMemo(() => {
    return normalizedItems.length === 0;
  }, [normalizedItems]);

  // Use couponsApi instead of direct fetch - FIXED
  const {
    data: availableCoupons = [],
    isLoading: loadingCoupons,
    refetch: refetchAvailableCoupons
  } = couponsApi.useGetAvailableCouponsQuery(
    {
      cartAmount: cartSubtotal,
      cartItems: normalizedItems.map(item => ({
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        price: item.price
      }))
    },
    {
      skip: isEmpty || cartSubtotal <= 0, // Skip when no items or zero subtotal
      refetchOnMountOrArgChange: true,
    }
  );

  const [couponInput, setCouponInput] = useState('');

  // Auto-refresh cart when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    }
  }, [isAuthenticated]);

  // Calculate total with coupon discount
  const total = useMemo(() => {
    const shipping = 0; // Free shipping
    return Math.max(0, cartSubtotal - couponDiscount + shipping);
  }, [cartSubtotal, couponDiscount]);

  // Add tax as a separate value for display purposes only
  const tax = useMemo(() => {
    return cartSubtotal * 0.1; // 10% tax for display only
  }, [cartSubtotal]);

  // Memoized cart state
  const cartState = useMemo(() => ({
    items: normalizedItems,
    guestCart,
    userCart,
    totalItems,
    subtotal: cartSubtotal,
    total,
    discount: couponDiscount,
    appliedCoupon,
    loading: cartLoading || isAddingToCart,
    syncing: cartSyncing,
    needsCartMerge,
    mergeStatus,
    isEmpty,
    // Coupon specific states
    couponValidationLoading,
    couponValidationError,
    tax,
    // Coupon state from RTK Query
    availableCoupons,
    loadingCoupons,
    couponInput,
    hasAvailableCoupons: availableCoupons.length > 0,
    canApplyCoupon: !appliedCoupon && couponInput.trim().length > 0,
    isCouponLoading: couponValidationLoading || loadingCoupons,
  }), [
    normalizedItems, guestCart, userCart, totalItems, cartSubtotal, total,
    couponDiscount, appliedCoupon, cartLoading, isAddingToCart, cartSyncing,
    needsCartMerge, mergeStatus, couponValidationLoading, couponValidationError,
    availableCoupons, loadingCoupons, couponInput, isEmpty, tax
  ]);

  // Helper function to find existing cart item
  const findExistingCartItem = useCallback((product: Product, size?: string, color?: string) => {
    const currentState = store.getState() as RootState;
    const existingCartItems = selectCartItems(currentState);

    return existingCartItems.find((item: any) => {
      const itemProductId = item.productId || item.product?._id;
      const itemSize = item.size || item.variant?.size;
      const itemColor = item.color || item.variant?.color;

      return itemProductId === product._id &&
             itemSize === size &&
             itemColor === color;
    });
  }, []);

  // Enhanced add to cart function with duplicate prevention
  const addToCart = useCallback(async ({
    product,
    quantity = 1,
    size,
    color
  }: AddToCartParams) => {
    try {
      console.log('🛒 useCart.addToCart - Starting, product:', product._id, 'quantity:', quantity);

      // Check inventory
      if (product.inventory?.trackQuantity && product.inventory.quantity < quantity) {
        error(`Only ${product.inventory.quantity} items available in stock`);
        return false;
      }

      // Find existing item in cart
      const existingItem = findExistingCartItem(product, size, color);

      if (isAuthenticated && user) {
        console.log('🛒 useCart.addToCart - User authenticated, using API');

        if (existingItem) {
          // Item exists, update quantity instead of adding new one
          console.log('🛒 useCart.addToCart - Item exists, updating quantity');
          const newQuantity = (existingItem.quantity || 0) + quantity;

          await updateCartItemApi({
            itemId: existingItem._id || existingItem.id,
            quantity: newQuantity
          }).unwrap();

          await dispatch(fetchCart());
          success(`Updated quantity of ${product.title} in cart! (${newQuantity} total)`);
          return true;
        } else {
          // Add new item
          console.log('🛒 useCart.addToCart - Adding new item to cart');
          const requestData: any = {
            productId: product._id,
            quantity,
          };

          if (size) requestData.size = size;
          if (color) requestData.color = color;

          await addToCartApi(requestData).unwrap();
          await dispatch(fetchCart());

          success(`Added ${product.title} to cart!`);
          return true;
        }
      } else {
        console.log('🛒 useCart.addToCart - Guest mode, using local storage');

        if (existingItem) {
          // Update quantity for existing item
          console.log('🛒 useCart.addToCart - Updating existing guest cart item');
          dispatch(updateGuestCartItem({
            id: existingItem.id,
            quantity: existingItem.quantity + quantity
          }));
          success(`Updated quantity of ${product.title} in cart! (${existingItem.quantity + quantity} total)`);
        } else {
          // Add new item
          console.log('🛒 useCart.addToCart - Adding new item to guest cart');
          dispatch(addToGuestCart({
            productId: product._id,
            quantity,
            size,
            color,
            price: product.price,
            product: {
              _id: product._id,
              title: product.title,
              images: product.images,
              inventory: product.inventory,
              slug: product.slug,
              price: product.price,
            },
          }));
          success(`Added ${product.title} to cart!`);
        }
        return true;
      }
    } catch (err: any) {
      console.error('🛒 useCart.addToCart - Error:', err);

      // Handle specific error cases
      let errorMessage = 'Failed to add item to cart';
      if (err?.status === 400) {
        errorMessage = err?.data?.message || 'Invalid product or quantity';
      } else if (err?.status === 404) {
        errorMessage = 'Product not found';
      } else if (err?.status === 409) {
        errorMessage = 'Product is out of stock';
      } else {
        errorMessage = err?.data?.message || err?.message || errorMessage;
      }

      error(errorMessage);
      return false;
    }
  }, [dispatch, isAuthenticated, user, addToCartApi, updateCartItemApi, success, error, findExistingCartItem]);

  // Update quantity
  const updateQuantity = useCallback(async ({
    itemId,
    quantity
  }: UpdateCartItemParams) => {
    try {
      if (isAuthenticated && user) {
        await updateCartItemApi({
          itemId,
          quantity
        }).unwrap();
        await dispatch(fetchCart());
      } else {
        dispatch(updateGuestCartItem({ id: itemId, quantity }));
      }
      return true;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to update item quantity';
      error(errorMessage);
      return false;
    }
  }, [dispatch, isAuthenticated, user, updateCartItemApi, error]);

  // Remove from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      if (isAuthenticated && user) {
        await removeCartItemApi(itemId).unwrap();
        await dispatch(fetchCart());
      } else {
        dispatch(removeFromGuestCart(itemId));
      }
      success('Item removed from cart');
      return true;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to remove item from cart';
      error(errorMessage);
      return false;
    }
  }, [dispatch, isAuthenticated, user, removeCartItemApi, success, error]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      if (isAuthenticated && user) {
        await clearCartApi().unwrap();
        await dispatch(fetchCart());
      } else {
        dispatch(clearGuestCart());
      }
      dispatch(removeCoupon()); // Also remove coupon when cart is cleared
      success('Cart cleared');
      return true;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to clear cart';
      error(errorMessage);
      return false;
    }
  }, [dispatch, isAuthenticated, user, clearCartApi, success, error]);

  // Apply coupon code
  const applyCouponCode = useCallback(async (code: string) => {
    try {
      console.log('🎫 useCart.applyCouponCode - Applying coupon:', code);

      // Prepare products data for validation
      const products = normalizedItems.map(item => ({
        productId: item.productId,
        product: item.product,
        price: item.price,
        quantity: item.quantity
      }));

      const result = await dispatch(validateCoupon({
        code: code.toUpperCase().trim(),
        cartAmount: cartSubtotal,
        products
      })).unwrap();

      console.log('🎫 useCart.applyCouponCode - Coupon applied successfully:', result);
      success(`Coupon ${code} applied successfully!`);
      setCouponInput(''); // Clear input after successful application
      return true;
    } catch (err: any) {
      console.error('🎫 useCart.applyCouponCode - Error:', err);
      const errorMessage = err.payload || 'Failed to apply coupon';
      error(errorMessage);
      return false;
    }
  }, [dispatch, cartSubtotal, normalizedItems, success, error]);

  // Enhanced apply coupon with better UX
  const applyCouponCodeEnhanced = useCallback(async (code: string) => {
    if (!code.trim()) {
      error('Please enter a coupon code');
      return false;
    }

    if (appliedCoupon) {
      error('Please remove current coupon before applying a new one');
      return false;
    }

    return await applyCouponCode(code);
  }, [applyCouponCode, appliedCoupon, error]);

  // Remove applied coupon
  const removeCouponCode = useCallback(() => {
    dispatch(removeCoupon());
    success('Coupon removed');
    setCouponInput(''); // Clear input when removing coupon
  }, [dispatch, success]);

  // Apply coupon from input
  const applyCouponFromInput = useCallback(async () => {
    return await applyCouponCodeEnhanced(couponInput);
  }, [applyCouponCodeEnhanced, couponInput]);

  // Quick apply from available coupons
  const quickApplyCoupon = useCallback(async (code: string) => {
    setCouponInput(code); // Pre-fill input
    return await applyCouponCodeEnhanced(code);
  }, [applyCouponCodeEnhanced]);

  // Manual refresh for available coupons
  const loadAvailableCoupons = useCallback(async () => {
    try {
      await refetchAvailableCoupons().unwrap();
    } catch (error) {
      console.error('Failed to refresh available coupons:', error);
    }
  }, [refetchAvailableCoupons]);

  // Merge guest cart with user cart
  const handleMergeCarts = useCallback(async () => {
    try {
      if (!needsCartMerge) {
        return { success: true, message: 'No cart merge needed' };
      }
      const result = await dispatch(mergeCarts()).unwrap();
      success('Your cart items have been merged successfully!');
      return { success: true, data: result };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to merge carts';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [dispatch, needsCartMerge, success, error]);

  // Sync guest cart
  const syncCart = useCallback(async () => {
    try {
      await dispatch(syncGuestCart()).unwrap();
      success('Cart synced successfully!');
      return true;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to sync cart';
      error(errorMessage);
      return false;
    }
  }, [dispatch, success, error]);

  // Refresh cart data
  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        console.log('🛒 Refreshing cart...');
        await dispatch(fetchCart()).unwrap();
      } catch (err) {
        console.error('🛒 Failed to refresh cart:', err);
      }
    }
  }, [dispatch, isAuthenticated]);

  // Move item from wishlist to cart
  const moveToCartFromWishlist = useCallback(async (product: Product, quantity?: number) => {
    try {
      if (isAuthenticated && user) {
        await addToCartApi({
          productId: product._id,
          quantity: quantity || 1,
        }).unwrap();
        await dispatch(fetchCart());
      } else {
        dispatch(moveFromWishlistToCart({
          productId: product._id,
          product,
          quantity
        }));
      }
      success(`Moved ${product.title} to cart!`);
      return true;
    } catch (err) {
      error('Failed to move item to cart');
      return false;
    }
  }, [dispatch, isAuthenticated, user, addToCartApi, success, error]);

  // Check if product is in cart
  const isInCart = useCallback((productId: string) => {
    return (state: any) => selectIsInCart(productId)(state);
  }, []);

  // Get item count for specific product
  const getItemCount = useCallback((productId: string) => {
    return (state: any) => selectCartItemCount(productId)(state);
  }, []);

  // Get item by ID
  const getItemById = useCallback((itemId: string) => {
    return normalizedItems.find(item => item.id === itemId);
  }, [normalizedItems]);

  // Get item display info for UI components
  const getItemDisplayInfo = useCallback((item: any) => {
    const normalizedItem = normalizeCartItem(item);
    return {
      id: normalizedItem.id,
      productId: normalizedItem.productId,
      title: normalizedItem.product?.title || normalizedItem.product?.name,
      image: normalizedItem.product?.images?.[0]?.url || normalizedItem.product?.image || '/images/placeholder-product.jpg',
      price: normalizedItem.price,
      quantity: normalizedItem.quantity,
      size: normalizedItem.size,
      color: normalizedItem.color,
      totalPrice: (normalizedItem.price || 0) * (normalizedItem.quantity || 1)
    };
  }, [normalizeCartItem]);

  return {
    // State
    ...cartState,

    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    handleMergeCarts,
    syncCart,
    refreshCart,
    applyCouponCode: applyCouponCodeEnhanced,
    removeCouponCode,
    moveToCartFromWishlist,

    // Utilities
    isInCart,
    getItemCount,
    getItemById,
    getItemDisplayInfo,
    isAuthenticated,
    hasItems: normalizedItems.length > 0,

    // Coupon actions and state setters
    setCouponInput,
    applyCouponFromInput,
    quickApplyCoupon,
    loadAvailableCoupons,
  };
};

export type UseCartReturn = ReturnType<typeof useCart>;
