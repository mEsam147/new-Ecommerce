// // lib/features/auth/authSlice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { authApi } from '@/lib/services/authApi';
// import { RootState } from '@/lib/store';
// import { User } from '@/types';

// interface AuthState {
//   user: User | null;
//   token: string | null;
//   refreshToken: string | null;
//   isLoading: boolean;
//   error: string | null;
//   isAuthenticated: boolean;
// }

// const initialState: AuthState = {
//   user: null,
//   token: null,
//   refreshToken: null,
//   isLoading: false,
//   error: null,
//   isAuthenticated: false,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     updateUser: (state, action: PayloadAction<Partial<User>>) => {
//       if (state.user) {
//         state.user = { ...state.user, ...action.payload };
//       }
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     forceLogout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.refreshToken = null;
//       state.isAuthenticated = false;
//       state.error = null;
//     },
//     setLoading: (state, action: PayloadAction<boolean>) => {
//       state.isLoading = action.payload;
//     },
//     // Add this action to set tokens
//     setTokens: (state, action: PayloadAction<{ token: string; refreshToken?: string }>) => {
//       state.token = action.payload.token;
//       if (action.payload.refreshToken) {
//         state.refreshToken = action.payload.refreshToken;
//       }
//       state.isAuthenticated = true;
//     },
//   },
//   extraReducers: (builder) => {
//     const endpoints = authApi.endpoints;

//     // Login
//     if (endpoints.login) {
//       builder
//         .addMatcher(endpoints.login.matchPending, (state) => {
//           state.isLoading = true;
//           state.error = null;
//         })
//         .addMatcher(endpoints.login.matchFulfilled, (state, action) => {
//        state.isLoading = false;
//   state.user = action.payload.data?.user || null;
//   state.token = action.payload.data?.token || null;
//   state.refreshToken = action.payload.data?.refreshToken || null;
//   state.isAuthenticated = true;
//   state.error = null;

//   console.log('🔐 Auth success - user authenticated');

//         })
//         .addMatcher(endpoints.login.matchRejected, (state, action) => {
//           state.isLoading = false;
//           state.error = action.error?.message || 'Login failed';
//           state.isAuthenticated = false;
//           state.user = null;
//           state.token = null;
//           state.refreshToken = null;
//         });
//     }

//     // Register
//     if (endpoints.register) {
//       builder
//         .addMatcher(endpoints.register.matchFulfilled, (state, action) => {
//           state.user = action.payload.data?.user || null;
//           // FIX: Make sure tokens are set
//           state.token = action.payload.data?.token || null;
//           state.refreshToken = action.payload.data?.refreshToken || null;
//           state.isAuthenticated = true;
//           state.error = null;
//         })
//         .addMatcher(endpoints.register.matchRejected, (state, action) => {
//           state.error = action.error?.message || 'Registration failed';
//         });
//     }

//     // Get Me - Make sure it sets isAuthenticated properly
//     if (endpoints.getMe) {
//       builder
//         .addMatcher(endpoints.getMe.matchPending, (state) => {
//           state.isLoading = true;
//         })
//         .addMatcher(endpoints.getMe.matchFulfilled, (state, action) => {
//           state.isLoading = false;
//           state.user = action.payload.data?.user || null;
//           // If we get user data, consider user authenticated
//           state.isAuthenticated = !!action.payload.data?.user;
//           state.error = null;
//         })
//         .addMatcher(endpoints.getMe.matchRejected, (state) => {
//           state.isLoading = false;
//           state.user = null;
//           state.isAuthenticated = false;
//           state.error = null;
//         });
//     }

//     // Logout
//     if (endpoints.logout) {
//       builder
//         .addMatcher(endpoints.logout.matchFulfilled, (state) => {
//           state.user = null;
//           state.token = null;
//           state.refreshToken = null;
//           state.isAuthenticated = false;
//           state.error = null;
//         })
//         .addMatcher(endpoints.logout.matchRejected, (state) => {
//           state.user = null;
//           state.token = null;
//           state.refreshToken = null;
//           state.isAuthenticated = false;
//           state.error = null;
//         });
//     }
//   },
// });

// export const { updateUser, clearError, forceLogout, setLoading, setTokens } = authSlice.actions;

// // Selectors
// export const selectCurrentUser = (state: RootState) => state.auth.user;
// export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
// export const selectAuthToken = (state: RootState) => state.auth.token;
// export const selectUserRole = (state: RootState) => state.auth.user?.role;
// export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
// export const selectAuthError = (state: RootState) => state.auth.error;

// export default authSlice.reducer;


// lib/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/lib/services/authApi';
import { RootState } from '@/lib/store';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Get initial state from localStorage if available (for persistence)
const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        console.log('🔐 Rehydrating auth state from storage:', { hasToken: !!token, hasUser: !!user });
        return {
          user,
          token,
          refreshToken: localStorage.getItem('refreshToken'),
          isLoading: false,
          error: null,
          isAuthenticated: true, // CRITICAL: Set to true when we have token
        };
      }
    } catch (error) {
      console.error('🔐 Error rehydrating auth state:', error);
    }
  }

  return {
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTokens: (state, action: PayloadAction<{ token: string; refreshToken?: string }>) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true; // CRITICAL: Set authenticated

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      }
    },
    // Add this to sync auth state on app start
    syncAuthState: (state) => {
      if (state.token && state.user) {
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    const endpoints = authApi.endpoints;

    // Login
    if (endpoints.login) {
      builder
        .addMatcher(endpoints.login.matchPending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addMatcher(endpoints.login.matchFulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.data?.user || null;
          state.token = action.payload.data?.token || null;
          state.refreshToken = action.payload.data?.refreshToken || null;
          state.isAuthenticated = true; // CRITICAL: Set to true
          state.error = null;

          // Save to localStorage
          if (typeof window !== 'undefined') {
            if (action.payload.data?.token) {
              localStorage.setItem('token', action.payload.data.token);
            }
            if (action.payload.data?.refreshToken) {
              localStorage.setItem('refreshToken', action.payload.data.refreshToken);
            }
            if (action.payload.data?.user) {
              localStorage.setItem('user', JSON.stringify(action.payload.data.user));
            }
          }

          console.log('🔐 Login success - user authenticated:', {
            hasUser: !!state.user,
            hasToken: !!state.token,
            isAuthenticated: state.isAuthenticated
          });
        })
        .addMatcher(endpoints.login.matchRejected, (state, action) => {
          state.isLoading = false;
          state.error = action.error?.message || 'Login failed';
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.refreshToken = null;

          // Clear localStorage on login failure
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        });
    }

    // Register
    if (endpoints.register) {
      builder
        .addMatcher(endpoints.register.matchFulfilled, (state, action) => {
          state.user = action.payload.data?.user || null;
          state.token = action.payload.data?.token || null;
          state.refreshToken = action.payload.data?.refreshToken || null;
          state.isAuthenticated = true; // CRITICAL: Set to true
          state.error = null;

          // Save to localStorage
          if (typeof window !== 'undefined') {
            if (action.payload.data?.token) {
              localStorage.setItem('token', action.payload.data.token);
            }
            if (action.payload.data?.refreshToken) {
              localStorage.setItem('refreshToken', action.payload.data.refreshToken);
            }
            if (action.payload.data?.user) {
              localStorage.setItem('user', JSON.stringify(action.payload.data.user));
            }
          }

          console.log('🔐 Register success - user authenticated:', {
            hasUser: !!state.user,
            hasToken: !!state.token,
            isAuthenticated: state.isAuthenticated
          });
        })
        .addMatcher(endpoints.register.matchRejected, (state, action) => {
          state.error = action.error?.message || 'Registration failed';
          state.isAuthenticated = false;
        });
    }

    // Get Me - Make sure it sets isAuthenticated properly
    if (endpoints.getMe) {
      builder
        .addMatcher(endpoints.getMe.matchPending, (state) => {
          state.isLoading = true;
        })
        .addMatcher(endpoints.getMe.matchFulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.data?.user || null;
          // If we get user data, consider user authenticated
          state.isAuthenticated = !!action.payload.data?.user;
          state.error = null;

          // Update localStorage
          if (typeof window !== 'undefined' && action.payload.data?.user) {
            localStorage.setItem('user', JSON.stringify(action.payload.data.user));
          }

          console.log('🔐 GetMe success - user:', {
            hasUser: !!state.user,
            isAuthenticated: state.isAuthenticated
          });
        })
        .addMatcher(endpoints.getMe.matchRejected, (state) => {
          state.isLoading = false;
          state.user = null;
          state.isAuthenticated = false;
          state.error = null;

          // Clear localStorage on auth failure
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
          }
        });
    }

    // Logout
    if (endpoints.logout) {
      builder
        .addMatcher(endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
  state.token = null;
  state.refreshToken = null;
  state.isAuthenticated = false;
  state.error = null;
  state.isLoading = false;

          // Clear localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        })
        .addMatcher(endpoints.logout.matchRejected, (state) => {
         console.log('🔐 Auth slice - Logout rejected, still clearing state');
  state.user = null;
  state.token = null;
  state.refreshToken = null;
  state.isAuthenticated = false;
  state.error = null;
  state.isLoading = false;

          // Clear localStorage even on logout error
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        });
    }
  },
});

export const { updateUser, clearError, forceLogout, setLoading, setTokens, syncAuthState } = authSlice.actions;

// Selectors - FIX: Add proper checks
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => {
  const isAuth = state.auth.isAuthenticated && state.auth.token && state.auth.user;
  console.log('🔐 selectIsAuthenticated:', {
    isAuthenticated: state.auth.isAuthenticated,
    hasToken: !!state.auth.token,
    hasUser: !!state.auth.user,
    final: isAuth
  });
  return isAuth;
};
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectUserRole = (state: RootState) => state.auth.user?.role;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
