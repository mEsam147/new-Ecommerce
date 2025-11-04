// controllers/couponController.js
import Coupon from '../models/Coupon.js'
import CouponService from '../services/couponService.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartAmount, products = [] } = req.body

  // Handle guest users (no user ID)
  const userId = req.user ? req.user.id : null

  if (!code) {
    throw new ApiError(400, 'Coupon code is required')
  }

  if (!cartAmount || cartAmount <= 0) {
    throw new ApiError(400, 'Valid cart amount is required')
  }

  try {
    // Find coupon directly without static method
    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    })

    if (!coupon) {
      throw new Error('Coupon not found or inactive')
    }

    // Use instance method for validation
    const validation = await coupon.validateCoupon(userId, cartAmount, products)
    if (!validation.isValid) {
      throw new Error(validation.errors[0])
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(cartAmount)

    res.json({
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
        finalAmount: cartAmount - discountAmount,
        cartAmount,
      },
      message: 'Coupon applied successfully!',
    })
  } catch (error) {
    throw new ApiError(400, error.message)
  }
})

// @desc    Get available coupons
// @route   GET /api/coupons/available
// @access  Private
export const getAvailableCoupons = asyncHandler(async (req, res) => {
  const { cartAmount = 0, cartItems = [] } = req.body

  // FIXED: Handle both authenticated and guest users safely
  const userId = req.user ? req.user._id : null

  try {
    const coupons = await CouponService.getAvailableCoupons(
      userId,
      parseFloat(cartAmount),
      cartItems
    )

    res.json({
      success: true,
      data: coupons,
      count: coupons.length,
    })
  } catch (error) {
    console.error('Error in getAvailableCoupons controller:', error)
    throw new ApiError(500, 'Failed to fetch available coupons')
  }
})

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    description,
    discountType,
    discountValue,
    minimumAmount,
    maximumDiscount,
    startDate,
    endDate,
    usageLimit,
    perUserLimit,
    applicableCategories,
    excludedCategories,
    applicableProducts,
    excludedProducts,
    customerEligibility,
    specificCustomers,
  } = req.body

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() })
  if (existingCoupon) {
    throw new ApiError(400, 'Coupon code already exists')
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    name,
    description,
    discountType,
    discountValue: parseFloat(discountValue),
    minimumAmount: minimumAmount ? parseFloat(minimumAmount) : 0,
    maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : undefined,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
    perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
    applicableCategories,
    excludedCategories,
    applicableProducts,
    excludedProducts,
    customerEligibility: customerEligibility || 'all',
    specificCustomers,
    createdBy: req.user.id,
  })

  res.status(201).json({
    success: true,
    data: coupon,
    message: 'Coupon created successfully',
  })
})

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, active, search, discountType } = req.query

  const query = {}

  // Filter by active status
  if (active === 'true') {
    query.isActive = true
    query.startDate = { $lte: new Date() }
    query.endDate = { $gte: new Date() }
  } else if (active === 'false') {
    query.isActive = false
  }

  // Search by code or name
  if (search) {
    query.$or = [
      { code: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ]
  }

  // Filter by discount type
  if (discountType) {
    query.discountType = discountType
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: 'createdBy',
  }

  const coupons = await Coupon.find(query)
    .limit(options.limit)
    .skip((options.page - 1) * options.limit)
    .sort(options.sort)
    .populate('createdBy', 'name email')

  const total = await Coupon.countDocuments(query)

  res.json({
    success: true,
    data: coupons,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      pages: Math.ceil(total / options.limit),
    },
  })
})

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
export const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('applicableProducts', 'title price')
    .populate('excludedProducts', 'title price')
    .populate('specificCustomers', 'name email')

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found')
  }

  res.json({
    success: true,
    data: coupon,
  })
})

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found')
  }

  // Prevent updating code if coupon has been used
  if (coupon.usedCount > 0 && req.body.code) {
    throw new ApiError(400, 'Cannot update code of a used coupon')
  }

  // Update fields
  const allowedUpdates = [
    'name',
    'description',
    'discountType',
    'discountValue',
    'minimumAmount',
    'maximumDiscount',
    'startDate',
    'endDate',
    'usageLimit',
    'perUserLimit',
    'isActive',
    'applicableCategories',
    'excludedCategories',
    'applicableProducts',
    'excludedProducts',
    'customerEligibility',
    'specificCustomers',
  ]

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      coupon[field] = req.body[field]
    }
  })

  await coupon.save()

  res.json({
    success: true,
    data: coupon,
    message: 'Coupon updated successfully',
  })
})

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found')
  }

  if (coupon.usedCount > 0) {
    throw new ApiError(400, 'Cannot delete a coupon that has been used')
  }

  await Coupon.findByIdAndDelete(req.params.id)

  res.json({
    success: true,
    message: 'Coupon deleted successfully',
  })
})

// @desc    Toggle coupon status
// @route   PATCH /api/coupons/:id/toggle
// @access  Private/Admin
export const toggleCouponStatus = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found')
  }

  coupon.isActive = !coupon.isActive
  await coupon.save()

  res.json({
    success: true,
    data: coupon,
    message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
  })
})

// @desc    Get coupon analytics
// @route   GET /api/coupons/analytics/overview
// @access  Private/Admin
export const getCouponAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query

  const analytics = await CouponService.getCouponAnalytics(startDate, endDate)

  res.json({
    success: true,
    data: analytics,
  })
})
