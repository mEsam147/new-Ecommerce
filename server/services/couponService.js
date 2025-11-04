// services/couponService.js
import Coupon from '../models/Coupon.js'
import ApiError from '../utils/ApiError.js'

class CouponService {
  // Validate and apply coupon
  async validateAndApplyCoupon(code, userId, cartAmount, cartItems = []) {
    try {
      const coupon = await Coupon.findAndValidate(code, userId, cartAmount, cartItems)

      const discountAmount = coupon.calculateDiscount(cartAmount)
      const finalAmount = Math.max(0, cartAmount - discountAmount)

      return {
        success: true,
        data: {
          coupon: {
            id: coupon._id,
            code: coupon.code,
            name: coupon.name,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minimumAmount: coupon.minimumAmount,
            maximumDiscount: coupon.maximumDiscount,
            isFreeShipping: coupon.discountType === 'free_shipping',
          },
          discountAmount,
          finalAmount,
          cartAmount,
        },
        message: this.getSuccessMessage(coupon),
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      }
    }
  }

  // Get available coupons for user
  // services/couponService.js - Fix the getAvailableCoupons method
  async getAvailableCoupons(userId, cartAmount = 0, cartItems = []) {
    try {
      // FIXED: Simplified query to find active coupons
      const coupons = await Coupon.find({
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        $or: [{ usageLimit: { $exists: false } }, { usageLimit: { $exists: true, $gt: 0 } }],
      }).sort({ discountValue: -1 })

      // FIXED: Better validation with error handling
      const availableCoupons = []

      for (const coupon of coupons) {
        try {
          // Check usage limit first (simple check)
          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            continue
          }

          const validation = await coupon.validateCoupon(userId, cartAmount, cartItems)
          if (validation.isValid) {
            const discountAmount = coupon.calculateDiscount(cartAmount)

            availableCoupons.push({
              id: coupon._id,
              code: coupon.code,
              name: coupon.name,
              description: coupon.description,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
              minimumAmount: coupon.minimumAmount,
              maximumDiscount: coupon.maximumDiscount,
              isFreeShipping: coupon.discountType === 'free_shipping',
              discountAmount,
              finalAmount: Math.max(0, cartAmount - discountAmount),
              displayText: this.getDisplayText(coupon),
            })
          }
        } catch (error) {
          console.log(`Skipping coupon ${coupon.code}:`, error.message)
          continue
        }
      }

      return availableCoupons
    } catch (error) {
      console.error('Error in getAvailableCoupons:', error)
      throw new ApiError(500, 'Failed to fetch available coupons: ' + error.message)
    }
  }

  // Record coupon usage
  async recordCouponUsage(couponId, userId, orderId, discountAmount) {
    try {
      const coupon = await Coupon.findById(couponId)
      if (!coupon) {
        throw new Error('Coupon not found')
      }

      await coupon.incrementUsage(userId, orderId, discountAmount)
      return { success: true }
    } catch (error) {
      throw new ApiError(500, 'Failed to record coupon usage')
    }
  }

  // Create multiple coupons
  async createBulkCoupons(couponData, quantity, createdBy) {
    const coupons = []

    for (let i = 0; i < quantity; i++) {
      const code = this.generateUniqueCode(couponData.prefix)
      const coupon = new Coupon({
        ...couponData,
        code,
        createdBy,
      })
      coupons.push(coupon)
    }

    await Coupon.insertMany(coupons)
    return coupons
  }

  // Generate unique coupon code
  async generateUniqueCode(prefix = 'SHOP') {
    let code
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase()
      code = `${prefix}${randomChars}`

      const existingCoupon = await Coupon.findOne({ code })
      if (!existingCoupon) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique coupon code')
    }

    return code
  }

  // Get coupon analytics
  async getCouponAnalytics(startDate, endDate) {
    const analytics = await Coupon.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: '$discountType',
          totalCoupons: { $sum: 1 },
          activeCoupons: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isActive', true] },
                    { $lte: ['$startDate', new Date()] },
                    { $gte: ['$endDate', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalUsed: { $sum: '$usedCount' },
          totalRevenue: { $sum: { $multiply: ['$discountValue', '$usedCount'] } },
        },
      },
      {
        $project: {
          discountType: '$_id',
          totalCoupons: 1,
          activeCoupons: 1,
          totalUsed: 1,
          totalRevenue: 1,
          usageRate: {
            $cond: [{ $eq: ['$totalCoupons', 0] }, 0, { $divide: ['$totalUsed', '$totalCoupons'] }],
          },
        },
      },
    ])

    return analytics
  }

  // Helper methods
  getSuccessMessage(coupon) {
    switch (coupon.discountType) {
      case 'percentage':
        return `🎉 ${coupon.discountValue}% discount applied!`
      case 'fixed':
        return `🎉 $${coupon.discountValue} discount applied!`
      case 'free_shipping':
        return `🎉 Free shipping applied!`
      default:
        return 'Coupon applied successfully!'
    }
  }

  getDisplayText(coupon) {
    switch (coupon.discountType) {
      case 'percentage':
        return `${coupon.discountValue}% OFF${
          coupon.maximumDiscount ? ` (up to $${coupon.maximumDiscount})` : ''
        }`
      case 'fixed':
        return `$${coupon.discountValue} OFF`
      case 'free_shipping':
        return 'FREE SHIPPING'
      default:
        return coupon.name
    }
  }
}

export default new CouponService()
