// // lib/hooks/useAuth.ts
// import { useCallback } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import {
//   useLoginMutation,
//   useRegisterMutation,
//   useLogoutMutation,
//   useLazyGetMeQuery,
// } from '@/lib/services/authApi';
// import { mergeCarts, fetchCart, selectUserCart, clearAllCarts } from '@/lib/features/carts/cartsSlice';
// import { useToast } from './useToast';
// import type { LoginData, RegisterData } from '@/types';
// import { RootState, store } from '@/lib/store';
// import { useAppDispatch, useAppSelector } from './redux';

// export const useAuth = () => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const dispatch = useAppDispatch();
//   const { success, error: showError, info } = useToast();

//   // Get auth state from Redux store
//   const { user, isAuthenticated, token, isLoading: authLoading } = useAppSelector((state: RootState) => state.auth);

//   // Get cart state
//   const guestCart = useAppSelector((state: RootState) => state.cart.guestCart);
//   const userCart = useAppSelector(selectUserCart);
//   const needsCartMerge = guestCart.length > 0;

//   // RTK Query mutations
//   const [loginApi, { isLoading: isLoginLoading }] = useLoginMutation();
//   const [registerApi, { isLoading: isRegisterLoading }] = useRegisterMutation();
//   const [logoutApi] = useLogoutMutation();
//   const [lazyGetMe] = useLazyGetMeQuery();

//   /* ==================== IMPROVED CART LOADING WITH TOKEN VERIFICATION ==================== */
//   const ensureUserCartLoaded = useCallback(async (maxRetries = 3) => {
//     console.log('🛒 ensureUserCartLoaded - Starting cart load...');
//     console.log('🛒 ensureUserCartLoaded - Current auth state:', {
//       hasToken: !!token,
//       hasUser: !!user,
//       isAuthenticated,
//       userCartItems: userCart.length
//     });

//     // If user cart is already loaded, return immediately
//     if (userCart.length > 0) {
//       console.log('🛒 ensureUserCartLoaded - User cart already loaded:', userCart.length, 'items');
//       return true;
//     }

//     // Check if we have authentication
//     if (!token || !user) {
//       console.error('🛒 ensureUserCartLoaded - No token or user available');
//       throw new Error('Authentication required to load user cart');
//     }

//     let retries = 0;

//     while (retries < maxRetries) {
//       retries++;
//       console.log(`🛒 ensureUserCartLoaded - Attempt ${retries}/${maxRetries}`);

//       try {
//         // Wait progressively longer between retries
//         if (retries > 1) {
//           const waitTime = retries * 500; // 500ms, 1000ms, 1500ms
//           console.log(`🛒 ensureUserCartLoaded - Waiting ${waitTime}ms before retry...`);
//           await new Promise(resolve => setTimeout(resolve, waitTime));
//         }

//         console.log('🛒 ensureUserCartLoaded - Fetching user cart...');
//         const result = await dispatch(fetchCart()).unwrap();

//         console.log('🛒 ensureUserCartLoaded - Fetch successful:', result.items?.length, 'items');

//         if (result.items && result.items.length >= 0) {
//           console.log('🛒 ensureUserCartLoaded - User cart loaded successfully');
//           return true;
//         } else {
//           console.warn('🛒 ensureUserCartLoaded - Empty cart response, but successful');
//           return true; // Empty cart is still valid
//         }

//       } catch (error: any) {
//         console.error(`🛒 ensureUserCartLoaded - Attempt ${retries} failed:`, error);

//         if (retries === maxRetries) {
//           console.error('🛒 ensureUserCartLoaded - All retries failed');
//           throw new Error(`Failed to load user cart after ${maxRetries} attempts: ${error.message || 'Unknown error'}`);
//         }

//         // Check if it's an authentication error
//         if (error?.status === 401 || error?.message?.includes('auth') || error?.message?.includes('token')) {
//           console.warn('🛒 ensureUserCartLoaded - Authentication issue, trying to refresh token...');
//           try {
//             // Try to refresh user data
//             await lazyGetMe().unwrap();
//             console.log('🛒 ensureUserCartLoaded - Token refreshed successfully');
//           } catch (refreshError) {
//             console.error('🛒 ensureUserCartLoaded - Token refresh failed:', refreshError);
//             throw new Error('Authentication failed. Please log in again.');
//           }
//         }
//       }
//     }

//     throw new Error('Failed to load user cart');
//   }, [dispatch, userCart.length, token, user, isAuthenticated, lazyGetMe]);



//     /* ==================== LOGOUT ==================== */


//   // const logout = useCallback(async () => {
//   //   try {
//   //     console.log('🚪 Logging out...');
//   //     await logoutApi().unwrap();

//   //     success('Logged out successfully');
//   //     router.push('/auth/login');
//   //   } catch (error: any) {
//   //     console.error('❌ Logout failed:', error);
//   //     showError('Failed to log out. Please try again.');
//   //   }
//   // }, [logoutApi, router, success, showError]);


//   // lib/hooks/useAuth.ts - Update logout function



//   const logout = useCallback(async () => {
//   try {
//     console.log('🚪 Logout started...');

//     // Clear cart state immediately for better UX
//     dispatch(clearAllCarts());

//     await logoutApi().unwrap();

//     console.log('✅ Logout API successful');
//     success('Logged out successfully');

//     // Redirect to login page
//     router.push('/auth/login');

//   } catch (error: any) {
//     console.error('❌ Logout failed:', error);
//     // Still clear local state even if API fails
//     dispatch(clearAllCarts());
//     showError('Logged out locally (API call failed)');
//     router.push('/auth/login');
//   }
// }, [logoutApi, dispatch, router, success, showError]);

//   /* ==================== REFETCH USER ==================== */
//   const refetchUser = useCallback(async () => {
//     try {
//       console.log('🔄 Refetching user data...');
//       const result = await lazyGetMe().unwrap();
//       console.log('✅ User data refreshed:', result);
//       return result;
//     } catch (error) {
//       console.error('❌ Failed to refetch user:', error);
//       throw error;
//     }
//   }, [lazyGetMe]);




//   /* ==================== SIMPLIFIED MERGE LOGIC ==================== */
//   const handlePostAuthMerge = useCallback(async () => {
//     console.log('🔄 handlePostAuthMerge - Starting cart merge process');

//     if (!needsCartMerge) {
//       console.log('🔄 handlePostAuthMerge - No cart merge needed');
//       return { success: true, mergedCount: 0 };
//     }

//     try {
//       // Step 1: Wait for authentication to be fully settled
//       console.log('🔄 handlePostAuthMerge - Waiting for auth to settle...');
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       // Step 2: Ensure user cart is loaded
//       console.log('🔄 handlePostAuthMerge - Ensuring user cart is loaded...');
//       await ensureUserCartLoaded(3); // 3 retries

//       // Step 3: Wait a bit more for state consistency
//       console.log('🔄 handlePostAuthMerge - Final state settlement...');
//       await new Promise(resolve => setTimeout(resolve, 500));

//       // Step 4: Perform the merge
//       console.log('🔄 handlePostAuthMerge - Performing cart merge...');
//       const result = await dispatch(mergeCarts()).unwrap();

//       console.log('🔄 handlePostAuthMerge - Merge successful:', result.mergedCount, 'items merged');
//       return { success: true, mergedCount: result.mergedCount };

//     } catch (error: any) {
//       console.error('🔄 handlePostAuthMerge - Merge failed:', error);
//       return {
//         success: false,
//         error: error.message || 'Failed to merge carts',
//         mergedCount: 0
//       };
//     }
//   }, [dispatch, needsCartMerge, ensureUserCartLoaded]);
// const manualMergeCarts = useCallback(async () => {
//   try {
//     console.log('🔄 Manual cart merge requested...');

//     // Check authentication first
//     if (!token || !user) {
//       throw new Error('Please log in to merge your cart');
//     }

//     // Show loading state
//     info('Loading your cart...');

//     // Ensure user cart is loaded before merge
//     console.log('🔄 manualMergeCarts - Ensuring user cart is loaded...');
//     await ensureUserCartLoaded(5);

//     // Wait a bit to ensure state is settled
//     await new Promise(resolve => setTimeout(resolve, 500));

//     info('Merging your cart items...');

//     // Use the mergeCarts thunk directly with proper error handling
//     const result = await dispatch(mergeCarts()).unwrap();

//     console.log('🔄 manualMergeCarts - Merge successful:', result);

//     // CRITICAL: Force refresh the cart data after merge
//     console.log('🔄 manualMergeCarts - Refreshing cart data...');
//     await dispatch(fetchCart()).unwrap();

//     // Wait for state to update
//     await new Promise(resolve => setTimeout(resolve, 300));

//     if (result.mergedCount > 0) {
//       success(`Successfully merged ${result.mergedCount} item${result.mergedCount > 1 ? 's' : ''} to your cart!`);
//     } else {
//       success('Cart is already up to date!');
//     }

//     return result;
//   } catch (error: any) {
//     console.error('❌ Manual cart merge failed:', error);

//     let errorMessage = error.message || 'Failed to merge carts';

//     // Handle authentication errors specifically
//     if (errorMessage.includes('auth') || errorMessage.includes('token') || errorMessage.includes('Authentication') || errorMessage.includes('401')) {
//       errorMessage = 'Your session has expired. Please log in again.';
//       // Clear auth state and redirect to login
//       router.push('/auth/login');
//     } else if (errorMessage.includes('load')) {
//       errorMessage = 'Failed to load your cart. Please try again.';
//     }

//     showError(errorMessage);
//     throw error;
//   }
// }, [dispatch, ensureUserCartLoaded, token, user, success, showError, info, router]);

//   /* ==================== SIMPLIFIED LOGIN ==================== */




// // const login = useCallback(async (credentials: LoginData) => {
// //   try {
// //     console.log('🔐 Login started...');

// //     // Step 1: Perform login
// //     const response = await loginApi(credentials).unwrap();

// //     if (!response.success) {
// //       throw new Error(response.message);
// //     }

// //     console.log('✅ Login API successful');

// //     // Step 2: Wait for auth state to update
// //     console.log('🔄 Waiting for auth state update...');
// //     await new Promise(resolve => setTimeout(resolve, 1000));

// //     // Step 3: Manually refetch user data to ensure token is set
// //     console.log('🔄 Refetching user data...');
// //     try {
// //       await lazyGetMe().unwrap();
// //       console.log('✅ User data refetched successfully');
// //     } catch (error) {
// //       console.error('❌ Failed to refetch user after login:', error);
// //     }

// //     // Step 4: CRITICAL FIX - Always fetch cart after login, even if empty
// //     console.log('🔄 Fetching cart after login (even if empty)...');
// //     try {
// //       const cartResult = await dispatch(fetchCart()).unwrap();
// //       console.log('✅ Cart loaded successfully after login:', {
// //         itemsCount: cartResult.items?.length,
// //         isEmpty: cartResult.items?.length === 0
// //       });
// //     } catch (cartError) {
// //       console.error('❌ Cart fetch failed:', cartError);
// //       // Don't throw - empty cart is acceptable
// //     }

// //     // Step 5: Handle guest cart merge notification
// //     const currentState = store.getState() as RootState;
// //     const guestCartItems = currentState.cart.guestCart.length;

// //     if (guestCartItems > 0) {
// //       console.log('🔄 Guest cart items detected after login:', guestCartItems);
// //       info(`You have ${guestCartItems} item${guestCartItems > 1 ? 's' : ''} in your guest cart. You can merge them to your account in the cart.`);
// //     }

// //     console.log('✅ Login process completed successfully');
// //     success(response.message || 'Welcome back!');

// //     const redirectPath = pathname === '/auth/login' ? '/' : pathname;
// //     router.push(redirectPath);

// //     return response;

// //   } catch (error: any) {
// //     console.error('❌ Login error:', error);
// //     const msg = error?.data?.message || error?.message || 'Login failed';
// //     showError(msg);
// //     throw error;
// //   }
// // }, [loginApi, lazyGetMe, dispatch, router, success, showError, info, pathname]);


// // lib/hooks/useAuth.ts - Update login function
// const login = useCallback(async (credentials: LoginData) => {
//   try {
//     console.log('🔐 Login started...');

//     // Step 1: Perform login
//     const response = await loginApi(credentials).unwrap();

//     if (!response.success) {
//       throw new Error(response.message);
//     }





//     await new Promise(resolve => setTimeout(resolve, 1000));

//     // Step 3: Manually refetch user data to ensure token is set

//     try {
//       await lazyGetMe().unwrap();
//       console.log('✅ User data refetched successfully');
//     } catch (error) {
//       console.error('❌ Failed to refetch user after login:', error);
//     }

//     try {
//       const cartResult = await dispatch(fetchCart()).unwrap();

//     } catch (cartError) {
//       console.error('❌ Cart fetch failed after login:', cartError);
//       // Don't throw - let the AuthInitializer retry
//     }

//     // Step 5: Handle guest cart notification
//     const currentState = store.getState() as RootState;
//     const guestCartItems = currentState.cart.guestCart.length;

//     if (guestCartItems > 0) {
//       console.log('🔄 Guest cart items detected after login:', guestCartItems);
//       info(`You have ${guestCartItems} item${guestCartItems > 1 ? 's' : ''} in your guest cart. You can merge them to your account in the cart.`);
//     }

//     console.log('✅ Login process completed successfully');
//     success(response.message || 'Welcome back!');

//     const redirectPath = pathname === '/auth/login' ? '/' : pathname;
//     router.push(redirectPath);

//     return response;

//   } catch (error: any) {
//     console.error('❌ Login error:', error);
//     const msg = error?.data?.message || error?.message || 'Login failed';
//     showError(msg);
//     throw error;
//   }
// }, [loginApi, lazyGetMe, dispatch, router, success, showError, info, pathname]);

//   /* ==================== SIMPLIFIED REGISTER ==================== */


//   const register = useCallback(async (userData: RegisterData) => {
//     try {
//       console.log('🔐 Registration started...');

//       // Transform data for API
//       const nameParts = userData.name.trim().split(' ');
//       const firstName = nameParts[0];
//       const lastName = nameParts.slice(1).join(' ') || '';

//        const apiData = {
//       name: userData.name, // Send the full name directly
//       email: userData.email,
//       password: userData.password,
//     };


//       // Step 1: Perform registration
//       const response = await registerApi(apiData).unwrap();

//       if (!response.success) {
//         throw new Error(response.message);
//       }

//       console.log('✅ Registration API successful');

//       // Step 2: Wait for auth state to update
//       console.log('🔄 Waiting for auth state update...');
//       await new Promise(resolve => setTimeout(resolve, 800));

//       // Step 3: Manually refetch user data
//       console.log('🔄 Refetching user data...');
//       try {
//         await lazyGetMe().unwrap();
//         console.log('✅ User data refetched successfully');
//       } catch (error) {
//         console.error('❌ Failed to refetch user after registration:', error);
//       }

//       // Step 4: Don't attempt auto-merge
//       console.log('🔄 Skipping automatic cart merge - user will merge manually');

//       if (guestCart.length > 0) {
//         info(`You have ${guestCart.length} item${guestCart.length > 1 ? 's' : ''} in your guest cart. You can merge them to your account in the cart.`);
//       }

//       console.log('✅ Registration process completed successfully');
//       success('Account created! Welcome!');

//       router.push('/');
//       return response;

//     } catch (error: any) {
//       console.error('❌ Registration error:', error);
//       const msg = error?.data?.message || error?.message || 'Registration failed';
//       showError(msg);
//       throw error;
//     }
//   }, [registerApi, lazyGetMe, router, success, showError, info, guestCart.length]);

//   /* ==================== IMPROVED MANUAL MERGE ==================== */


//   return {
//     // State from Redux store
//     user,
//     isAuthenticated,
//     isLoading: authLoading || isLoginLoading || isRegisterLoading,

//     // Actions
//     login,
//     register,
//     logout,
//     refetchUser,
//     manualMergeCarts,

//     // Merge status
//     needsCartMerge,
//   };
// };

// lib/hooks/useAuth.ts
'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useLazyGetMeQuery,
} from '@/lib/services/authApi';
import { mergeCarts, fetchCart, clearAllCarts } from '@/lib/features/carts/cartsSlice';
import { mergeWishlists, fetchWishlist, clearAllWishlists } from '@/lib/features/wishlist/wishlistSlice';
import { useToast } from './useToast';
import type { LoginData, RegisterData } from '@/types';
import { RootState } from '@/lib/store';
import { useAppDispatch, useAppSelector } from './redux';
import { store } from '@/lib/store';

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { success, error: showError, info } = useToast();

  // Get auth state from Redux store
  const { user, isAuthenticated, token, isLoading: authLoading } = useAppSelector((state: RootState) => state.auth);

  // Get cart and wishlist state
  const guestCart = useAppSelector((state: RootState) => state.cart.guestCart);
  const guestWishlist = useAppSelector((state: RootState) => state.wishlist.guestWishlist);
  const needsCartMerge = guestCart.length > 0;
  const needsWishlistMerge = guestWishlist.length > 0;

  // RTK Query mutations
  const [loginApi, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerApi, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [logoutApi] = useLogoutMutation();
  const [lazyGetMe] = useLazyGetMeQuery();

  /* ==================== CART LOADING ==================== */
  const ensureUserCartLoaded = useCallback(async (maxRetries = 3) => {
    console.log('🛒 ensureUserCartLoaded - Starting cart load...');

    if (!token || !user) {
      console.error('🛒 ensureUserCartLoaded - No token or user available');
      throw new Error('Authentication required to load user cart');
    }

    let retries = 0;
    while (retries < maxRetries) {
      retries++;
      console.log(`🛒 ensureUserCartLoaded - Attempt ${retries}/${maxRetries}`);

      try {
        if (retries > 1) {
          const waitTime = retries * 500;
          console.log(`🛒 ensureUserCartLoaded - Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        console.log('🛒 ensureUserCartLoaded - Fetching user cart...');
        const result = await dispatch(fetchCart()).unwrap();
        console.log('🛒 ensureUserCartLoaded - Fetch successful:', result.items?.length, 'items');
        return true;

      } catch (error: any) {
        console.error(`🛒 ensureUserCartLoaded - Attempt ${retries} failed:`, error);

        if (retries === maxRetries) {
          console.error('🛒 ensureUserCartLoaded - All retries failed');
          throw new Error(`Failed to load user cart after ${maxRetries} attempts: ${error.message || 'Unknown error'}`);
        }

        // Check if it's an authentication error
        if (error?.status === 401 || error?.message?.includes('auth') || error?.message?.includes('token')) {
          console.warn('🛒 ensureUserCartLoaded - Authentication issue, trying to refresh token...');
          try {
            await lazyGetMe().unwrap();
            console.log('🛒 ensureUserCartLoaded - Token refreshed successfully');
          } catch (refreshError) {
            console.error('🛒 ensureUserCartLoaded - Token refresh failed:', refreshError);
            throw new Error('Authentication failed. Please log in again.');
          }
        }
      }
    }
    throw new Error('Failed to load user cart');
  }, [dispatch, user, token, lazyGetMe]);

  /* ==================== WISHLIST LOADING ==================== */
  const ensureUserWishlistLoaded = useCallback(async (maxRetries = 3) => {
    console.log('💝 ensureUserWishlistLoaded - Starting wishlist load...');

    if (!token || !user) {
      console.error('💝 ensureUserWishlistLoaded - No token or user available');
      throw new Error('Authentication required to load user wishlist');
    }

    let retries = 0;
    while (retries < maxRetries) {
      retries++;
      console.log(`💝 ensureUserWishlistLoaded - Attempt ${retries}/${maxRetries}`);

      try {
        if (retries > 1) {
          const waitTime = retries * 500;
          console.log(`💝 ensureUserWishlistLoaded - Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        console.log('💝 ensureUserWishlistLoaded - Fetching user wishlist...');
        const result = await dispatch(fetchWishlist()).unwrap();
        console.log('💝 ensureUserWishlistLoaded - Fetch successful:', result.items?.length, 'items');
        return true;

      } catch (error: any) {
        console.error(`💝 ensureUserWishlistLoaded - Attempt ${retries} failed:`, error);

        if (retries === maxRetries) {
          console.error('💝 ensureUserWishlistLoaded - All retries failed');
          throw new Error(`Failed to load user wishlist after ${maxRetries} attempts: ${error.message || 'Unknown error'}`);
        }

        if (error?.status === 401 || error?.message?.includes('auth') || error?.message?.includes('token')) {
          console.warn('💝 ensureUserWishlistLoaded - Authentication issue, trying to refresh token...');
          try {
            await lazyGetMe().unwrap();
            console.log('💝 ensureUserWishlistLoaded - Token refreshed successfully');
          } catch (refreshError) {
            console.error('💝 ensureUserWishlistLoaded - Token refresh failed:', refreshError);
            throw new Error('Authentication failed. Please log in again.');
          }
        }
      }
    }
    throw new Error('Failed to load user wishlist');
  }, [dispatch, user, token, lazyGetMe]);

  /* ==================== CART MERGE ==================== */
  const handlePostAuthCartMerge = useCallback(async () => {
    console.log('🔄 handlePostAuthCartMerge - Starting cart merge process');

    if (!needsCartMerge) {
      console.log('🔄 handlePostAuthCartMerge - No cart merge needed');
      return { success: true, mergedCount: 0 };
    }

    try {
      // Step 1: Wait for authentication to be fully settled
      console.log('🔄 handlePostAuthCartMerge - Waiting for auth to settle...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Ensure user cart is loaded
      console.log('🔄 handlePostAuthCartMerge - Ensuring user cart is loaded...');
      await ensureUserCartLoaded(3);

      // Step 3: Wait a bit more for state consistency
      console.log('🔄 handlePostAuthCartMerge - Final state settlement...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Perform the merge
      console.log('🔄 handlePostAuthCartMerge - Performing cart merge...');
      const result = await dispatch(mergeCarts()).unwrap();

      console.log('🔄 handlePostAuthCartMerge - Merge successful:', result.mergedCount, 'items merged');
      return { success: true, mergedCount: result.mergedCount };

    } catch (error: any) {
      console.error('🔄 handlePostAuthCartMerge - Merge failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to merge carts',
        mergedCount: 0
      };
    }
  }, [dispatch, needsCartMerge, ensureUserCartLoaded]);

  /* ==================== WISHLIST MERGE ==================== */
  const handlePostAuthWishlistMerge = useCallback(async () => {
    console.log('💝 handlePostAuthWishlistMerge - Starting wishlist merge process');

    if (!needsWishlistMerge) {
      console.log('💝 handlePostAuthWishlistMerge - No wishlist merge needed');
      return { success: true, mergedCount: 0 };
    }

    try {
      // Step 1: Wait for authentication to be fully settled
      console.log('💝 handlePostAuthWishlistMerge - Waiting for auth to settle...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Ensure user wishlist is loaded
      console.log('💝 handlePostAuthWishlistMerge - Ensuring user wishlist is loaded...');
      await ensureUserWishlistLoaded(3);

      // Step 3: Wait a bit more for state consistency
      console.log('💝 handlePostAuthWishlistMerge - Final state settlement...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Perform the merge
      console.log('💝 handlePostAuthWishlistMerge - Performing wishlist merge...');
      const result = await dispatch(mergeWishlists()).unwrap();

      console.log('💝 handlePostAuthWishlistMerge - Merge successful:', result.mergedCount, 'items merged');
      return { success: true, mergedCount: result.mergedCount };

    } catch (error: any) {
      console.error('💝 handlePostAuthWishlistMerge - Merge failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to merge wishlists',
        mergedCount: 0
      };
    }
  }, [dispatch, needsWishlistMerge, ensureUserWishlistLoaded]);

  /* ==================== LOGOUT ==================== */
  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');

      // Clear cart and wishlist state immediately for better UX
      dispatch(clearAllCarts());
      dispatch(clearAllWishlists());

      await logoutApi().unwrap();

      success('Logged out successfully');
      router.push('/auth/login');
    } catch (error: any) {
      console.error('❌ Logout failed:', error);
      // Still clear local state even if API fails
      dispatch(clearAllCarts());
      dispatch(clearAllWishlists());
      showError('Logged out locally (API call failed)');
      router.push('/auth/login');
    }
  }, [logoutApi, dispatch, router, success, showError]);

  /* ==================== REFETCH USER ==================== */
  const refetchUser = useCallback(async () => {
    try {
      console.log('🔄 Refetching user data...');
      const result = await lazyGetMe().unwrap();
      console.log('✅ User data refreshed:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to refetch user:', error);
      throw error;
    }
  }, [lazyGetMe]);

  /* ==================== MANUAL CART MERGE ==================== */
  const manualMergeCarts = useCallback(async () => {
    try {
      console.log('🔄 Manual cart merge requested...');

      // Check authentication first
      if (!token || !user) {
        throw new Error('Please log in to merge your cart');
      }

      // Show loading state
      info('Loading your cart...');

      // Ensure user cart is loaded before merge
      console.log('🔄 manualMergeCarts - Ensuring user cart is loaded...');
      await ensureUserCartLoaded(5);

      // Wait a bit to ensure state is settled
      await new Promise(resolve => setTimeout(resolve, 500));

      info('Merging your cart items...');

      const result = await handlePostAuthCartMerge();

      if (result.success) {
        if (result.mergedCount > 0) {
          success(`Successfully merged ${result.mergedCount} item${result.mergedCount > 1 ? 's' : ''} to your cart!`);
        } else {
          success('Cart is already up to date!');
        }
        return result;
      } else {
        throw new Error(result.error || 'Failed to merge carts');
      }
    } catch (error: any) {
      console.error('❌ Manual cart merge failed:', error);

      let errorMessage = error.message || 'Failed to merge carts';

      // Provide more user-friendly error messages
      if (errorMessage.includes('auth') || errorMessage.includes('token') || errorMessage.includes('Authentication')) {
        errorMessage = 'Please log in again to merge your cart';
      } else if (errorMessage.includes('load')) {
        errorMessage = 'Failed to load your cart. Please try again.';
      }

      showError(errorMessage);
      throw error;
    }
  }, [handlePostAuthCartMerge, ensureUserCartLoaded, token, user, success, showError, info]);

  /* ==================== MANUAL WISHLIST MERGE ==================== */
  const manualMergeWishlists = useCallback(async () => {
    try {
      console.log('💝 Manual wishlist merge requested...');

      // Check authentication first
      if (!token || !user) {
        throw new Error('Please log in to merge your wishlist');
      }

      // Show loading state
      info('Loading your wishlist...');

      // Ensure user wishlist is loaded before merge
      console.log('💝 manualMergeWishlists - Ensuring user wishlist is loaded...');
      await ensureUserWishlistLoaded(5);

      // Wait a bit to ensure state is settled
      await new Promise(resolve => setTimeout(resolve, 500));

      info('Merging your wishlist items...');

      const result = await handlePostAuthWishlistMerge();

      if (result.success) {
        if (result.mergedCount > 0) {
          success(`Successfully merged ${result.mergedCount} item${result.mergedCount > 1 ? 's' : ''} to your wishlist!`);
        } else {
          success('Wishlist is already up to date!');
        }
        return result;
      } else {
        throw new Error(result.error || 'Failed to merge wishlists');
      }
    } catch (error: any) {
      console.error('❌ Manual wishlist merge failed:', error);

      let errorMessage = error.message || 'Failed to merge wishlists';

      if (errorMessage.includes('auth') || errorMessage.includes('token') || errorMessage.includes('Authentication')) {
        errorMessage = 'Please log in again to merge your wishlist';
      } else if (errorMessage.includes('load')) {
        errorMessage = 'Failed to load your wishlist. Please try again.';
      }

      showError(errorMessage);
      throw error;
    }
  }, [handlePostAuthWishlistMerge, ensureUserWishlistLoaded, token, user, success, showError, info]);

  /* ==================== LOGIN ==================== */
  const login = useCallback(async (credentials: LoginData) => {
    try {
      console.log('🔐 Login started...');

      // Step 1: Perform login
      const response = await loginApi(credentials).unwrap();

      if (!response.success) {
        throw new Error(response.message);
      }

      console.log('✅ Login API successful');

      // Step 2: Wait for auth state to update
      console.log('🔄 Waiting for auth state update...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Manually refetch user data to ensure token is set
      console.log('🔄 Refetching user data...');
      try {
        await lazyGetMe().unwrap();
        console.log('✅ User data refetched successfully');
      } catch (error) {
        console.error('❌ Failed to refetch user after login:', error);
      }

      // Step 4: Force cart fetch immediately after login
      console.log('🔄 Force fetching cart after login...');
      try {
        const cartResult = await dispatch(fetchCart()).unwrap();
        console.log('✅ Cart loaded successfully after login:', {
          itemsCount: cartResult.items?.length
        });
      } catch (cartError) {
        console.error('❌ Cart fetch failed after login:', cartError);
        // Don't throw - let the AuthInitializer retry
      }

      // Step 5: Force wishlist fetch immediately after login
      console.log('💝 Force fetching wishlist after login...');
      try {
        const wishlistResult = await dispatch(fetchWishlist()).unwrap();
        console.log('✅ Wishlist loaded successfully after login:', {
          itemsCount: wishlistResult.items?.length
        });
      } catch (wishlistError) {
        console.error('❌ Wishlist fetch failed after login:', wishlistError);
        // Don't throw - let the WishlistInitializer retry
      }

      // Step 6: Handle guest cart and wishlist notifications
      const currentState = store.getState() as RootState;
      const guestCartItems = currentState.cart.guestCart.length;
      const guestWishlistItems = currentState.wishlist.guestWishlist.length;

      if (guestCartItems > 0) {
        console.log('🔄 Guest cart items detected after login:', guestCartItems);
        info(`You have ${guestCartItems} item${guestCartItems > 1 ? 's' : ''} in your guest cart. You can merge them to your account in the cart.`);

        // Auto-merge cart after delay
        setTimeout(async () => {
          try {
            console.log('🔄 Attempting auto-merge of guest cart...');
            await handlePostAuthCartMerge();
          } catch (mergeError) {
            console.error('🔄 Auto-merge failed, user can merge manually:', mergeError);
          }
        }, 3000);
      }

      if (guestWishlistItems > 0) {
        console.log('💝 Guest wishlist items detected after login:', guestWishlistItems);
        info(`You have ${guestWishlistItems} item${guestWishlistItems > 1 ? 's' : ''} in your guest wishlist. They will be merged with your account.`);

        // Auto-merge wishlist after delay
        setTimeout(async () => {
          try {
            console.log('💝 Attempting auto-merge of guest wishlist...');
            await handlePostAuthWishlistMerge();
          } catch (mergeError) {
            console.error('💝 Auto-merge failed, user can merge manually:', mergeError);
          }
        }, 4000);
      }

      console.log('✅ Login process completed successfully');
      success(response.message || 'Welcome back!');

      // Redirect
      const redirectPath = pathname === '/auth/login' ? '/' : pathname;
      router.push(redirectPath);

      return response;

    } catch (error: any) {
      console.error('❌ Login error:', error);
      const msg = error?.data?.message || error?.message || 'Login failed';
      showError(msg);
      throw error;
    }
  }, [loginApi, lazyGetMe, dispatch, router, success, showError, info, pathname, handlePostAuthCartMerge, handlePostAuthWishlistMerge]);

  /* ==================== REGISTER ==================== */
  const register = useCallback(async (userData: RegisterData) => {
    try {
      console.log('🔐 Registration started...');

      // Transform data for API
      const nameParts = userData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const apiData = {
        firstName,
        lastName,
        email: userData.email,
        password: userData.password,
      };

      // Step 1: Perform registration
      const response = await registerApi(apiData).unwrap();

      if (!response.success) {
        throw new Error(response.message);
      }

      console.log('✅ Registration API successful');

      // Step 2: Wait for auth state to update
      console.log('🔄 Waiting for auth state update...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: Manually refetch user data
      console.log('🔄 Refetching user data...');
      try {
        await lazyGetMe().unwrap();
        console.log('✅ User data refetched successfully');
      } catch (error) {
        console.error('❌ Failed to refetch user after registration:', error);
      }

      // Step 4: Fetch cart and wishlist after registration
      console.log('🔄 Fetching cart after registration...');
      try {
        await dispatch(fetchCart()).unwrap();
        console.log('✅ Cart loaded successfully after registration');
      } catch (cartError) {
        console.error('❌ Cart fetch failed after registration:', cartError);
      }

      console.log('💝 Fetching wishlist after registration...');
      try {
        await dispatch(fetchWishlist()).unwrap();
        console.log('✅ Wishlist loaded successfully after registration');
      } catch (wishlistError) {
        console.error('❌ Wishlist fetch failed after registration:', wishlistError);
      }

      // Step 5: Handle guest cart and wishlist notifications
      const currentState = store.getState() as RootState;
      const guestCartItems = currentState.cart.guestCart.length;
      const guestWishlistItems = currentState.wishlist.guestWishlist.length;

      if (guestCartItems > 0) {
        console.log('🔄 Guest cart items detected after registration:', guestCartItems);
        info(`You have ${guestCartItems} item${guestCartItems > 1 ? 's' : ''} in your guest cart. You can merge them to your account in the cart.`);
      }

      if (guestWishlistItems > 0) {
        console.log('💝 Guest wishlist items detected after registration:', guestWishlistItems);
        info(`You have ${guestWishlistItems} item${guestWishlistItems > 1 ? 's' : ''} in your guest wishlist. You can merge them to your account in the wishlist.`);
      }

      console.log('✅ Registration process completed successfully');
      success('Account created! Welcome!');

      router.push('/');
      return response;

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      const msg = error?.data?.message || error?.message || 'Registration failed';
      showError(msg);
      throw error;
    }
  }, [registerApi, lazyGetMe, dispatch, router, success, showError, info]);

  return {
    // State from Redux store
    user,
    isAuthenticated,
    isLoading: authLoading || isLoginLoading || isRegisterLoading,

    // Actions
    login,
    register,
    logout,
    refetchUser,
    manualMergeCarts,
    manualMergeWishlists,

    // Merge status
    needsCartMerge,
    needsWishlistMerge,
  };
};
