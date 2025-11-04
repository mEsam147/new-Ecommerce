// lib/features/wishlist/wishlistSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import { Product } from '@/types';
import { wishlistApi } from '@/lib/services/wishlistApi';

interface GuestWishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

interface WishlistState {
  guestWishlist: GuestWishlistItem[];
  userWishlist: any[];
  loading: boolean;
  syncing: boolean;
  lastSyncedAt: string | null;
  mergeStatus: 'idle' | 'pending' | 'success' | 'error';
}

const initialState: WishlistState = {
  guestWishlist: [],
  userWishlist: [],
  loading: false,
  syncing: false,
  lastSyncedAt: null,
  mergeStatus: 'idle',
};

// Merge wishlists when user logs in
export const mergeWishlists = createAsyncThunk(
  'wishlist/mergeWishlists',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      console.log('💝 mergeWishlists - Starting wishlist merge process');
      const state = getState() as RootState;
      const { guestWishlist } = state.wishlist;
      const { user, token } = state.auth;

      if (!user || !token) {
        throw new Error('User authentication required for wishlist merge');
      }

      console.log('💝 mergeWishlists - User authenticated:', user.email);
      console.log('💝 mergeWishlists - Guest wishlist items:', guestWishlist.length);

      if (guestWishlist.length === 0) {
        console.log('💝 mergeWishlists - No guest items to merge, fetching user wishlist');
        const response = await dispatch(wishlistApi.endpoints.getWishlist.initiate()).unwrap();
        return {
          mergedWishlist: response.data?.items || [],
          guestWishlistItems: [],
          mergedCount: 0
        };
      }

      // Get current user wishlist
      console.log('💝 mergeWishlists - Fetching current user wishlist...');
      const userWishlistResponse = await dispatch(wishlistApi.endpoints.getWishlist.initiate()).unwrap();
      const userWishlist = userWishlistResponse.data?.items || [];
      console.log('💝 mergeWishlists - Current user wishlist items:', userWishlist.length);

      // Create a set of existing product IDs for quick lookup
      const existingProductIds = new Set(userWishlist.map((item: any) => item.product?._id));

      // Add guest items that don't exist in user wishlist
      const mergeOperations = [];
      let mergedCount = 0;

      for (const guestItem of guestWishlist) {
        if (!existingProductIds.has(guestItem.productId)) {
          console.log('💝 mergeWishlists - Adding new item to user wishlist:', guestItem.productId);
          mergeOperations.push(
            dispatch(wishlistApi.endpoints.addToWishlist.initiate({
              productId: guestItem.productId
            })).unwrap()
          );
          mergedCount++;
        } else {
          console.log('💝 mergeWishlists - Item already in user wishlist:', guestItem.productId);
        }
      }

      console.log('💝 mergeWishlists - Executing', mergeOperations.length, 'merge operations');
      if (mergeOperations.length > 0) {
        await Promise.all(mergeOperations);
        console.log('💝 mergeWishlists - All merge operations completed');
      }

      // Fetch updated wishlist
      console.log('💝 mergeWishlists - Fetching updated wishlist...');
      const finalResponse = await dispatch(wishlistApi.endpoints.getWishlist.initiate()).unwrap();
      console.log('💝 mergeWishlists - Final wishlist items:', finalResponse.data?.items?.length);

      return {
        mergedWishlist: finalResponse.data?.items || [],
        guestWishlistItems: guestWishlist,
        mergedCount
      };
    } catch (error: any) {
      console.error('💝 mergeWishlists failed:', error);

      let errorMessage = 'Failed to merge wishlists';
      if (error?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error?.status === 404) {
        errorMessage = 'Wishlist not found. Please try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Sync guest wishlist
export const syncGuestWishlist = createAsyncThunk(
  'wishlist/syncGuestWishlist',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      console.log('💝 syncGuestWishlist started');
      const state = getState() as RootState;
      const guestWishlist = state.wishlist.guestWishlist;
      console.log('💝 syncGuestWishlist - guest wishlist items:', guestWishlist.length);

      if (guestWishlist.length === 0) {
        console.log('💝 syncGuestWishlist - no items to sync');
        return guestWishlist;
      }

      const syncPromises = guestWishlist.map(item =>
        dispatch(wishlistApi.endpoints.addToWishlist.initiate({
          productId: item.productId
        })).unwrap()
      );

      console.log('💝 syncGuestWishlist - syncing', syncPromises.length, 'items');
      await Promise.all(syncPromises);
      console.log('💝 syncGuestWishlist - sync completed');
      return guestWishlist;
    } catch (error: any) {
      console.error('💝 syncGuestWishlist failed:', error);
      return rejectWithValue(error.message || 'Failed to sync wishlist');
    }
  }
);

// Fetch user wishlist
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      console.log('💝 fetchWishlist - Starting wishlist fetch');

      const state = getState() as RootState;
      const { token, user, isAuthenticated } = state.auth;

      console.log('💝 fetchWishlist - Auth state:', {
        isAuthenticated,
        hasToken: !!token,
        hasUser: !!user
      });

      // Check if we're properly authenticated
      if (!isAuthenticated || !token || !user) {
        console.log('💝 fetchWishlist - Not authenticated, skipping fetch');
        return { items: [] };
      }

      console.log('💝 fetchWishlist - Making API call to /wishlist...');
      const result = await dispatch(wishlistApi.endpoints.getWishlist.initiate()).unwrap();

      console.log('💝 fetchWishlist - API response received:', {
        success: result.success,
        itemsCount: result.data?.items?.length
      });

      if (!result.success) {
        console.error('💝 fetchWishlist - API returned error:', result);
        throw new Error(result.message || 'Failed to fetch wishlist');
      }

      console.log('💝 fetchWishlist - Success, items:', result.data?.items?.length);
      return result.data || { items: [] };

    } catch (error: any) {
      console.error('💝 fetchWishlist - Failed:', error);

      let errorMessage = 'Failed to fetch wishlist';
      if (error?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error?.status === 404) {
        errorMessage = 'Wishlist not found.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Guest wishlist actions
    addToGuestWishlist: (state, action: PayloadAction<{
      productId: string;
      product: Product;
    }>) => {
      console.log('💝 addToGuestWishlist action:', action.payload);
      const { productId, product } = action.payload;

      const existingItemIndex = state.guestWishlist.findIndex(
        item => item.productId === productId
      );

      if (existingItemIndex === -1) {
        state.guestWishlist.push({
          id: `${productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId,
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
          addedAt: new Date().toISOString(),
        });
        console.log('💝 addToGuestWishlist - added new item');
      } else {
        console.log('💝 addToGuestWishlist - item already in wishlist');
      }
      console.log('💝 addToGuestWishlist - guest wishlist items:', state.guestWishlist.length);
    },

    removeFromGuestWishlist: (state, action: PayloadAction<string>) => {
      console.log('💝 removeFromGuestWishlist action:', action.payload);
      const productId = action.payload;
      state.guestWishlist = state.guestWishlist.filter(item => item.productId !== productId);
      console.log('💝 removeFromGuestWishlist - guest wishlist items:', state.guestWishlist.length);
    },

    clearGuestWishlist: (state) => {
      console.log('💝 clearGuestWishlist action');
      state.guestWishlist = [];
      console.log('💝 clearGuestWishlist - guest wishlist cleared');
    },

    // Set user wishlist directly (for RTK Query updates)
    setUserWishlist: (state, action: PayloadAction<any[]>) => {
      console.log('💝 setUserWishlist action - items:', action.payload.length);
      state.userWishlist = action.payload;
      console.log('💝 setUserWishlist - user wishlist updated:', state.userWishlist.length);
    },

    // Clear both wishlists
    clearAllWishlists: (state) => {
      console.log('💝 clearAllWishlists action');
      state.guestWishlist = [];
      state.userWishlist = [];
      state.lastSyncedAt = null;
      state.mergeStatus = 'idle';
      console.log('💝 clearAllWishlists - all wishlists cleared');
    },

    // Reset merge status
    resetMergeStatus: (state) => {
      console.log('💝 resetMergeStatus action');
      state.mergeStatus = 'idle';
    },

    // Force set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      console.log('💝 setLoading action:', action.payload);
      state.loading = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // mergeWishlists cases
      .addCase(mergeWishlists.pending, (state) => {
        console.log('💝 mergeWishlists.pending');
        state.syncing = true;
        state.loading = true;
        state.mergeStatus = 'pending';
      })
      .addCase(mergeWishlists.fulfilled, (state, action) => {
        console.log('💝 mergeWishlists.fulfilled - merged items:', action.payload.mergedWishlist.length);
        state.syncing = false;
        state.loading = false;
        state.userWishlist = action.payload.mergedWishlist;
        state.guestWishlist = [];
        state.lastSyncedAt = new Date().toISOString();
        state.mergeStatus = 'success';
        console.log('💝 mergeWishlists.fulfilled - user wishlist after merge:', state.userWishlist.length);
        console.log('💝 mergeWishlists.fulfilled - guest wishlist after merge:', state.guestWishlist.length);
      })
      .addCase(mergeWishlists.rejected, (state, action) => {
        console.error('💝 mergeWishlists.rejected:', action.payload);
        state.syncing = false;
        state.loading = false;
        state.mergeStatus = 'error';
      })
      // syncGuestWishlist cases
      .addCase(syncGuestWishlist.pending, (state) => {
        console.log('💝 syncGuestWishlist.pending');
        state.syncing = true;
      })
      .addCase(syncGuestWishlist.fulfilled, (state) => {
        console.log('💝 syncGuestWishlist.fulfilled');
        state.syncing = false;
        state.guestWishlist = [];
        state.lastSyncedAt = new Date().toISOString();
        console.log('💝 syncGuestWishlist.fulfilled - guest wishlist cleared');
      })
      .addCase(syncGuestWishlist.rejected, (state, action) => {
        console.error('💝 syncGuestWishlist.rejected:', action.payload);
        state.syncing = false;
      })
      // fetchWishlist cases
      .addCase(fetchWishlist.pending, (state) => {
        console.log('💝 fetchWishlist.pending');
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        console.log('💝 fetchWishlist.fulfilled - items:', action.payload?.items?.length);
        state.loading = false;
        state.userWishlist = action.payload?.items || [];
        console.log('💝 fetchWishlist.fulfilled - user wishlist updated:', state.userWishlist.length);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        console.error('💝 fetchWishlist.rejected:', action.payload);
        state.loading = false;
        state.userWishlist = [];
      });
  },
});

export const {
  addToGuestWishlist,
  removeFromGuestWishlist,
  clearGuestWishlist,
  setUserWishlist,
  clearAllWishlists,
  resetMergeStatus,
  setLoading,
} = wishlistSlice.actions;

// Selectors
export const selectGuestWishlist = (state: RootState) => state.wishlist.guestWishlist;
export const selectUserWishlist = (state: RootState) => state.wishlist.userWishlist;
export const selectWishlistLoading = (state: RootState) => state.wishlist.loading;
export const selectWishlistSyncing = (state: RootState) => state.wishlist.syncing;
export const selectLastSyncedAt = (state: RootState) => state.wishlist.lastSyncedAt;
export const selectMergeStatus = (state: RootState) => state.wishlist.mergeStatus;

export const selectWishlistItems = (state: RootState) => {
  const { auth, wishlist } = state;
  return auth.isAuthenticated && auth.user ? wishlist.userWishlist : wishlist.guestWishlist;
};

export const selectWishlistTotalItems = (state: RootState) => {
  const items = selectWishlistItems(state);
  return items.length;
};

export const selectIsInWishlist = (productId: string) => (state: RootState) => {
  const items = selectWishlistItems(state);
  return items.some((item: any) =>
    item.productId === productId || item.product?._id === productId
  );
};

export const selectNeedsWishlistMerge = (state: RootState) => {
  const { auth, wishlist } = state;
  return auth.token && auth.user && wishlist.guestWishlist.length > 0;
};

export default wishlistSlice.reducer;
