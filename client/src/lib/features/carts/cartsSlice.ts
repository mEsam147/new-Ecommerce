// lib/features/cart/cartSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import { GuestCartItem } from '@/types';
import { cartApi } from '@/lib/services/cartApi';

interface CartState {
  guestCart: GuestCartItem[];
  userCart: any[];
  syncing: boolean;
  loading: boolean;
  appliedCoupon: {
    code: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed' | 'free_shipping';
  } | null;
  lastSyncedAt: string | null;
  mergeStatus: 'idle' | 'pending' | 'success' | 'error';
}

const initialState: CartState = {
  guestCart: [],
  userCart: [],
  syncing: false,
  loading: false,
  appliedCoupon: null,
  lastSyncedAt: null,
  mergeStatus: 'idle',
};

console.log('🛒 Cart slice initialized');

// Enhanced merge carts with conflict resolution
// In your cartSlice.ts - Improve the mergeCarts thunk
export const mergeCarts = createAsyncThunk(
  'cart/mergeCarts',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      console.log('🛒 mergeCarts - Starting cart merge process');
      const state = getState() as RootState;
      const { guestCart } = state.cart;
      const { user, token } = state.auth;

      // Validate authentication state
      if (!user || !token) {
        console.error('🛒 mergeCarts - User not properly authenticated');
        throw new Error('User authentication required for cart merge');
      }

      console.log('🛒 mergeCarts - User authenticated:', user.email);
      console.log('🛒 mergeCarts - Guest cart items:', guestCart.length);

      if (guestCart.length === 0) {
        console.log('🛒 mergeCarts - No guest items to merge, fetching user cart');
        const response = await dispatch(cartApi.endpoints.getCart.initiate()).unwrap();
        return {
          mergedCart: response.data?.items || [],
          guestCartItems: [],
          mergedCount: 0
        };
      }

      // Ensure we have the latest user cart first
      console.log('🛒 mergeCarts - Fetching current user cart...');
      const userCartResponse = await dispatch(cartApi.endpoints.getCart.initiate()).unwrap();
      const userCart = userCartResponse.data?.items || [];
      console.log('🛒 mergeCarts - Current user cart items:', userCart.length);

      // Create a map for efficient lookup
      const userCartMap = new Map();
      userCart.forEach((item: any) => {
        const key = `${item.product?._id}-${item.variant?.size || ''}-${item.variant?.color || ''}`.toLowerCase();
        userCartMap.set(key, item);
      });

      // Process merge operations
      const mergeOperations = [];
      let mergedCount = 0;

      for (const guestItem of guestCart) {
        const guestKey = `${guestItem.productId}-${guestItem.size || ''}-${guestItem.color || ''}`.toLowerCase();
        const existingUserItem = userCartMap.get(guestKey);

        if (existingUserItem) {
          // Item exists in both carts - use maximum quantity strategy
          console.log('🛒 mergeCarts - Item exists in both carts:', guestItem.productId);
          const newQuantity = Math.max(existingUserItem.quantity, guestItem.quantity);

          if (newQuantity !== existingUserItem.quantity) {
            mergeOperations.push(
              dispatch(cartApi.endpoints.updateCartItem.initiate({
                itemId: existingUserItem._id,
                quantity: newQuantity
              })).unwrap()
            );
            mergedCount++;
          }
        } else {
          // Item only in guest cart - add to user cart
          console.log('🛒 mergeCarts - Adding new item to user cart:', guestItem.productId);
          mergeOperations.push(
            dispatch(cartApi.endpoints.addToCart.initiate({
              productId: guestItem.productId,
              quantity: guestItem.quantity,
              size: guestItem.size,
              color: guestItem.color
            })).unwrap()
          );
          mergedCount++;
        }
      }

      console.log('🛒 mergeCarts - Executing', mergeOperations.length, 'merge operations');
      if (mergeOperations.length > 0) {
        await Promise.all(mergeOperations);
        console.log('🛒 mergeCarts - All merge operations completed');
      }

      // Fetch the updated cart to ensure we have latest data
      console.log('🛒 mergeCarts - Fetching updated cart...');
      const finalCartResponse = await dispatch(cartApi.endpoints.getCart.initiate()).unwrap();
      console.log('🛒 mergeCarts - Final cart items:', finalCartResponse.data?.items?.length);

      return {
        mergedCart: finalCartResponse.data?.items || [],
        guestCartItems: guestCart,
        mergedCount
      };
    } catch (error: any) {
      console.error('🛒 mergeCarts failed:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to merge carts';
      if (error?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error?.status === 404) {
        errorMessage = 'Cart not found. Please try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Sync guest cart
export const syncGuestCart = createAsyncThunk(
  'cart/syncGuestCart',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      console.log('🛒 syncGuestCart started');
      const state = getState() as RootState;
      const guestCart = state.cart.guestCart;
      console.log('🛒 syncGuestCart - guest cart items:', guestCart.length);

      if (guestCart.length === 0) {
        console.log('🛒 syncGuestCart - no items to sync');
        return guestCart;
      }

      const syncPromises = guestCart.map(item =>
        dispatch(cartApi.endpoints.addToCart.initiate({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })).unwrap()
      );

      console.log('🛒 syncGuestCart - syncing', syncPromises.length, 'items');
      await Promise.all(syncPromises);
      console.log('🛒 syncGuestCart - sync completed');
      return guestCart;
    } catch (error: any) {
      console.error('🛒 syncGuestCart failed:', error);
      return rejectWithValue(error.message || 'Failed to sync cart');
    }
  }
);



// export const fetchCart = createAsyncThunk(
//   'cart/fetchCart',
//   async (_, { rejectWithValue, dispatch, getState }) => {
//     try {
//       console.log('🛒 fetchCart - Starting cart fetch');

//       const state = getState() as RootState;
//       const { token, user, isAuthenticated } = state.auth;

//       console.log('🛒 fetchCart - Auth state:', {
//         isAuthenticated,
//         hasToken: !!token,
//         hasUser: !!user
//       });

//       // Check if we're properly authenticated
//       if (!isAuthenticated || !token || !user) {
//         console.log('🛒 fetchCart - Not authenticated, skipping fetch');
//         return { items: [] };
//       }

//       console.log('🛒 fetchCart - Making API call to /carts...');

//       const result = await dispatch(cartApi.endpoints.getCart.initiate()).unwrap();

//       console.log('🛒 fetchCart - API response received:', {
//         success: result.success,
//         itemsCount: result.data?.items?.length,
//         isEmpty: result.data?.items?.length === 0
//       });

//       if (!result.success) {
//         console.error('🛒 fetchCart - API returned error:', result);
//         throw new Error(result.message || 'Failed to fetch cart');
//       }

//       // FIX: Empty cart is a valid state - don't treat it as an error
//       console.log('🛒 fetchCart - Success, items:', result.data?.items?.length);
//       return result.data || { items: [] };

//     } catch (error: any) {
//       console.error('🛒 fetchCart - Failed:', error);

//       let errorMessage = 'Failed to fetch cart';

//       if (error?.status === 401) {
//         errorMessage = 'Authentication failed. Please log in again.';
//       } else if (error?.status === 404) {
//         // FIX: 404 might mean cart doesn't exist yet, which is fine
//         console.log('🛒 fetchCart - Cart not found (might be first time user), returning empty cart');
//         return { items: [] };
//       } else if (error?.message) {
//         errorMessage = error.message;
//       }

//       return rejectWithValue(errorMessage);
//     }
//   }
// );



export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      console.log('🛒 fetchCart - Starting cart fetch');

      const state = getState() as RootState;
      const { token, user, isAuthenticated } = state.auth;

      console.log('🛒 fetchCart - Auth state:', {
        isAuthenticated,
        hasToken: !!token,
        hasUser: !!user,
        userEmail: user?.email
      });

      // Check if we're properly authenticated
      if (!isAuthenticated || !token || !user) {
        console.log('🛒 fetchCart - Not authenticated, returning empty cart');
        return { items: [] };
      }

      console.log('🛒 fetchCart - Making API call to /carts...');

      const result = await dispatch(cartApi.endpoints.getCart.initiate()).unwrap();

      console.log('🛒 fetchCart - API response:', {
        success: result.success,
        itemsCount: result.data?.items?.length
      });

      if (!result.success) {
        console.error('🛒 fetchCart - API returned error:', result);
        throw new Error(result.message || 'Failed to fetch cart');
      }

      console.log('🛒 fetchCart - Success, items:', result.data?.items?.length);
      return result.data || { items: [] };

    } catch (error: any) {
      console.error('🛒 fetchCart - Failed:', error);

      // Don't show error for 404 - empty cart is normal
      if (error?.status === 404) {
        console.log('🛒 fetchCart - Cart not found (new user), returning empty');
        return { items: [] };
      }

      let errorMessage = 'Failed to fetch cart';
      if (error?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);


const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Guest cart actions
    addToGuestCart: (state, action: PayloadAction<{
      productId: string;
      size?: string;
      color?: string;
      quantity: number;
      price: number;
      product: any;
    }>) => {
      console.log('🛒 addToGuestCart action:', action.payload);
      const { productId, size, color, quantity, price, product } = action.payload;

      const existingItemIndex = state.guestCart.findIndex(
        item => item.productId === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingItemIndex > -1) {
        state.guestCart[existingItemIndex].quantity += quantity;
        console.log('🛒 addToGuestCart - updated existing item');
      } else {
        state.guestCart.push({
          id: `${productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId,
          size,
          color,
          quantity,
          price,
          product: {
            _id: product._id,
            title: product.title,
            images: product.images,
            inventory: product.inventory,
            slug: product.slug,
            price: product.price,
          },
          addedAt: new Date().toISOString(),
        });
        console.log('🛒 addToGuestCart - added new item');
      }
      console.log('🛒 addToGuestCart - guest cart items:', state.guestCart.length);
    },

    updateGuestCartItem: (state, action: PayloadAction<{
      id: string;
      quantity: number;
    }>) => {
      console.log('🛒 updateGuestCartItem action:', action.payload);
      const { id, quantity } = action.payload;
      const itemIndex = state.guestCart.findIndex(item => item.id === id);

      if (itemIndex > -1) {
        if (quantity <= 0) {
          state.guestCart.splice(itemIndex, 1);
          console.log('🛒 updateGuestCartItem - removed item');
        } else {
          state.guestCart[itemIndex].quantity = quantity;
          console.log('🛒 updateGuestCartItem - updated quantity');
        }
      }
      console.log('🛒 updateGuestCartItem - guest cart items:', state.guestCart.length);
    },

    removeFromGuestCart: (state, action: PayloadAction<string>) => {
      console.log('🛒 removeFromGuestCart action:', action.payload);
      const id = action.payload;
      state.guestCart = state.guestCart.filter(item => item.id !== id);
      console.log('🛒 removeFromGuestCart - guest cart items:', state.guestCart.length);
    },

    clearGuestCart: (state) => {
      console.log('🛒 clearGuestCart action');
      state.guestCart = [];
      state.appliedCoupon = null;
      console.log('🛒 clearGuestCart - guest cart cleared');
    },

    // Set user cart directly (for RTK Query updates)
    setUserCart: (state, action: PayloadAction<any[]>) => {
      console.log('🛒 setUserCart action - items:', action.payload.length);
      state.userCart = action.payload;
      console.log('🛒 setUserCart - user cart updated:', state.userCart.length);
    },

    // Clear both carts
clearAllCarts: (state) => {
  console.log('🛒 clearAllCarts - Resetting entire cart state');
  state.guestCart = [];
  state.userCart = [];
  state.appliedCoupon = null;
  state.lastSyncedAt = null;
  state.mergeStatus = 'idle';
  state.loading = false;
  state.syncing = false;
  console.log('🛒 clearAllCarts - All cart state reset');
},





    // Move from wishlist to cart
    moveFromWishlistToCart: (state, action: PayloadAction<{
      productId: string;
      product: any;
      quantity?: number;
    }>) => {
      console.log('🛒 moveFromWishlistToCart action:', action.payload);
      const { productId, product, quantity = 1 } = action.payload;

      const existingItemIndex = state.guestCart.findIndex(
        item => item.productId === productId
      );

      if (existingItemIndex > -1) {
        state.guestCart[existingItemIndex].quantity += quantity;
        console.log('🛒 moveFromWishlistToCart - updated existing item');
      } else {
        state.guestCart.push({
          id: `${productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId,
          quantity,
          price: product.price,
          product: {
            _id: product._id,
            title: product.title,
            images: product.images,
            inventory: product.inventory,
            slug: product.slug,
            price: product.price,
          },
          addedAt: new Date().toISOString(),
        });
        console.log('🛒 moveFromWishlistToCart - added new item');
      }
      console.log('🛒 moveFromWishlistToCart - guest cart items:', state.guestCart.length);
    },

    // Reset merge status
    resetMergeStatus: (state) => {
      console.log('🛒 resetMergeStatus action');
      state.mergeStatus = 'idle';
    },

    // Force set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      console.log('🛒 setLoading action:', action.payload);
      state.loading = action.payload;
    },
     preloadUserCart: (state, action: PayloadAction<any[]>) => {
      console.log('🛒 preloadUserCart - Preloading user cart with:', action.payload.length, 'items');
      state.userCart = action.payload;
      state.loading = false;
    },

    // Directly update user cart from API response
    updateUserCartFromApi: (state, action: PayloadAction<{
      items: any[];
      totalPrice?: number;
      totalItems?: number;
    }>) => {
      console.log('🛒 updateUserCartFromApi action - items:', action.payload.items?.length);
      state.userCart = action.payload.items || [];
      state.loading = false;
      console.log('🛒 updateUserCartFromApi - user cart updated:', state.userCart.length);
    },
  },



  extraReducers: (builder) => {
    builder
      // mergeCarts cases
      .addCase(mergeCarts.pending, (state) => {
        console.log('🛒 mergeCarts.pending');
        state.syncing = true;
        state.loading = true;
        state.mergeStatus = 'pending';
      })
      .addCase(mergeCarts.fulfilled, (state, action) => {
        console.log('🛒 mergeCarts.fulfilled - merged items:', action.payload.mergedCart.length);
        state.syncing = false;
        state.loading = false;
        state.userCart = action.payload.mergedCart;
        state.guestCart = [];
        state.lastSyncedAt = new Date().toISOString();
        state.mergeStatus = 'success';
        console.log('🛒 mergeCarts.fulfilled - user cart after merge:', state.userCart.length);
        console.log('🛒 mergeCarts.fulfilled - guest cart after merge:', state.guestCart.length);
      })
      .addCase(mergeCarts.rejected, (state, action) => {
        console.error('🛒 mergeCarts.rejected:', action.payload);
        state.syncing = false;
        state.loading = false;
        state.mergeStatus = 'error';
      })
      // syncGuestCart cases
      .addCase(syncGuestCart.pending, (state) => {
        console.log('🛒 syncGuestCart.pending');
        state.syncing = true;
      })
      .addCase(syncGuestCart.fulfilled, (state) => {
        console.log('🛒 syncGuestCart.fulfilled');
        state.syncing = false;
        state.guestCart = [];
        state.lastSyncedAt = new Date().toISOString();
        console.log('🛒 syncGuestCart.fulfilled - guest cart cleared');
      })
      .addCase(syncGuestCart.rejected, (state, action) => {
        console.error('🛒 syncGuestCart.rejected:', action.payload);
        state.syncing = false;
      })
      // fetchCart cases
      .addCase(fetchCart.pending, (state) => {
        console.log('🛒 fetchCart.pending');
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        console.log('🛒 fetchCart.fulfilled - payload received');
        console.log('🛒 fetchCart.fulfilled - action payload:', action.payload);
        console.log('🛒 fetchCart.fulfilled - items from payload:', action.payload?.items);
        console.log('🛒 fetchCart.fulfilled - items count:', action.payload?.items?.length);

        state.loading = false;
        state.userCart = action.payload?.items || [];

        console.log('🛒 fetchCart.fulfilled - state.userCart after update:', state.userCart);
        console.log('🛒 fetchCart.fulfilled - state.userCart length:', state.userCart.length);

        if (state.userCart.length > 0) {
          console.log('🛒 fetchCart.fulfilled - first user cart item:', {
            id: state.userCart[0]._id,
            product: state.userCart[0].product,
            quantity: state.userCart[0].quantity
          });
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        console.error('🛒 fetchCart.rejected:', action.payload);
        state.loading = false;
        state.userCart = [];
      });
  },
});

export const {
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  setUserCart,
  clearAllCarts,

  moveFromWishlistToCart,
  resetMergeStatus,
  setLoading,
    preloadUserCart,

  updateUserCartFromApi,
} = cartSlice.actions;

// Selectors with comprehensive debugging
export const selectGuestCart = (state: RootState) => {
  const guestCart = state.cart.guestCart;
  console.log('🛒 selectGuestCart - items:', guestCart.length);
  return guestCart;
};

export const selectUserCart = (state: RootState) => {
  const userCart = state.cart.userCart;
  console.log('🛒 selectUserCart - items:', userCart.length);
  if (userCart.length > 0) {
    console.log('🛒 selectUserCart - sample item:', {
      id: userCart[0]._id,
      product: userCart[0].product,
      quantity: userCart[0].quantity
    });
  }
  return userCart;
};

export const selectCartSyncing = (state: RootState) => state.cart.syncing;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectAppliedCoupon = (state: RootState) => state.cart.appliedCoupon;
export const selectLastSyncedAt = (state: RootState) => state.cart.lastSyncedAt;
export const selectMergeStatus = (state: RootState) => state.cart.mergeStatus;

// export const selectCartItems = (state: RootState) => {
//   const { auth, cart } = state;

//   console.log('🛒 selectCartItems - AUTH STATE:', {
//     token: !!auth.token,
//     user: !!auth.user,
//     isAuthenticated: auth.isAuthenticated,
//     userEmail: auth.user?.email
//   });

//   console.log('🛒 selectCartItems - CART STATE:', {
//     guestCartItems: cart.guestCart.length,
//     userCartItems: cart.userCart.length,
//     loading: cart.loading,
//     syncing: cart.syncing
//   });

//   // FIX: Use isAuthenticated instead of token check
//   const items = auth.isAuthenticated && auth.user ? cart.userCart : cart.guestCart;

//   console.log('🛒 selectCartItems - RETURNING ITEMS:', {
//     source: auth.isAuthenticated && auth.user ? 'USER_CART' : 'GUEST_CART',
//     itemCount: items.length
//   });

//   return items;
// };


// lib/features/cart/cartSlice.ts - Update selectCartItems
export const selectCartItems = (state: RootState) => {
  const { auth, cart } = state;

  console.log('🛒 selectCartItems - State:', {
    isAuthenticated: auth.isAuthenticated,
    hasUser: !!auth.user,
    userCartItems: cart.userCart.length,
    guestCartItems: cart.guestCart.length
  });

  // FIX: Return userCart even if it's empty when authenticated
  if (auth.isAuthenticated && auth.user) {
    console.log('🛒 selectCartItems - Using USER cart (may be empty):', cart.userCart.length);
    return cart.userCart;
  } else {
    console.log('🛒 selectCartItems - Using GUEST cart:', cart.guestCart.length);
    return cart.guestCart;
  }
};


export const selectCartTotalItems = (state: RootState) => {
  const items = selectCartItems(state);
  const total = items.reduce((total: number, item: any) => total + (item.quantity ?? 0), 0);
  console.log('🛒 selectCartTotalItems:', total);
  return total;
};

// lib/features/cart/cartSlice.ts - Update selectors

// export const selectCartSubtotal = (state: RootState) => {
//   const items = selectCartItems(state);
//   const subtotal = items.reduce((total: number, item: any) =>
//     total + (item.price || item.product?.price || 0) * (item.quantity ?? 0), 0
//   );
//   return subtotal;
// };

export const selectCartSubtotal = (state: RootState) => {
  const items = selectCartItems(state);
  const subtotal = items.reduce((total: number, item: any) => {
    const price = item.price || item.product?.price || 0;
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
  return subtotal;
};

// export const selectCartTotal = (state: RootState) => {
//   const subtotal = selectCartSubtotal(state);
//   const coupon = selectAppliedCoupon(state);

//   let discount = 0;
//   if (coupon) {
//     if (coupon.discountType === 'percentage') {
//       discount = subtotal * (coupon.discountAmount / 100);
//     } else {
//       discount = coupon.discountAmount;
//     }
//   }

//   // Only subtract discount, don't add tax
//   const shipping = subtotal >= 50 ? 0 : 9.99; // Optional: Add shipping logic

//   return Math.max(0, subtotal - discount + shipping);
// };

// export const selectCartDiscount = (state: RootState) => {
//   const subtotal = selectCartSubtotal(state);
//   const coupon = selectAppliedCoupon(state);

//   if (!coupon) return 0;

//   if (coupon.discountType === 'percentage') {
//     return subtotal * (coupon.discountAmount / 100);
//   }
//   return coupon.discountAmount;
// };

export const selectCartTotal = (state: RootState) => {
  const subtotal = selectCartSubtotal(state);
  const coupon = selectAppliedCoupon(state);

  if (!coupon) return subtotal;

  if (coupon.discountType === 'percentage') {
    return Math.max(0, subtotal * (1 - coupon.discountAmount / 100));
  }
  return Math.max(0, subtotal - coupon.discountAmount);
};

export const selectCartDiscount = (state: RootState) => {
  const subtotal = selectCartSubtotal(state);
  const total = selectCartTotal(state);
  return Math.max(0, subtotal - total);
};

export const selectIsInCart = (productId: string) => (state: RootState) => {
  const items = selectCartItems(state);
  const isInCart = items.some((item: any) =>
    item.productId === productId || item.product?._id === productId
  );
  console.log('🛒 selectIsInCart - productId:', productId, 'isInCart:', isInCart);
  return isInCart;
};

export const selectCartItemCount = (productId: string) => (state: RootState) => {
  const items = selectCartItems(state);
  const count = items
    .filter((item: any) => item.productId === productId || item.product?._id === productId)
    .reduce((total: number, item: any) => total + (item.quantity ?? 0), 0);
  console.log('🛒 selectCartItemCount - productId:', productId, 'count:', count);
  return count;
};

export const selectNeedsCartMerge = (state: RootState) => {
  const { auth, cart } = state;
  const needsMerge = auth.token && auth.user && cart.guestCart.length > 0;
  console.log('🛒 selectNeedsCartMerge:', needsMerge, {
    isAuthenticated: auth.token && auth.user,
    guestCartItems: cart.guestCart.length
  });
  return needsMerge;
};

// Debug selector to see entire cart state
export const selectEntireCartState = (state: RootState) => {
  console.log('🛒 selectEntireCartState - FULL CART STATE:', {
    guestCart: state.cart.guestCart,
    userCart: state.cart.userCart,
    loading: state.cart.loading,
    syncing: state.cart.syncing,
    mergeStatus: state.cart.mergeStatus
  });
  return state.cart;
};

// Selector for normalized cart items
export const selectNormalizedCartItems = (state: RootState) => {
  const items = selectCartItems(state);
  const normalized = items.map((item: any) => {
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
        price: item.price || item.product?.price,
        size: item.variant?.size,
        color: item.variant?.color,
      };
    }
  });
  console.log('🛒 selectNormalizedCartItems - normalized items:', normalized.length);
  return normalized;
};

export default cartSlice.reducer;
