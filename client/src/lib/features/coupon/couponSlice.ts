// lib/features/coupon/couponSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import { couponsApi, Coupon, ValidateCouponResponse } from '@/lib/services/couponsApi';

interface CouponState {
  appliedCoupon: {
    code: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed' | 'free_shipping';
    couponData?: Coupon;
  } | null;
  validationLoading: boolean;
  validationError: string | null;
  availableCoupons: Coupon[];
  loading: boolean;
}

const initialState: CouponState = {
  appliedCoupon: null,
  validationLoading: false,
  validationError: null,
  availableCoupons: [],
  loading: false,
};

// Validate coupon async thunk - IMPROVED VERSION
export const validateCoupon = createAsyncThunk(
  'coupon/validateCoupon',
  async (payload: { code: string; cartAmount: number; products?: any[] }, { dispatch, rejectWithValue }) => {
    try {
      console.log('🎫 validateCoupon - Validating coupon:', payload.code);

      // Use the mutation directly from the API
      const result = await dispatch(
        couponsApi.endpoints.validateCoupon.initiate(payload)
      ).unwrap();

      console.log('🎫 validateCoupon - API response:', result);

      if (result.success && result.data) {
        console.log('🎫 validateCoupon - Validation successful:', result.data.coupon.code);
        return result;
      } else {
        throw new Error(result.message || 'Invalid coupon code');
      }
    } catch (error: any) {
      console.error('🎫 validateCoupon - Error:', error);

      // Handle different error formats
      let errorMessage = 'Invalid coupon code';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch available coupons - IMPROVED VERSION
export const fetchAvailableCoupons = createAsyncThunk(
  'coupon/fetchAvailableCoupons',
  async (payload: { cartAmount?: number; cartItems?: any[] } = {}, { dispatch, rejectWithValue }) => {
    try {
      console.log('🎫 fetchAvailableCoupons - Fetching available coupons');

      const result = await dispatch(
        couponsApi.endpoints.getAvailableCoupons.initiate(payload)
      ).unwrap();

      console.log('🎫 fetchAvailableCoupons - Success:', result.length, 'coupons');
      return result;

    } catch (error: any) {
      console.error('🎫 fetchAvailableCoupons - Failed:', error);

      let errorMessage = 'Failed to fetch coupons';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    // Apply coupon directly (without validation)
    applyCouponDirect: (state, action: PayloadAction<{
      code: string;
      discountAmount: number;
      discountType: 'percentage' | 'fixed' | 'free_shipping';
      couponData?: Coupon;
    }>) => {
      console.log('🎫 applyCouponDirect action:', action.payload);
      state.appliedCoupon = action.payload;
      state.validationError = null;
    },

    // Remove applied coupon
    removeCoupon: (state) => {
      console.log('🎫 removeCoupon action');
      state.appliedCoupon = null;
      state.validationError = null;
    },

    // Clear validation error
    clearValidationError: (state) => {
      state.validationError = null;
    },

    // Reset coupon state
    resetCouponState: (state) => {
      state.appliedCoupon = null;
      state.validationLoading = false;
      state.validationError = null;
      state.availableCoupons = [];
      state.loading = false;
    },

    // Set available coupons directly
    setAvailableCoupons: (state, action: PayloadAction<Coupon[]>) => {
      state.availableCoupons = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Validate coupon cases
      .addCase(validateCoupon.pending, (state) => {
        console.log('🎫 validateCoupon.pending');
        state.validationLoading = true;
        state.validationError = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        console.log('🎫 validateCoupon.fulfilled:', action.payload);
        state.validationLoading = false;

        if (action.payload.success && action.payload.data) {
          state.appliedCoupon = {
            code: action.payload.data.coupon.code,
            discountAmount: action.payload.data.discountAmount,
            discountType: action.payload.data.coupon.discountType,
            couponData: action.payload.data.coupon,
          };
          state.validationError = null;
          console.log('🎫 Coupon applied successfully:', action.payload.data.coupon.code);
        }
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        console.error('🎫 validateCoupon.rejected:', action.payload);
        state.validationLoading = false;
        state.validationError = action.payload as string;
        state.appliedCoupon = null;
      })
      // Fetch available coupons cases
      .addCase(fetchAvailableCoupons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.availableCoupons = action.payload;
        console.log('🎫 fetchAvailableCoupons.fulfilled - Available coupons:', action.payload.length);
      })
      .addCase(fetchAvailableCoupons.rejected, (state, action) => {
        state.loading = false;
        console.error('🎫 fetchAvailableCoupons.rejected:', action.payload);
        // Don't clear available coupons on error, keep previous ones
      });
  },
});

export const {
  applyCouponDirect,
  removeCoupon,
  clearValidationError,
  resetCouponState,
  setAvailableCoupons,
} = couponSlice.actions;

// Selectors
export const selectAppliedCoupon = (state: RootState) => state.coupon.appliedCoupon;
export const selectCouponValidationLoading = (state: RootState) => state.coupon.validationLoading;
export const selectCouponValidationError = (state: RootState) => state.coupon.validationError;
export const selectAvailableCoupons = (state: RootState) => state.coupon.availableCoupons;
export const selectCouponLoading = (state: RootState) => state.coupon.loading;

// Calculate discount amount
export const selectCouponDiscount = (state: RootState) => {
  const coupon = state.coupon.appliedCoupon;
  if (!coupon) return 0;
  return coupon.discountAmount;
};

export default couponSlice.reducer;
