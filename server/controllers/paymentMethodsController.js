// controllers/paymentMethodsController.js
import PaymentMethod from '../models/PaymentMethod.js'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import paymentService from '../services/paymentService.js'

// @desc    Get user's payment methods
// @route   GET /api/payment-methods
// @access  Private
export const getPaymentMethods = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const paymentMethods = await PaymentMethod.getActivePaymentMethods(userId)
  const formattedMethods = paymentMethods.map((method) => method.toClientFormat())

  res.json({
    success: true,
    data: formattedMethods,
    count: formattedMethods.length,
  })
})

// @desc    Get payment method by ID
// @route   GET /api/payment-methods/:id
// @access  Private
export const getPaymentMethodById = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const { id } = req.params

  const paymentMethod = await PaymentMethod.findOne({
    _id: id,
    user: userId,
    isActive: true,
  })

  if (!paymentMethod) {
    return next(new ApiError(404, 'Payment method not found'))
  }

  // Check if payment method is expired
  if (paymentMethod.isExpired()) {
    return next(new ApiError(400, 'Payment method has expired'))
  }

  res.json({
    success: true,
    data: paymentMethod.toClientFormat(),
  })
})

// @desc    Create setup intent for adding payment method
// @route   POST /api/payment-methods/setup-intent
// @access  Private
// controllers/paymentMethodsController.js - Updated createSetupIntent
export const createSetupIntent = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { metadata = {} } = req.body

  try {
    // Get or create Stripe customer
    let user = await User.findById(userId).select('+stripeCustomerId')
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      // For testing, create a test customer
      const customer = await paymentService.createCustomer(user.email, user.name, {
        userId: user._id.toString(),
      })
      stripeCustomerId = customer.id

      user.stripeCustomerId = stripeCustomerId
      await user.save({ validateBeforeSave: false })
    }

    const setupIntent = await paymentService.createSetupIntent(stripeCustomerId, {
      ...metadata,
      userId: user._id.toString(),
    })

    res.json({
      success: true,
      data: {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
        customerId: stripeCustomerId,
      },
    })
  } catch (error) {
    console.error('Setup intent error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// @desc    Add new payment method
// @route   POST /api/payment-methods
// @access  Private
export const addPaymentMethod = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const { paymentMethodId, isDefault = false, type = 'card', metadata = {} } = req.body

  // Validate input
  if (!paymentMethodId) {
    return next(new ApiError(400, 'Payment method ID is required'))
  }

  // Get user with Stripe customer ID
  const user = await User.findById(userId).select('+stripeCustomerId')
  if (!user.stripeCustomerId) {
    return next(new ApiError(400, 'User does not have a Stripe customer account'))
  }

  // Check if payment method already exists for this user
  const existingMethod = await PaymentMethod.findOne({
    stripePaymentMethodId: paymentMethodId,
    user: userId,
    isActive: true,
  })

  if (existingMethod) {
    return next(new ApiError(409, 'Payment method already exists'))
  }

  try {
    // Attach payment method to customer
    const attachedPaymentMethod = await paymentService.attachPaymentMethodToCustomer(
      paymentMethodId,
      user.stripeCustomerId
    )

    // Retrieve full payment method details
    const paymentMethodDetails = await paymentService.retrievePaymentMethod(paymentMethodId)

    // Validate payment method type
    if (type && paymentMethodDetails.type !== type) {
      await paymentService.detachPaymentMethod(paymentMethodId)
      return next(
        new ApiError(
          400,
          `Payment method type mismatch. Expected ${type}, got ${paymentMethodDetails.type}`
        )
      )
    }

    // Prepare payment method data
    const paymentMethodData = {
      user: userId,
      stripePaymentMethodId: paymentMethodDetails.id,
      type: paymentMethodDetails.type,
      name: paymentMethodDetails.billing_details?.name || user.name,
      email: paymentMethodDetails.billing_details?.email || user.email,
      isDefault: isDefault,
      metadata: {
        createdVia: metadata.createdVia || 'checkout',
        isVerified: false,
        verificationAttempts: 0,
      },
    }

    // Add card-specific fields
    if (paymentMethodDetails.type === 'card') {
      paymentMethodData.brand = paymentMethodDetails.card.brand
      paymentMethodData.last4 = paymentMethodDetails.card.last4
      paymentMethodData.expMonth = paymentMethodDetails.card.exp_month
      paymentMethodData.expYear = paymentMethodDetails.card.exp_year
      paymentMethodData.fingerprint = paymentMethodDetails.card.fingerprint
      paymentMethodData.country = paymentMethodDetails.card.country

      // Validate card expiration
      if (
        !paymentService.validateExpiryDate(
          paymentMethodDetails.card.exp_month,
          paymentMethodDetails.card.exp_year
        )
      ) {
        await paymentService.detachPaymentMethod(paymentMethodId)
        return next(new ApiError(400, 'Card has expired'))
      }
    }

    // Create payment method record
    const newPaymentMethod = await PaymentMethod.create(paymentMethodData)

    // Handle default payment method logic
    if (isDefault) {
      await paymentService.setDefaultPaymentMethod(user.stripeCustomerId, paymentMethodId)
      await PaymentMethod.setDefaultPaymentMethod(userId, newPaymentMethod._id)
    }

    res.status(201).json({
      success: true,
      data: newPaymentMethod.toClientFormat(),
      message: 'Payment method added successfully',
    })
  } catch (error) {
    // Clean up on failure
    try {
      await paymentService.detachPaymentMethod(paymentMethodId)
    } catch (detachError) {
      console.error('Failed to detach payment method during cleanup:', detachError)
    }

    return next(error)
  }
})

// @desc    Set default payment method
// @route   PATCH /api/payment-methods/:id/default
// @access  Private
export const setDefaultPaymentMethod = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const { id } = req.params

  // Get payment method
  const paymentMethod = await PaymentMethod.findOne({
    _id: id,
    user: userId,
    isActive: true,
  })

  if (!paymentMethod) {
    return next(new ApiError(404, 'Payment method not found'))
  }

  // Check if payment method is expired
  if (paymentMethod.isExpired()) {
    return next(new ApiError(400, 'Cannot set expired payment method as default'))
  }

  // Get user with Stripe customer ID
  const user = await User.findById(userId).select('+stripeCustomerId')
  if (!user.stripeCustomerId) {
    return next(new ApiError(400, 'User does not have a Stripe customer account'))
  }

  try {
    // Update Stripe customer default payment method
    await paymentService.setDefaultPaymentMethod(
      user.stripeCustomerId,
      paymentMethod.stripePaymentMethodId
    )

    // Update database
    await PaymentMethod.setDefaultPaymentMethod(userId, id)

    res.json({
      success: true,
      message: 'Default payment method updated successfully',
    })
  } catch (error) {
    return next(new ApiError(500, `Failed to set default payment method: ${error.message}`))
  }
})

// @desc    Update payment method
// @route   PUT /api/payment-methods/:id
// @access  Private
export const updatePaymentMethod = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const { id } = req.params
  const { name, billing_details } = req.body

  // Get payment method
  const paymentMethod = await PaymentMethod.findOne({
    _id: id,
    user: userId,
    isActive: true,
  })

  if (!paymentMethod) {
    return next(new ApiError(404, 'Payment method not found'))
  }

  try {
    // Update in Stripe if billing details provided
    if (billing_details) {
      await paymentService.updatePaymentMethod(paymentMethod.stripePaymentMethodId, {
        billing_details: {
          ...billing_details,
          address: billing_details.address || {},
        },
      })
    }

    // Update in database
    const updates = {}
    if (name) updates.name = name
    if (billing_details?.email) updates.email = billing_details.email

    if (Object.keys(updates).length > 0) {
      await PaymentMethod.findByIdAndUpdate(id, updates, { runValidators: true })
    }

    // Get updated payment method
    const updatedMethod = await PaymentMethod.findById(id)

    res.json({
      success: true,
      data: updatedMethod.toClientFormat(),
      message: 'Payment method updated successfully',
    })
  } catch (error) {
    return next(new ApiError(500, `Failed to update payment method: ${error.message}`))
  }
})

// @desc    Delete payment method
// @route   DELETE /api/payment-methods/:id
// @access  Private
export const deletePaymentMethod = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const { id } = req.params

  // Get payment method
  const paymentMethod = await PaymentMethod.findOne({
    _id: id,
    user: userId,
    isActive: true,
  })

  if (!paymentMethod) {
    return next(new ApiError(404, 'Payment method not found'))
  }

  // Check if this is the only payment method
  const activePaymentMethods = await PaymentMethod.countDocuments({
    user: userId,
    isActive: true,
  })

  if (activePaymentMethods <= 1) {
    return next(new ApiError(400, 'Cannot delete your only payment method'))
  }

  const session = await PaymentMethod.startSession()
  session.startTransaction()

  try {
    // If it's the default, set another one as default
    if (paymentMethod.isDefault) {
      const anotherMethod = await PaymentMethod.findOne({
        user: userId,
        isActive: true,
        _id: { $ne: id },
      }).session(session)

      if (anotherMethod) {
        // Get user for Stripe customer ID
        const user = await User.findById(userId).select('+stripeCustomerId').session(session)
        if (user.stripeCustomerId) {
          await paymentService.setDefaultPaymentMethod(
            user.stripeCustomerId,
            anotherMethod.stripePaymentMethodId
          )
        }
        await PaymentMethod.setDefaultPaymentMethod(userId, anotherMethod._id)
      }
    }

    // Detach from Stripe
    try {
      await paymentService.detachPaymentMethod(paymentMethod.stripePaymentMethodId)
    } catch (stripeError) {
      console.error('Error detaching payment method from Stripe:', stripeError)
      // Continue with deletion even if Stripe detach fails
    }

    // Soft delete from database
    paymentMethod.isActive = false
    paymentMethod.isDefault = false
    await paymentMethod.save({ session })

    await session.commitTransaction()

    res.json({
      success: true,
      message: 'Payment method deleted successfully',
    })
  } catch (error) {
    await session.abortTransaction()
    return next(new ApiError(500, `Failed to delete payment method: ${error.message}`))
  } finally {
    session.endSession()
  }
})

// @desc    Verify payment method with small charge
// @route   POST /api/payment-methods/:id/verify
// @access  Private
export const verifyPaymentMethod = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const { id } = req.params

  const paymentMethod = await PaymentMethod.findOne({
    _id: id,
    user: userId,
    isActive: true,
  })

  if (!paymentMethod) {
    return next(new ApiError(404, 'Payment method not found'))
  }

  // Get user with Stripe customer ID
  const user = await User.findById(userId).select('+stripeCustomerId')
  if (!user.stripeCustomerId) {
    return next(new ApiError(400, 'User does not have a Stripe customer account'))
  }

  try {
    // Create a small authorization charge ($0.50 - $1.00)
    const verifyAmount = 0.5 // $0.50
    const paymentIntent = await paymentService.createPaymentIntent(
      verifyAmount,
      'usd',
      user.stripeCustomerId,
      paymentMethod.stripePaymentMethodId,
      {
        verification: 'true',
        userId: user._id.toString(),
      }
    )

    // If payment intent requires action, return the client secret
    if (paymentIntent.status === 'requires_action') {
      return res.json({
        success: true,
        data: {
          requiresAction: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
        message: 'Payment method requires additional verification',
      })
    }

    // If successfully verified, update payment method
    if (paymentIntent.status === 'succeeded') {
      paymentMethod.metadata.isVerified = true
      paymentMethod.metadata.verificationAttempts += 1
      await paymentMethod.save()

      // Immediately refund the verification charge
      await paymentService.refundPayment(paymentIntent.id)
    }

    res.json({
      success: true,
      data: {
        isVerified: paymentMethod.metadata.isVerified,
        status: paymentIntent.status,
      },
      message: 'Payment method verified successfully',
    })
  } catch (error) {
    // Increment verification attempts on failure
    paymentMethod.metadata.verificationAttempts += 1
    await paymentMethod.save()

    return next(new ApiError(500, `Verification failed: ${error.message}`))
  }
})
