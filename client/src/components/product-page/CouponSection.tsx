// components/product-page/CouponSection.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, Coupon } from '@/types';
import { useToast } from '@/lib/hooks/useToast';
import { useValidateCouponMutation } from '@/lib/services/couponsApi';
import { useCart } from '@/lib/hooks/useCart';

interface CouponSectionProps {
  product: Product;
}

const CouponSection: React.FC<CouponSectionProps> = ({ product }) => {
  const { success, error: toastError } = useToast();
  const { subtotal, applyCouponCode, removeCouponCode, appliedCoupon: cartAppliedCoupon } = useCart();
  const [validateCoupon, { isLoading: isApplyingCoupon }] = useValidateCouponMutation();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const result = await validateCoupon({
        code: couponCode.trim(),
        cartAmount: subtotal,
        products: [{
          productId: product._id,
          price: product.price,
          quantity: 1
        }]
      }).unwrap();

      if (result.success) {
        const { coupon, discountAmount } = result.data;

        // Apply coupon to cart
        await applyCouponCode(coupon.code, discountAmount, coupon.discountType);

        setAppliedCoupon(coupon);
        success('Coupon applied successfully!');
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Invalid or expired coupon code';
      toastError(errorMessage);
    }
  };

  const handleRemoveCoupon = () => {
    removeCouponCode();
    setAppliedCoupon(null);
    setCouponCode('');
    success('Coupon removed');
  };

  const handleApplySuggestedCoupon = (code: string) => {
    setCouponCode(code);
  };

  // Use cart applied coupon if available, otherwise use local state
  const currentAppliedCoupon = cartAppliedCoupon || appliedCoupon;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Apply Coupon</h3>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
        />
        <Button
          onClick={handleApplyCoupon}
          disabled={!couponCode.trim() || isApplyingCoupon}
          variant="outline"
        >
          {isApplyingCoupon ? 'Applying...' : 'Apply'}
        </Button>
      </div>

      {/* Active Coupons List */}
      {product.activeCoupons && product.activeCoupons.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Available coupons:</p>
          <div className="space-y-2">
            {product.activeCoupons.map((coupon) => (
              <div
                key={coupon._id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {coupon.code}
                    </Badge>
                    <span className="font-medium">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `$${coupon.discountValue} OFF`}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Min. purchase: ${coupon.minPurchase}
                    {coupon.maxDiscount && ` • Max discount: $${coupon.maxDiscount}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleApplySuggestedCoupon(coupon.code)}
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applied Coupon */}
      {currentAppliedCoupon && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {currentAppliedCoupon.code}
                </Badge>
                <span className="font-medium text-green-600">
                  -{currentAppliedCoupon.discountType === 'percentage'
                    ? `${currentAppliedCoupon.discountValue}%`
                    : `$${currentAppliedCoupon.discountValue}`}
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Discount applied successfully!
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemoveCoupon}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponSection;
