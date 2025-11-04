// routes/coupons.js - Fix available coupons route
import express from 'express'
import {
  createCoupon,
  getCoupons,
  getCoupon,
  validateCoupon,
  getAvailableCoupons,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponAnalytics,
} from '../controllers/couponController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/validate', validateCoupon)
router.post('/available', getAvailableCoupons) // FIXED: Make this POST and public

// Protected routes
router.use(protect)

// Admin routes
router.use(authorize('admin'))

router.route('/').post(createCoupon).get(getCoupons)

router.route('/:id').get(getCoupon).put(updateCoupon).delete(deleteCoupon)

router.patch('/:id/toggle', toggleCouponStatus)
router.get('/analytics/overview', getCouponAnalytics)

export default router
