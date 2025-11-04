
// // import { configureStore, type Reducer } from '@reduxjs/toolkit';
// // import {
// //   persistStore,
// //   persistReducer,
// //   FLUSH,
// //   REHYDRATE,
// //   PAUSE,
// //   PERSIST,
// //   PURGE,
// //   REGISTER,
// // } from 'redux-persist';
// // import storage from 'redux-persist/lib/storage';
// // import { setupListeners } from '@reduxjs/toolkit/query';

// // // Slices
// // import authSlice from './features/auth/authSlice';
// // import cartSlice from './features/carts/cartsSlice';
// // import wishlistSlice from './features/wishlist/wishlistSlice';
// // import uiSlice from './features/ui/uiSlice';

// // // Import the single baseApi that contains all injected endpoints
// // import { baseApi } from './services/baseApi';

// // // Persist configs
// // const authPersistConfig = {
// //   key: 'auth',
// //   storage,
// //   whitelist: ['user', 'token', 'refreshToken','isAuthenticated'],
// // };

// // const cartPersistConfig = {
// //   key: 'cart',
// //   storage,
// //   whitelist: ['guestCart', 'appliedCoupon'],
// // };

// // const wishlistPersistConfig = {
// //   key: 'wishlist',
// //   storage,
// //   whitelist: ['guestWishlist'],
// // };

// // const uiPersistConfig = {
// //   key: 'ui',
// //   storage,
// //   whitelist: ['sidebarOpen', 'mobileMenuOpen'],
// // };

// // export const makeStore = () => {
// //   const store = configureStore({
// //     reducer: {
// //       // Persisted slices
// //       auth: persistReducer(authPersistConfig, authSlice) as unknown as Reducer,
// //       cart: persistReducer(cartPersistConfig, cartSlice) as unknown as Reducer,
// //       wishlist: persistReducer(wishlistPersistConfig, wishlistSlice) as unknown as Reducer,
// //       ui: persistReducer(uiPersistConfig, uiSlice) as unknown as Reducer,

// //       // Single API reducer that contains all injected endpoints
// //       [baseApi.reducerPath]: baseApi.reducer,
// //     },
// //     middleware: (getDefaultMiddleware) =>
// //       getDefaultMiddleware({
// //         serializableCheck: {
// //           ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
// //         },
// //       }).concat(baseApi.middleware),
// //   });

// //   setupListeners(store.dispatch);
// //   return store;
// // };

// // export const store = makeStore();
// // export const persistor = persistStore(store);

// // export type AppStore = ReturnType<typeof makeStore>;
// // export type RootState = ReturnType<AppStore['getState']>;
// // export type AppDispatch = AppStore['dispatch'];


// // lib/store.ts
// import { configureStore, type Reducer } from '@reduxjs/toolkit';
// import {
//   persistStore,
//   persistReducer,
//   FLUSH,
//   REHYDRATE,
//   PAUSE,
//   PERSIST,
//   PURGE,
//   REGISTER,
// } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import { setupListeners } from '@reduxjs/toolkit/query';

// // Slices
// import authSlice from './features/auth/authSlice';
// import cartSlice from './features/carts/cartsSlice';
// import couponSlice from './features/coupon/couponSlice'; // Add this
// import wishlistSlice from './features/wishlist/wishlistSlice';
// import uiSlice from './features/ui/uiSlice';

// // Import the single baseApi that contains all injected endpoints
// import { baseApi } from './services/baseApi';

// // Persist configs
// const authPersistConfig = {
//   key: 'auth',
//   storage,
//   whitelist: ['user', 'token', 'refreshToken','isAuthenticated'],
// };

// const cartPersistConfig = {
//   key: 'cart',
//   storage,
//   whitelist: ['guestCart'], // Remove appliedCoupon from here
// };

// const couponPersistConfig = {
//   key: 'coupon',
//   storage,
//   whitelist: ['appliedCoupon'], // Add coupon persist config
// };

// const wishlistPersistConfig = {
//   key: 'wishlist',
//   storage,
//   whitelist: ['guestWishlist'],
// };

// const uiPersistConfig = {
//   key: 'ui',
//   storage,
//   whitelist: ['sidebarOpen', 'mobileMenuOpen'],
// };

// export const makeStore = () => {
//   const store = configureStore({
//     reducer: {
//       // Persisted slices
//       auth: persistReducer(authPersistConfig, authSlice) as unknown as Reducer,
//       cart: persistReducer(cartPersistConfig, cartSlice) as unknown as Reducer,
//       coupon: persistReducer(couponPersistConfig, couponSlice) as unknown as Reducer, // Add this
//       wishlist: persistReducer(wishlistPersistConfig, wishlistSlice) as unknown as Reducer,
//       ui: persistReducer(uiPersistConfig, uiSlice) as unknown as Reducer,

//       // Single API reducer that contains all injected endpoints
//       [baseApi.reducerPath]: baseApi.reducer,
//     },
//     middleware: (getDefaultMiddleware) =>
//       getDefaultMiddleware({
//         serializableCheck: {
//           ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//         },
//       }).concat(baseApi.middleware),
//   });

//   setupListeners(store.dispatch);
//   return store;
// };

// export const store = makeStore();
// export const persistor = persistStore(store);

// export type AppStore = ReturnType<typeof makeStore>;
// export type RootState = ReturnType<AppStore['getState']>;
// export type AppDispatch = AppStore['dispatch'];

// lib/store.ts
import { configureStore, type Reducer } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { setupListeners } from '@reduxjs/toolkit/query';

// Slices
import authSlice from './features/auth/authSlice';
import cartSlice from './features/carts/cartsSlice';
import couponSlice from './features/coupon/couponSlice';
import wishlistSlice from './features/wishlist/wishlistSlice';
import uiSlice from './features/ui/uiSlice';

// APIs
import { baseApi } from './services/baseApi';
import { couponsApi } from './services/couponsApi'; // Import couponsApi

// Persist configs
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'refreshToken','isAuthenticated'],
};

const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['guestCart'],
};

const couponPersistConfig = {
  key: 'coupon',
  storage,
  whitelist: ['appliedCoupon'],
};

const wishlistPersistConfig = {
  key: 'wishlist',
  storage,
  whitelist: ['guestWishlist'],
};

const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['sidebarOpen', 'mobileMenuOpen'],
};

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      // Persisted slices
      auth: persistReducer(authPersistConfig, authSlice) as unknown as Reducer,
      cart: persistReducer(cartPersistConfig, cartSlice) as unknown as Reducer,
      coupon: persistReducer(couponPersistConfig, couponSlice) as unknown as Reducer,
      wishlist: persistReducer(wishlistPersistConfig, wishlistSlice) as unknown as Reducer,
      ui: persistReducer(uiPersistConfig, uiSlice) as unknown as Reducer,

      // APIs - Add both APIs
      [baseApi.reducerPath]: baseApi.reducer,
      [couponsApi.reducerPath]: couponsApi.reducer, // Add couponsApi
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(
        baseApi.middleware,
        couponsApi.middleware // Add couponsApi middleware
      ),
  });

  setupListeners(store.dispatch);
  return store;
};

export const store = makeStore();
export const persistor = persistStore(store);

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
