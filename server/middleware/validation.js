// middleware/validation.js
import { body, param, query, validationResult } from 'express-validator'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'

// Helper to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }))

    throw new ApiError(400, 'Validation failed', false, errorMessages)
  }
  next()
}

// Common validation rules
const commonValidations = {
  objectId: (field) => param(field).isMongoId().withMessage(`Invalid ${field} ID format`),

  optionalObjectId: (field) =>
    param(field).optional().isMongoId().withMessage(`Invalid ${field} ID format`),

  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),

  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  phone: body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  price: body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  quantity: body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),

  rating: body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  percentage: body('percentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Percentage must be between 0 and 100'),
}

// Auth validations
export const validateRegister = [
  commonValidations.name,
  commonValidations.email,
  commonValidations.password,
  handleValidationErrors,
]

export const validateLogin = [
  commonValidations.email,
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
]

export const validateUpdateProfile = [
  commonValidations.name.optional(),
  commonValidations.email.optional(),
  commonValidations.phone,
  handleValidationErrors,
]

export const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  commonValidations.password,
  handleValidationErrors,
]

export const validateForgotPassword = [commonValidations.email, handleValidationErrors]

export const validateResetPassword = [
  commonValidations.password,
  body('token').notEmpty().withMessage('Reset token is required'),
  handleValidationErrors,
]

// User validations
export const validateUserId = [commonValidations.objectId('id'), handleValidationErrors]

export const validateUserUpdate = [
  commonValidations.name.optional(),
  commonValidations.email.optional(),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  handleValidationErrors,
]

// Product validations
export const validateProductId = [commonValidations.objectId('id'), handleValidationErrors]

export const validateCreateProduct = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Product title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Product title must be between 3 and 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Product description must be between 10 and 2000 characters'),

  commonValidations.price,

  body('comparePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare price must be a positive number'),

  body('category')
    .notEmpty()
    .withMessage('Product category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('brand')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Brand name must be between 2 and 50 characters'),

  body('tags').optional().isArray().withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),

  body('features').optional().isArray().withMessage('Features must be an array'),

  body('features.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each feature must be between 1 and 100 characters'),

  body('variants').optional().isArray().withMessage('Variants must be an array'),

  body('variants.*.size')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Size must be between 1 and 20 characters'),

  body('variants.*.color')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Color must be between 1 and 20 characters'),

  body('variants.*.stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('variants.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Variant price must be a positive number'),

  body('inventory.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Inventory quantity must be a non-negative integer'),

  body('inventory.lowStockAlert')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock alert must be a non-negative integer'),

  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  handleValidationErrors,
]

export const validateUpdateProduct = [
  commonValidations.objectId('id'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Product title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Product description must be between 10 and 2000 characters'),

  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  // Include other optional fields from create product
  handleValidationErrors,
]

export const validateInventoryUpdate = [
  commonValidations.objectId('id'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),

  body('variants').optional().isArray().withMessage('Variants must be an array'),

  body('variants.*._id')
    .notEmpty()
    .withMessage('Variant ID is required')
    .isMongoId()
    .withMessage('Invalid variant ID'),

  body('variants.*.stock')
    .isInt({ min: 0 })
    .withMessage('Variant stock must be a non-negative integer'),

  handleValidationErrors,
]

// Category validations
export const validateCategoryId = [commonValidations.objectId('id'), handleValidationErrors]

export const validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('parent').optional().isMongoId().withMessage('Invalid parent category ID'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  body('featured').optional().isBoolean().withMessage('featured must be a boolean'),

  body('sortOrder').optional().isInt().withMessage('Sort order must be an integer'),

  handleValidationErrors,
]

// Cart validations
export const validateAddToCart = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('size')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Size must be between 1 and 20 characters'),

  body('color')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Color must be between 1 and 20 characters'),

  commonValidations.quantity,

  handleValidationErrors,
]

export const validateUpdateCartItem = [
  commonValidations.objectId('itemId'),
  commonValidations.quantity,

  handleValidationErrors,
]

export const validateCartItemId = [commonValidations.objectId('itemId'), handleValidationErrors]

// Order validations
export const validateOrderId = [commonValidations.objectId('id'), handleValidationErrors]

export const validateCreateOrder = [
  body('shippingAddress.name')
    .trim()
    .notEmpty()
    .withMessage('Shipping name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Shipping name must be between 2 and 100 characters'),

  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),

  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),

  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),

  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required')
    .isPostalCode('any')
    .withMessage('Please provide a valid ZIP code'),

  body('shippingAddress.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),

  body('shippingAddress.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('billingAddress').optional().isObject().withMessage('Billing address must be an object'),

  body('paymentMethod')
    .isIn(['card', 'paypal', 'stripe', 'cash_on_delivery'])
    .withMessage('Invalid payment method'),

  body('couponCode')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Coupon code must be between 1 and 20 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),

  handleValidationErrors,
]

export const validateOrderStatus = [
  commonValidations.objectId('id'),
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),

  handleValidationErrors,
]

export const validateCancelOrder = [
  commonValidations.objectId('id'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Cancellation reason must be between 10 and 500 characters'),

  handleValidationErrors,
]

// Review validations
export const validateReviewId = [commonValidations.objectId('id'), handleValidationErrors]

export const validateCreateReview = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  commonValidations.rating,

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Review title must be between 5 and 100 characters'),

  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review comment must be between 10 and 1000 characters'),

  handleValidationErrors,
]

export const validateUpdateReview = [
  commonValidations.objectId('id'),
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Review title must be between 5 and 100 characters'),

  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review comment must be between 10 and 1000 characters'),

  handleValidationErrors,
]

// Payment validations
export const validateCreatePaymentIntent = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID'),

  body('savePaymentMethod')
    .optional()
    .isBoolean()
    .withMessage('savePaymentMethod must be a boolean'),

  handleValidationErrors,
]

export const validateConfirmPayment = [
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid payment intent ID'),

  handleValidationErrors,
]

export const validateProcessRefund = [
  commonValidations.objectId('orderId'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Refund amount must be a positive number'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Refund reason cannot exceed 200 characters'),

  handleValidationErrors,
]

// Coupon validations
export const validateCouponId = [commonValidations.objectId('id'), handleValidationErrors]

export const validateCreateCoupon = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Coupon code can only contain uppercase letters and numbers'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('discountType')
    .isIn(['percentage', 'fixed', 'free_shipping'])
    .withMessage('Discount type must be percentage, fixed, or free_shipping'),

  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),

  body('minimumAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),

  body('maximumDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be a positive number'),

  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start date cannot be in the past')
      }
      return true
    }),

  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date')
      }
      return true
    }),

  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),

  body('perUserLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Per user limit must be a positive integer'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  body('isSingleUse').optional().isBoolean().withMessage('isSingleUse must be a boolean'),

  body('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array'),

  body('applicableCategories.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each category must be between 1 and 50 characters'),

  body('customerEligibility')
    .optional()
    .isIn(['all', 'new_customers', 'existing_customers', 'specific_customers'])
    .withMessage('Invalid customer eligibility'),

  handleValidationErrors,
]

export const validateValidateCoupon = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters'),

  body('cartAmount').isFloat({ min: 0 }).withMessage('Cart amount must be a positive number'),

  body('products').optional().isArray().withMessage('Products must be an array'),

  handleValidationErrors,
]

// Address validations
export const validateAddressId = [commonValidations.objectId('id'), handleValidationErrors]

export const validateCreateAddress = [
  body('type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Address name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Address name must be between 2 and 100 characters'),

  body('street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),

  body('apartment')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Apartment cannot exceed 50 characters'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),

  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),

  body('zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required')
    .isPostalCode('any')
    .withMessage('Please provide a valid ZIP code'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),

  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Instructions cannot exceed 500 characters'),

  handleValidationErrors,
]

export const validateUpdateAddress = [
  commonValidations.objectId('id'),
  // Include optional versions of create address validations
  body('type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Address name must be between 2 and 100 characters'),

  // ... include other optional validations
  handleValidationErrors,
]

// Wishlist validations
export const validateProductIdParam = [
  commonValidations.objectId('productId'),
  handleValidationErrors,
]

export const validateAddToWishlist = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  handleValidationErrors,
]

export const validateMoveToCart = [
  commonValidations.objectId('productId'),
  body('size')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Size must be between 1 and 20 characters'),

  body('color')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Color must be between 1 and 20 characters'),

  commonValidations.quantity,

  handleValidationErrors,
]

// Analytics validations
export const validateAnalyticsPeriod = [
  query('period')
    .optional()
    .isIn(['7days', '30days', '90days', '1year'])
    .withMessage('Period must be 7days, 30days, 90days, or 1year'),

  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date')
      }
      return true
    }),

  query('groupBy')
    .optional()
    .isIn(['day', 'month', 'year'])
    .withMessage('Group by must be day, month, or year'),

  handleValidationErrors,
]

export const validateExportAnalytics = [
  query('type')
    .isIn(['sales', 'products', 'customers', 'all'])
    .withMessage('Export type must be sales, products, customers, or all'),

  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),

  query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),

  handleValidationErrors,
]

// Query parameter validations

export const validateProductFilters = [
  query('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Invalid category'),

  query('brand').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Invalid brand'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number')
    .custom((value, { req }) => {
      if (req.query.minPrice && parseFloat(value) <= parseFloat(req.query.minPrice)) {
        throw new Error('Maximum price must be greater than minimum price')
      }
      return true
    }),

  query('inStock').optional().isIn(['true', 'false']).withMessage('inStock must be true or false'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),

  handleValidationErrors,
]

// File upload validation
export const validateFileUpload = [
  (req, res, next) => {
    if (!req.file) {
      throw new ApiError(400, 'File is required')
    }

    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new ApiError(400, 'Only JPEG, JPG, PNG, and WebP images are allowed')
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (req.file.size > maxSize) {
      throw new ApiError(400, 'File size must be less than 5MB')
    }

    next()
  },
]

export const validateMultipleFileUpload = [
  (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, 'At least one file is required')
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024

    for (const file of req.files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new ApiError(400, 'Only JPEG, JPG, PNG, and WebP images are allowed')
      }

      if (file.size > maxSize) {
        throw new ApiError(400, 'Each file must be less than 5MB')
      }
    }

    next()
  },
]

// middleware/validation.js - Add these validations

// middleware/validation.js - Add slug validation

export const validateBrandId = [
  param('id').isMongoId().withMessage('Invalid brand ID'),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      })
    }
    next()
  },
]

// Brand slug validation
export const validateBrandSlug = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Brand slug is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Brand slug must be between 2 and 100 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Brand slug can only contain lowercase letters, numbers, and hyphens'),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      })
    }
    next()
  },
]

// Brand query validation
export const validateBrandQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot be more than 100 characters'),

  query('sort')
    .optional()
    .isIn([
      'name',
      'rating',
      'productCount',
      'followerCount',
      'createdAt',
      '-name',
      '-rating',
      '-productCount',
      '-followerCount',
      '-createdAt',
    ])
    .withMessage('Invalid sort parameter'),

  query('featured').optional().isBoolean().withMessage('Featured must be a boolean'),

  query('verified').optional().isBoolean().withMessage('Verified must be a boolean'),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      })
    }
    next()
  },
]

// Brand products query validation
export const validateBrandProductsQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category cannot be more than 100 characters'),

  query('sort')
    .optional()
    .isIn(['price', 'rating', 'createdAt', 'name', '-price', '-rating', '-createdAt', '-name'])
    .withMessage('Invalid sort parameter'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      })
    }
    next()
  },
]

// Create brand validation
export const validateCreateBrand = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Brand name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Brand name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s&.-]+$/)
    .withMessage('Brand name can only contain letters, numbers, spaces, &, ., and -'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot be more than 1000 characters'),

  body('website').optional().isURL().withMessage('Please enter a valid website URL'),

  body('originCountry')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Origin country cannot be more than 100 characters'),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      })
    }
    next()
  },
]

// Update brand validation
export const validateUpdateBrand = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Brand name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Brand name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s&.-]+$/)
    .withMessage('Brand name can only contain letters, numbers, spaces, &, ., and -'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot be more than 1000 characters'),

  body('website').optional().isURL().withMessage('Please enter a valid website URL'),

  body('originCountry')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Origin country cannot be more than 100 characters'),

  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),

  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      })
    }
    next()
  },
]

// General pagination validation
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      })
    }
    next()
  },
]

// File upload validation for brand images
export const validateBrandImageUpload = [
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      })
    }

    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only JPEG, JPG, PNG, and WebP images are allowed',
      })
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'Image size must be less than 5MB',
      })
    }

    next()
  },
]

export const validateUpdatePaymentMethod = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('billing_details').optional().isObject().withMessage('Billing details must be an object'),
  handleValidationErrors,
]

export const validateAddPaymentMethod = [
  body('paymentMethodId')
    .notEmpty()
    .withMessage('Payment method ID is required')
    .isString()
    .withMessage('Payment method ID must be a string'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean').toBoolean(),
  body('type')
    .optional()
    .isIn(['card', 'paypal', 'apple_pay'])
    .withMessage('Type must be card, paypal, or apple_pay'),
  handleValidationErrors,
]

// Add more detailed logging to see what's being sent
export const debugRequest = (req, res, next) => {
  console.log('📨 Incoming Request:', {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers,
  })
  next()
}
