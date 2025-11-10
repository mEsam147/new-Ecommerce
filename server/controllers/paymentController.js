// controllers/paymentController.js
import Order from '../models/Order.js'
import Payment from '../models/Payment.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import paymentService from '../services/paymentService.js'
import inventoryService from '../services/inventoryService.js'
import emailService from '../services/emailService.js'
import mongoose from 'mongoose'

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
export const createStripeCheckoutSession = asyncHandler(async (req, res) => {
  const { cartId, successUrl, cancelUrl, shippingAddress, shippingOption, couponCode } = req.body

  const user = await User.findById(req.user.id)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  // Get cart items
  const cart = await Cart.findById(cartId).populate('items.product')
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty or not found')
  }

  // Prepare line items for Stripe
  const lineItems = cart.items.map((item) => {
    if (!item.product) {
      throw new ApiError(400, `Product not found for item: ${item._id}`)
    }

    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          description: item.product.description?.substring(0, 200) || 'Product',
          images: item.product.images?.length > 0 ? [item.product.images[0]] : [],
          metadata: {
            productId: item.product._id.toString(),
          },
        },
        unit_amount: Math.round(item.product.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }
  })

  // Calculate total amount for validation
  const totalAmount = cart.items.reduce((total, item) => {
    return total + item.product.price * item.quantity
  }, 0)

  if (totalAmount <= 0) {
    throw new ApiError(400, 'Invalid total amount')
  }

  // Create or get Stripe customer
  let stripeCustomerId = user.stripeCustomerId
  if (!stripeCustomerId) {
    const customer = await paymentService.createCustomer(user.email, user.name, {
      userId: user._id.toString(),
    })
    stripeCustomerId = customer.id
    user.stripeCustomerId = stripeCustomerId
    await user.save({ validateBeforeSave: false })
  }

  // Prepare metadata
  const metadata = {
    userId: user._id.toString(),
    cartId: cartId,
    cartItems: JSON.stringify(
      cart.items.map((item) => ({
        product: item.product._id.toString(),
        quantity: item.quantity,
        price: item.product.price,
        name: item.product.name,
      }))
    ),
  }

  if (shippingAddress) {
    metadata.shippingAddress = JSON.stringify(shippingAddress)
  }

  // Create checkout session
  const session = await paymentService.createCheckoutSession({
    customerId: stripeCustomerId,
    lineItems,
    successUrl:
      successUrl || `${process.env.CLIENT_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: cancelUrl || `${process.env.CLIENT_URL}/cart`,
    metadata,
    shippingAddressCollection: {
      allowed_countries: paymentService.supportedCountries,
    },
    mode: 'payment',
    allowPromotionCodes: true,
  })

  res.json({
    success: true,
    data: {
      sessionId: session.id,
      url: session.url,
      expiresAt: session.expires_at,
    },
    message: 'Checkout session created successfully',
  })
})

// @desc    Handle Stripe webhook events
// @route   POST /api/payments/webhook
// @access  Public (Stripe calls this)
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = paymentService.constructWebhookEvent(req.body, sig)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log('🔔 Webhook received:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook handler error:', error)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
})

// @desc    Get session status
// @route   GET /api/payments/session/:sessionId
// @access  Private
export const getSessionStatus = asyncHandler(async (req, res) => {
  const { sessionId } = req.params

  if (!sessionId) {
    throw new ApiError(400, 'Session ID is required')
  }

  const session = await paymentService.retrieveCheckoutSession(sessionId)

  // Check if order already exists for this session
  const existingOrder = await Order.findOne({ stripeSessionId: sessionId })

  if (session.payment_status === 'paid' && !existingOrder) {
    // Create order if payment is successful but order doesn't exist
    try {
      const order = await createOrderFromStripeSession(session)
      return res.json({
        success: true,
        data: {
          session: {
            id: session.id,
            status: session.status,
            payment_status: session.payment_status,
            customer_email: session.customer_details?.email,
            amount_total: session.amount_total ? session.amount_total / 100 : 0,
          },
          order: {
            id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
          },
        },
        message: 'Payment successful and order created',
      })
    } catch (orderError) {
      console.error('Error creating order from session:', orderError)
      throw new ApiError(500, 'Payment successful but order creation failed')
    }
  }

  res.json({
    success: true,
    data: {
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
      },
      order: existingOrder
        ? {
            id: existingOrder._id,
            orderNumber: existingOrder.orderNumber,
            status: existingOrder.status,
          }
        : null,
    },
  })
})

// @desc    Process manual payment (for admin or alternative payment methods)
// @route   POST /api/payments/process-payment
// @access  Private
export const processManualPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod, paymentDetails, amount, currency = 'usd' } = req.body

  if (!orderId || !amount) {
    throw new ApiError(400, 'Order ID and amount are required')
  }

  const order = await Order.findById(orderId)
  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  // Verify order belongs to user or user is admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to process payment for this order')
  }

  if (order.status !== 'pending') {
    throw new ApiError(400, 'Order is not in a payable state')
  }

  // Create payment record
  const payment = new Payment({
    order: orderId,
    user: req.user.id,
    paymentMethod,
    paymentIntentId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    currency,
    status: 'succeeded',
    paymentMethodDetails: paymentDetails,
    metadata: {
      processedManually: 'true',
      processedBy: req.user.id,
    },
  })

  await payment.save()

  // Update order status
  order.isPaid = true
  order.paidAt = new Date()
  order.status = 'processing'
  order.paymentResult = {
    id: payment.paymentIntentId,
    status: 'succeeded',
    update_time: new Date().toISOString(),
  }

  await order.save()

  // Update inventory
  for (const item of order.orderItems) {
    await inventoryService.updateInventory(
      item.product,
      -item.quantity,
      'sale',
      order._id.toString()
    )
  }

  // Send confirmation email
  await emailService.sendOrderConfirmation(order)

  res.json({
    success: true,
    data: {
      payment: {
        id: payment._id,
        paymentIntentId: payment.paymentIntentId,
        amount: payment.amount,
        status: payment.status,
      },
      order: {
        id: order._id,
        status: order.status,
        isPaid: order.isPaid,
      },
    },
    message: 'Payment processed successfully',
  })
})

// @desc    Create order from Stripe session (for webhook and session completion)
// @route   INTERNAL (used by webhook and session status)
// @access  Private
export const createOrderFromStripeSession = asyncHandler(async (session, userId = null) => {
  try {
    console.log('🔄 Creating order from Stripe session:', session.id)

    // Retrieve expanded session data if needed
    const stripeSession = await paymentService.retrieveCheckoutSession(session.id)

    if (!stripeSession) {
      throw new ApiError(404, 'Stripe session not found')
    }

    // Extract user ID from metadata or use provided userId
    const orderUserId = userId || session.metadata?.userId
    if (!orderUserId) {
      throw new ApiError(400, 'User ID not found in session metadata')
    }

    // Get cart items from session metadata or line items
    let cartItems = []

    if (session.metadata?.cartItems) {
      // Parse cart items from metadata
      try {
        cartItems = JSON.parse(session.metadata.cartItems)
      } catch (parseError) {
        console.error('Error parsing cart items from metadata:', parseError)
        throw new ApiError(400, 'Invalid cart items data in session metadata')
      }
    } else if (stripeSession.line_items?.data) {
      // Extract from Stripe line items
      cartItems = stripeSession.line_items.data.map((item) => ({
        product: item.price.metadata?.productId,
        quantity: item.quantity,
        price: item.price.unit_amount / 100, // Convert from cents
        name: item.description,
        image: item.price.metadata?.productImage,
      }))
    }

    if (cartItems.length === 0) {
      throw new ApiError(400, 'No cart items found in session')
    }

    // Calculate totals
    const itemsPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const taxPrice = session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0
    const shippingPrice = session.shipping_cost?.amount_total
      ? session.shipping_cost.amount_total / 100
      : 0
    const totalAmount = itemsPrice + taxPrice + shippingPrice

    // Extract shipping address
    let shippingAddress = {}
    if (session.shipping_details) {
      shippingAddress = {
        address: session.shipping_details.address.line1,
        address2: session.shipping_details.address.line2 || '',
        city: session.shipping_details.address.city,
        state: session.shipping_details.address.state,
        postalCode: session.shipping_details.address.postal_code,
        country: session.shipping_details.address.country,
      }
    } else if (session.metadata?.shippingAddress) {
      try {
        shippingAddress = JSON.parse(session.metadata.shippingAddress)
      } catch (parseError) {
        console.error('Error parsing shipping address from metadata:', parseError)
      }
    }

    // Create order data
    const orderData = {
      user: orderUserId,
      orderItems: cartItems,
      shippingAddress,
      paymentMethod: 'stripe',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalAmount,
      isPaid: session.payment_status === 'paid',
      paidAt: session.payment_status === 'paid' ? new Date() : undefined,
      paymentResult: {
        id: session.payment_intent,
        status: session.payment_status,
        update_time: new Date().toISOString(),
        email_address: session.customer_details?.email,
      },
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent,
    }

    // Create order
    const order = new Order(orderData)
    await order.save()

    // Populate product details
    await order.populate('orderItems.product', 'name images')
    await order.populate('user', 'name email')

    console.log('✅ Order created from Stripe session:', order._id)

    // Update inventory
    try {
      for (const item of cartItems) {
        await inventoryService.updateInventory(
          item.product,
          -item.quantity,
          'sale',
          order._id.toString()
        )
      }
    } catch (inventoryError) {
      console.error('Inventory update error:', inventoryError)
      // Don't fail the order creation if inventory update fails
    }

    // Clear user's cart
    try {
      await Cart.findOneAndUpdate({ user: orderUserId }, { $set: { items: [] } })
    } catch (cartError) {
      console.error('Cart clearance error:', cartError)
      // Don't fail the order creation if cart clearance fails
    }

    // Send confirmation email
    try {
      await emailService.sendOrderConfirmation(order)
    } catch (emailError) {
      console.error('Order confirmation email error:', emailError)
      // Don't fail the order creation if email fails
    }

    return order
  } catch (error) {
    console.error('❌ Error creating order from Stripe session:', error)
    throw new ApiError(500, `Failed to create order from session: ${error.message}`)
  }
})

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'usd', paymentMethodTypes = ['card'] } = req.body

  if (!amount || amount <= 0) {
    throw new ApiError(400, 'Valid amount is required')
  }

  const user = await User.findById(req.user.id).select('+stripeCustomerId')
  let stripeCustomerId = user.stripeCustomerId

  // Create customer if doesn't exist
  if (!stripeCustomerId) {
    const customer = await paymentService.createCustomer(user.email, user.name, {
      userId: user._id.toString(),
    })
    stripeCustomerId = customer.id
    user.stripeCustomerId = stripeCustomerId
    await user.save({ validateBeforeSave: false })
  }

  const paymentIntent = await paymentService.createPaymentIntent({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    customer: stripeCustomerId,
    metadata: {
      userId: req.user.id,
    },
  })

  res.json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    },
    message: 'Payment intent created successfully',
  })
})

// @desc    Confirm payment
// @route   POST /api/payments/confirm-payment
// @access  Private
export const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId, paymentMethodId } = req.body

  if (!paymentIntentId) {
    throw new ApiError(400, 'Payment intent ID is required')
  }

  const paymentIntent = await paymentService.confirmPaymentIntent(paymentIntentId, paymentMethodId)

  res.json({
    success: true,
    data: {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    },
    message: 'Payment confirmed successfully',
  })
})

// @desc    Get user payment methods
// @route   GET /api/payments/payment-methods
// @access  Private
export const getPaymentMethods = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+stripeCustomerId')

  if (!user.stripeCustomerId) {
    return res.json({
      success: true,
      data: {
        paymentMethods: [],
      },
    })
  }

  const paymentMethods = await paymentService.listCustomerPaymentMethods(user.stripeCustomerId)

  res.json({
    success: true,
    data: {
      paymentMethods: paymentMethods.data.map((method) => ({
        id: method.id,
        type: method.type,
        card: method.card
          ? {
              brand: method.card.brand,
              last4: method.card.last4,
              expMonth: method.card.exp_month,
              expYear: method.card.exp_year,
            }
          : null,
        billingDetails: method.billing_details,
        created: method.created,
      })),
    },
  })
})

// @desc    Add payment method
// @route   POST /api/payments/payment-methods
// @access  Private
export const addPaymentMethod = asyncHandler(async (req, res) => {
  const { paymentMethodId, billingDetails } = req.body

  if (!paymentMethodId) {
    throw new ApiError(400, 'Payment method ID is required')
  }

  const user = await User.findById(req.user.id).select('+stripeCustomerId')
  let stripeCustomerId = user.stripeCustomerId

  // Create customer if doesn't exist
  if (!stripeCustomerId) {
    const customer = await paymentService.createCustomer(user.email, user.name, {
      userId: user._id.toString(),
    })
    stripeCustomerId = customer.id
    user.stripeCustomerId = stripeCustomerId
    await user.save({ validateBeforeSave: false })
  }

  // Attach payment method to customer
  const paymentMethod = await paymentService.attachPaymentMethod(paymentMethodId, stripeCustomerId)

  // Update billing details if provided
  if (billingDetails) {
    await paymentService.updatePaymentMethod(paymentMethodId, {
      billing_details: billingDetails,
    })
  }

  res.json({
    success: true,
    data: {
      paymentMethod: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card
          ? {
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
              expMonth: paymentMethod.card.exp_month,
              expYear: paymentMethod.card.exp_year,
            }
          : null,
        billingDetails: paymentMethod.billing_details,
      },
    },
    message: 'Payment method added successfully',
  })
})

// @desc    Update payment method
// @route   PUT /api/payments/payment-methods/:methodId
// @access  Private
export const updatePaymentMethod = asyncHandler(async (req, res) => {
  const { methodId } = req.params
  const { billingDetails } = req.body

  if (!billingDetails) {
    throw new ApiError(400, 'Billing details are required')
  }

  const user = await User.findById(req.user.id).select('+stripeCustomerId')

  // Verify the payment method belongs to the user
  const paymentMethods = await paymentService.listCustomerPaymentMethods(user.stripeCustomerId)
  const userPaymentMethod = paymentMethods.data.find((method) => method.id === methodId)

  if (!userPaymentMethod) {
    throw new ApiError(404, 'Payment method not found')
  }

  const updatedPaymentMethod = await paymentService.updatePaymentMethod(methodId, {
    billing_details: billingDetails,
  })

  res.json({
    success: true,
    data: {
      paymentMethod: {
        id: updatedPaymentMethod.id,
        type: updatedPaymentMethod.type,
        card: updatedPaymentMethod.card
          ? {
              brand: updatedPaymentMethod.card.brand,
              last4: updatedPaymentMethod.card.last4,
              expMonth: updatedPaymentMethod.card.exp_month,
              expYear: updatedPaymentMethod.card.exp_year,
            }
          : null,
        billingDetails: updatedPaymentMethod.billing_details,
      },
    },
    message: 'Payment method updated successfully',
  })
})

// @desc    Delete payment method
// @route   DELETE /api/payments/payment-methods/:methodId
// @access  Private
export const deletePaymentMethod = asyncHandler(async (req, res) => {
  const { methodId } = req.params

  const user = await User.findById(req.user.id).select('+stripeCustomerId')

  // Verify the payment method belongs to the user
  const paymentMethods = await paymentService.listCustomerPaymentMethods(user.stripeCustomerId)
  const userPaymentMethod = paymentMethods.data.find((method) => method.id === methodId)

  if (!userPaymentMethod) {
    throw new ApiError(404, 'Payment method not found')
  }

  await paymentService.detachPaymentMethod(methodId)

  res.json({
    success: true,
    message: 'Payment method deleted successfully',
  })
})

// @desc    Set default payment method
// @route   PATCH /api/payments/payment-methods/:methodId/default
// @access  Private
export const setDefaultPaymentMethod = asyncHandler(async (req, res) => {
  const { methodId } = req.params

  const user = await User.findById(req.user.id).select('+stripeCustomerId')

  // Verify the payment method belongs to the user
  const paymentMethods = await paymentService.listCustomerPaymentMethods(user.stripeCustomerId)
  const userPaymentMethod = paymentMethods.data.find((method) => method.id === methodId)

  if (!userPaymentMethod) {
    throw new ApiError(404, 'Payment method not found')
  }

  await paymentService.updateCustomer(user.stripeCustomerId, {
    invoice_settings: {
      default_payment_method: methodId,
    },
  })

  res.json({
    success: true,
    message: 'Default payment method set successfully',
  })
})

// @desc    Get payment details by ID
// @route   GET /api/payments/:paymentId
// @access  Private
export const getPaymentDetails = asyncHandler(async (req, res) => {
  const { paymentId } = req.params

  const payment = await Payment.findById(paymentId).populate('order').populate('user', 'name email')

  if (!payment) {
    throw new ApiError(404, 'Payment not found')
  }

  // Check authorization
  if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to access this payment')
  }

  res.json({
    success: true,
    data: payment,
  })
})

// @desc    Get user payments with pagination
// @route   GET /api/payments
// @access  Private
export const getUserPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query

  const query = { user: req.user.id }
  if (status) {
    query.status = status
  }

  const payments = await Payment.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('order', 'orderNumber status totalAmount')
    .lean()

  const total = await Payment.countDocuments(query)

  res.json({
    success: true,
    data: payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

// @desc    Process refund
// @route   POST /api/payments/:paymentId/refund
// @access  Private/Admin
export const processRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params
  const { amount, reason, notes } = req.body

  const payment = await Payment.findById(paymentId).populate('order')
  if (!payment) {
    throw new ApiError(404, 'Payment not found')
  }

  if (!payment.isRefundable) {
    throw new ApiError(400, 'Payment cannot be refunded')
  }

  const refundAmount = amount || payment.amount

  // Process refund through Stripe
  const refund = await paymentService.createRefund(
    payment.paymentIntentId,
    Math.round(refundAmount * 100), // Convert to cents
    reason
  )

  // Update payment record
  payment.refunds.push({
    refundId: refund.id,
    amount: refundAmount,
    reason: refund.reason,
    status: refund.status,
    notes,
    processedBy: req.user.id,
    processedAt: new Date(),
  })

  await payment.save()

  // Update order status if fully refunded
  if (refundAmount === payment.amount) {
    await Order.findByIdAndUpdate(payment.order._id, {
      status: 'refunded',
      refundedAt: new Date(),
    })
  }

  res.json({
    success: true,
    data: {
      refund: {
        id: refund.id,
        amount: refundAmount,
        status: refund.status,
        reason: refund.reason,
      },
    },
    message: 'Refund processed successfully',
  })
})

// @desc    Get supported countries
// @route   GET /api/payments/supported-countries
// @access  Private
export const getSupportedCountries = asyncHandler(async (req, res) => {
  const countries = [
    { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
    { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'CA$' },
    { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$' },
    { code: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ' },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', symbol: 'ر.س' },
    { code: 'EG', name: 'Egypt', currency: 'EGP', symbol: 'ج.م' },
    { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
    { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
  ]

  res.json({
    success: true,
    data: countries,
  })
})

// Webhook handlers
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('🔄 Handling checkout.session.completed for session:', session.id)

    // Check if order already exists
    const existingOrder = await Order.findOne({ stripeSessionId: session.id })
    if (existingOrder) {
      console.log('✅ Order already exists for session:', session.id)
      return
    }

    // Create order from session
    await createOrderFromStripeSession(session)
    console.log('✅ Order created from webhook for session:', session.id)
  } catch (error) {
    console.error('❌ Error handling checkout.session.completed:', error)
    throw error
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    console.log('💰 Handling payment_intent.succeeded for:', paymentIntent.id)

    // Update payment record if exists
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id })
    if (payment) {
      payment.status = 'succeeded'
      await payment.save()
      console.log('✅ Payment record updated:', paymentIntent.id)
    }
  } catch (error) {
    console.error('❌ Error handling payment_intent.succeeded:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  try {
    console.log('❌ Handling payment_intent.payment_failed for:', paymentIntent.id)

    // Update payment record if exists
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id })
    if (payment) {
      payment.status = 'failed'
      payment.error = {
        code: paymentIntent.last_payment_error?.code,
        message: paymentIntent.last_payment_error?.message,
      }
      await payment.save()
      console.log('✅ Payment record marked as failed:', paymentIntent.id)
    }
  } catch (error) {
    console.error('❌ Error handling payment_intent.payment_failed:', error)
  }
}

async function handleChargeRefunded(charge) {
  try {
    console.log('🔄 Handling charge.refunded for:', charge.id)

    // Update payment record with refund information
    const payment = await Payment.findOne({ paymentIntentId: charge.payment_intent })
    if (payment) {
      // This would be handled by the refund API, but we can sync status here
      console.log('🔁 Sync refund status for payment:', charge.payment_intent)
    }
  } catch (error) {
    console.error('❌ Error handling charge.refunded:', error)
  }
}

// Export all functions - REMOVED DUPLICATE EXPORTS
// The functions are already exported individually above
