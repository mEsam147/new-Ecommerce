// controllers/paymentController.js
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import paymentService from '../services/paymentService.js'

const updateProductInventory = async (cartItems, session = null) => {
  try {
    console.log('🔄 Starting inventory update for', cartItems.length, 'items')

    const inventoryUpdates = []
    const outOfStockItems = []
    const lowStockAlerts = []

    for (const item of cartItems) {
      const productId = item.product._id || item.product
      const product = await Product.findById(productId).session(session)

      if (!product) {
        console.warn('⚠️ Product not found:', productId)
        outOfStockItems.push(`Product ID: ${productId}`)
        continue
      }

      if (!product.isActive) {
        outOfStockItems.push(product.title)
        continue
      }

      let availableStock = product.inventory.quantity
      let variantToUpdate = null
      let variantIndex = -1

      // Check variant stock if variant data exists
      if (item.variant && (item.variant.size || item.variant.color)) {
        variantIndex = product.variants.findIndex((v) => {
          const sizeMatch = !item.variant.size || v.size === item.variant.size
          const colorMatch = !item.variant.color || v.color === item.variant.color
          return sizeMatch && colorMatch
        })

        if (variantIndex !== -1) {
          variantToUpdate = product.variants[variantIndex]
          availableStock = variantToUpdate.stock
          console.log(
            `🎨 Checking variant stock for ${product.title}: ${variantToUpdate.size}/${variantToUpdate.color} - Available: ${availableStock}, Needed: ${item.quantity}`
          )
        } else {
          console.warn(`⚠️ Variant not found for product ${product.title}:`, item.variant)
          outOfStockItems.push(`${product.title} - Variant not found`)
          continue
        }
      } else {
        console.log(
          `📦 Checking general stock for ${product.title}: Available: ${availableStock}, Needed: ${item.quantity}`
        )
      }

      // Check stock availability
      if (availableStock < item.quantity) {
        const itemName = variantToUpdate
          ? `${product.title} (${variantToUpdate.size}/${variantToUpdate.color})`
          : product.title

        outOfStockItems.push(
          `${itemName} - Available: ${availableStock}, Requested: ${item.quantity}`
        )
        continue
      }

      // Prepare inventory update
      inventoryUpdates.push({
        product,
        variant: variantToUpdate,
        quantity: item.quantity,
        variantIndex,
        itemName: variantToUpdate
          ? `${product.title} (${variantToUpdate.size}/${variantToUpdate.color})`
          : product.title,
      })
    }

    // If any items are out of stock, throw error
    if (outOfStockItems.length > 0) {
      throw new ApiError(400, `Some items are out of stock: ${outOfStockItems.join(', ')}`)
    }

    // Process all inventory updates
    for (const update of inventoryUpdates) {
      const { product, variant, quantity, variantIndex, itemName } = update

      // Update variant stock if applicable
      if (variant && variantIndex !== -1) {
        const oldVariantStock = product.variants[variantIndex].stock
        product.variants[variantIndex].stock -= quantity

        console.log(
          `🎨 Variant stock updated: ${itemName}: ${oldVariantStock} -> ${product.variants[variantIndex].stock}`
        )

        // Check variant low stock
        if (product.variants[variantIndex].stock <= product.inventory.lowStockAlert) {
          lowStockAlerts.push({
            product: product.title,
            variant: `${variant.size}/${variant.color}`,
            remaining: product.variants[variantIndex].stock,
            type: 'variant',
          })
        }
      }

      // Update general inventory if tracking is enabled
      if (product.inventory.trackQuantity) {
        const oldStock = product.inventory.quantity
        product.inventory.quantity -= quantity
        product.salesCount += quantity

        console.log(
          `📦 General inventory updated: ${product.title}: ${oldStock} -> ${product.inventory.quantity}`
        )

        // Check general inventory low stock
        if (product.inventory.quantity <= product.inventory.lowStockAlert) {
          lowStockAlerts.push({
            product: product.title,
            remaining: product.inventory.quantity,
            type: 'general',
          })
        }
      }

      await product.save({ session })
      console.log(`✅ Inventory updated for ${itemName}`)
    }

    // Log low stock alerts
    if (lowStockAlerts.length > 0) {
      console.log('⚠️ Low stock alerts:')
      lowStockAlerts.forEach((alert) => {
        if (alert.type === 'variant') {
          console.log(`   ${alert.product} - ${alert.variant}: ${alert.remaining} remaining`)
        } else {
          console.log(`   ${alert.product}: ${alert.remaining} remaining`)
        }
      })
    }

    console.log('✅ All inventory updates completed successfully')
    return { success: true, lowStockAlerts }
  } catch (error) {
    console.error('❌ Error updating product inventory:', error)
    throw error
  }
}

// Helper function to validate cart items before payment
// Helper function to validate cart items before payment
const validateCartItems = async (cart) => {
  try {
    console.log('🔍 Validating cart items before payment...')

    const validationErrors = []
    const validItems = []

    for (const cartItem of cart.items) {
      const product = cartItem.product

      if (!product) {
        validationErrors.push(`Product not found for item: ${cartItem._id}`)
        continue
      }

      if (!product.isActive) {
        validationErrors.push(`Product "${product.title}" is not active`)
        continue
      }

      let availableStock = product.inventory.quantity
      let stockType = 'general'
      let variantInfo = null

      // Check variant stock if variant is selected
      if (cartItem.variant && (cartItem.variant.size || cartItem.variant.color)) {
        const variant = product.variants.find(
          (v) => v.size === cartItem.variant.size && v.color === cartItem.variant.color
        )

        if (variant) {
          availableStock = variant.stock
          stockType = `variant (${variant.size}/${variant.color})`
          variantInfo = variant
        } else {
          validationErrors.push(
            `Variant not found for "${product.title}" - Size: ${cartItem.variant.size}, Color: ${cartItem.variant.color}`
          )
          continue
        }
      }

      // Check stock availability
      if (availableStock < cartItem.quantity) {
        validationErrors.push(
          `Not enough stock for "${product.title}" (${stockType}). Available: ${availableStock}, Requested: ${cartItem.quantity}`
        )
        continue
      }

      // Check if price has changed - use variant price if available, otherwise product price
      const currentPrice = variantInfo && variantInfo.price ? variantInfo.price : product.price
      if (currentPrice !== cartItem.price) {
        console.warn(
          `💰 Price changed for "${product.title}": Was ${cartItem.price}, Now ${currentPrice}`
        )
        // Update cart item price to current price
        cartItem.price = currentPrice
      }

      validItems.push(cartItem)
    }

    if (validationErrors.length > 0) {
      throw new ApiError(400, `Cart validation failed: ${validationErrors.join('; ')}`)
    }

    if (validItems.length === 0) {
      throw new ApiError(400, 'No valid items in cart')
    }

    console.log(`✅ Cart validation passed: ${validItems.length} valid items`)
    return validItems
  } catch (error) {
    console.error('❌ Cart validation error:', error)
    throw error
  }
}

// Helper function to create order from session with transaction
// Helper function to create order from session with transaction
const createOrderFromSession = async (session) => {
  let mongooseSession = null

  try {
    // Start mongoose transaction
    mongooseSession = await mongoose.startSession()
    mongooseSession.startTransaction()

    const userId = session.metadata.userId
    const cartId = session.metadata.cartId

    console.log('🛒 Creating order from session for user:', userId, 'cart:', cartId)
    console.log('📦 Session metadata:', session.metadata)
    console.log('💰 Payment status:', session.payment_status)

    // Get user and cart within transaction
    const user = await User.findById(userId).session(mongooseSession)
    if (!user) {
      throw new Error('User not found')
    }

    const cart = await Cart.findById(cartId)
      .populate('items.product', 'title images price variants inventory isActive')
      .session(mongooseSession)

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty or not found')
    }

    console.log('🛒 Cart items:', cart.items.length)

    // Log each cart item for debugging
    cart.items.forEach((item, index) => {
      console.log(`📦 Item ${index + 1}:`, {
        product: item.product?.title,
        quantity: item.quantity,
        variant: item.variant,
        price: item.price,
      })
    })

    // Validate cart items one more time before processing
    const validItems = await validateCartItems(cart)

    // Calculate total amount from session or cart
    const totalAmount = session.amount_total ? session.amount_total / 100 : cart.totalPrice

    // Create order items
    const orderItems = validItems.map((item) => {
      const itemName =
        item.variant && (item.variant.size || item.variant.color)
          ? `${item.product.title} - ${item.variant.size} ${item.variant.color}`
          : item.product.title

      return {
        product: item.product._id,
        variant: item.variant,
        name: itemName,
        image:
          item.product.images.find((img) => img.isPrimary)?.url ||
          item.product.images[0]?.url ||
          '',
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
        sku: item.variant?.sku || item.product.sku,
      }
    })

    console.log('✅ Order items prepared:', orderItems.length)

    // Update product inventory (this will throw error if any items are out of stock)
    console.log('🔄 Starting inventory update...')
    const inventoryResult = await updateProductInventory(validItems, mongooseSession)
    console.log('✅ Inventory update completed')

    // Calculate pricing
    const itemsPrice = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const shippingPrice = session.shipping_cost ? session.shipping_cost.amount_total / 100 : 0
    const taxPrice = session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: {
        name: session.customer_details?.name || user.name,
        street: session.shipping?.address?.line1 || '',
        city: session.shipping?.address?.city || '',
        state: session.shipping?.address?.state || '',
        zipCode: session.shipping?.address?.postal_code || '',
        country: session.shipping?.address?.country || '',
      },
      contactInfo: {
        email: session.customer_details?.email || user.email,
        phone: session.customer_details?.phone || '',
      },
      paymentMethod: 'stripe',
      paymentResult: {
        id: session.payment_intent,
        status: session.payment_status,
        payment_intent: session.payment_intent,
        session_id: session.id,
        receipt_url: session.receipt_url,
      },
      pricing: {
        itemsPrice: itemsPrice,
        shippingPrice: shippingPrice,
        taxPrice: taxPrice,
        totalPrice: totalAmount,
      },
      status: 'confirmed',
      isPaid: true,
      paidAt: new Date(),
      metadata: {
        stripe_session_id: session.id,
        low_stock_alerts: inventoryResult.lowStockAlerts,
      },
    })

    await order.save({ session: mongooseSession })
    console.log('✅ Order created successfully:', order._id)

    // Clear the cart
    await Cart.findByIdAndUpdate(
      cartId,
      {
        items: [],
        totalPrice: 0,
        totalItems: 0,
        $unset: { appliedCoupon: 1 }, // Remove applied coupon
      },
      { session: mongooseSession }
    )
    console.log('✅ Cart cleared successfully')

    // Commit transaction
    await mongooseSession.commitTransaction()
    console.log('✅ Transaction committed successfully')

    return order
  } catch (error) {
    // Abort transaction on error
    if (mongooseSession) {
      await mongooseSession.abortTransaction()
      console.log('❌ Transaction aborted due to error')
    }
    console.error('❌ Error in createOrderFromSession:', error)
    throw error
  } finally {
    // End session
    if (mongooseSession) {
      mongooseSession.endSession()
    }
  }
}

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
// controllers/paymentController.js
// ... other imports and code ...

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
export const createStripeCheckoutSession = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id
    const {
      successUrl = `${process.env.CLIENT_URL}/checkout/success`,
      cancelUrl = `${process.env.CLIENT_URL}/cart`,
      shippingAddress,
    } = req.body

    console.log('💳 Creating checkout session for user:', userId)

    // Get user's cart with product details
    const cart = await Cart.findOne({ user: userId }).populate(
      'items.product',
      'title images price inventory isActive variants'
    )

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty')
    }

    // Validate cart items before creating payment session
    const validItems = await validateCartItems(cart)

    // Prepare line items for Stripe
    let totalAmount = 0
    const lineItems = []

    for (const cartItem of validItems) {
      const product = cartItem.product
      const itemTotal = cartItem.price * cartItem.quantity
      totalAmount += itemTotal

      // Build product name with variant information if available
      let productName = product.title
      if (cartItem.variant && (cartItem.variant.size || cartItem.variant.color)) {
        const variantParts = []
        if (cartItem.variant.size) variantParts.push(cartItem.variant.size)
        if (cartItem.variant.color) variantParts.push(cartItem.variant.color)
        productName += ` - ${variantParts.join(' / ')}`
      }

      // Prepare product metadata
      const productMetadata = {
        productId: product._id.toString(),
      }

      // Add variant information to metadata if available
      if (cartItem.variant) {
        if (cartItem.variant.size) {
          productMetadata.variantSize = cartItem.variant.size
        }
        if (cartItem.variant.color) {
          productMetadata.variantColor = cartItem.variant.color
        }
      }

      // Get primary image or first image
      let productImage = ''
      if (product.images && product.images.length > 0) {
        const primaryImage = product.images.find((img) => img.isPrimary)
        productImage = primaryImage ? primaryImage.url : product.images[0].url
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            images: productImage ? [productImage] : [],
            metadata: productMetadata,
          },
          unit_amount: Math.round(cartItem.price * 100), // Convert to cents
        },
        quantity: cartItem.quantity,
      })
    }

    // Add shipping cost if applicable
    const shippingCost = totalAmount > 100 ? 0 : 10 // Free shipping over $100
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping Fee',
            description: 'Standard shipping',
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      })
      totalAmount += shippingCost
    }

    // Add tax (example: 8% tax)
    const taxAmount = totalAmount * 0.08
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Sales Tax',
          description: '8% sales tax',
        },
        unit_amount: Math.round(taxAmount * 100),
      },
      quantity: 1,
    })
    totalAmount += taxAmount

    // Get or create Stripe customer
    let user = await User.findById(userId)
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      console.log('👤 Creating new Stripe customer for user:', user.email)
      const customer = await paymentService.createCustomer(user.email, user.name, {
        userId: user._id.toString(),
      })
      stripeCustomerId = customer.id
      user.stripeCustomerId = stripeCustomerId
      await user.save({ validateBeforeSave: false })
      console.log('✅ Stripe customer created:', stripeCustomerId)
    }

    // Prepare metadata for the checkout session
    const metadata = {
      userId: userId,
      cartId: cart._id.toString(),
      totalItems: validItems.length.toString(),
    }

    // Add shipping address to metadata if provided
    if (shippingAddress) {
      metadata.shippingAddress = JSON.stringify(shippingAddress)
    }

    // Prepare shipping options if address is provided
    let shippingOptions = []
    if (shippingAddress) {
      shippingOptions = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: shippingCost > 0 ? Math.round(shippingCost * 100) : 0,
              currency: 'usd',
            },
            display_name: shippingCost > 0 ? 'Standard Shipping' : 'Free Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ]
    }

    // Create checkout session
    console.log('🛍️ Creating Stripe checkout session...')
    console.log('🛍️ Creating Stripe checkout session...')
    const session = await paymentService.createCheckoutSession({
      customerId: stripeCustomerId, // Only pass customerId, NOT customerEmail
      lineItems,
      successUrl: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl,
      metadata: metadata,
      shippingAddressCollection: {
        allowed_countries: ['US', 'GB', 'CA', 'AU', 'AE', 'SA', 'EG'], // Your supported countries
      },
      // Remove customerEmail from here since we're using customerId
      mode: 'payment',
      allowPromotionCodes: true,
    })

    console.log('✅ Checkout session created:', session.id)

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        amount: totalAmount,
        itemsCount: validItems.length,
      },
      message: 'Checkout session created successfully',
    })
  } catch (error) {
    console.error('❌ Error in createStripeCheckoutSession:', error)

    // Send more specific error messages to the client
    if (error.message.includes('Cart validation failed')) {
      throw new ApiError(400, error.message)
    } else if (error.message.includes('Stripe')) {
      throw new ApiError(500, 'Payment service temporarily unavailable. Please try again.')
    } else {
      throw error
    }
  }
})

// ... rest of the code ...

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = paymentService.constructWebhookEvent(req.body, sig)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log('📩 Stripe webhook event received:', event.type)

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        console.log('✅ Payment completed for session:', session.id)

        // Only process if payment was successful
        if (session.payment_status === 'paid') {
          try {
            const order = await createOrderFromSession(session)
            console.log('✅ Order processing completed successfully. Order ID:', order._id)

            // Here you can:
            // 1. Send confirmation email to customer
            // 2. Send low stock alerts to admin
            // 3. Update analytics
            // 4. Trigger any post-purchase workflows
          } catch (error) {
            console.error('❌ Error processing order:', error)
            // Critical: Payment succeeded but order creation failed
            // You should:
            // 1. Send alert to admin
            // 2. Log the error for investigation
            // 3. Possibly initiate refund or manual intervention
          }
        } else {
          console.log('⚠️ Session completed but payment not paid. Status:', session.payment_status)
        }
        break

      case 'checkout.session.expired':
        const expiredSession = event.data.object
        console.log('⏰ Checkout session expired:', expiredSession.id)
        break

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        console.log('💰 Payment intent succeeded:', paymentIntent.id)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        console.log(
          '💥 Payment failed:',
          failedPayment.id,
          failedPayment.last_payment_error?.message
        )
        break

      case 'invoice.payment_succeeded':
        console.log('📄 Invoice payment succeeded')
        break

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

// @desc    Get session status
// @route   GET /api/payments/session/:sessionId
// @access  Private
export const getSessionStatus = asyncHandler(async (req, res) => {
  const { sessionId } = req.params

  console.log('🔍 Getting session status for sessionId:', sessionId)
  console.log('👤 Current user ID:', req.user.id)

  try {
    // Retrieve the session from Stripe
    const session = await paymentService.retrieveCheckoutSession(sessionId)

    console.log('💰 Session details:', {
      sessionId: session.id,
      customer: session.customer,
      paymentStatus: session.payment_status,
      status: session.status,
      metadata: session.metadata,
    })

    // Get current user with Stripe customer ID
    const user = await User.findById(req.user.id).select('+stripeCustomerId')
    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    console.log('👤 User Stripe customer ID:', user.stripeCustomerId)

    // Enhanced authorization check
    let isAuthorized = false

    // Check 1: Compare Stripe customer IDs
    if (session.customer && user.stripeCustomerId && session.customer === user.stripeCustomerId) {
      isAuthorized = true
      console.log('✅ Authorized via Stripe customer ID match')
    }
    // Check 2: Check metadata user ID
    else if (session.metadata && session.metadata.userId === req.user.id) {
      isAuthorized = true
      console.log('✅ Authorized via metadata user ID match')
    }
    // Check 3: If session has no customer but has customer_email, check if it matches user email
    else if (!session.customer && session.customer_email) {
      const user = await User.findById(req.user.id)
      if (user && session.customer_email === user.email) {
        isAuthorized = true
        console.log('✅ Authorized via email match')
      }
    }

    if (!isAuthorized) {
      console.log('❌ Authorization failed:', {
        sessionCustomer: session.customer,
        userStripeCustomer: user.stripeCustomerId,
        metadataUserId: session.metadata?.userId,
        currentUserId: req.user.id,
      })
      throw new ApiError(403, 'Not authorized to access this session')
    }

    // Find associated order
    const order = await Order.findOne({
      $or: [{ 'paymentResult.session_id': sessionId }, { 'metadata.stripe_session_id': sessionId }],
      user: req.user.id,
    })

    console.log('📦 Found order:', order ? order._id : 'No order found')

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email || session.customer_email,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        shipping: session.shipping_details,
        order: order
          ? {
              id: order._id,
              status: order.status,
              items: order.items,
              totalPrice: order.pricing.totalPrice,
              orderNumber: order.orderNumber,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('❌ Error in getSessionStatus:', error)

    // Provide more specific error messages
    if (error.message.includes('No such checkout session')) {
      throw new ApiError(404, 'Session not found')
    } else if (error.message.includes('Not authorized')) {
      throw error // Re-throw the authorization error
    } else {
      throw new ApiError(500, 'Failed to retrieve session status')
    }
  }
})

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

// @desc    Refund payment
// @route   POST /api/payments/refund
// @access  Private (Admin)
export const refundPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId, amount, reason } = req.body

  try {
    const refund = await paymentService.createRefund(paymentIntentId, amount, reason)

    // Update order status to refunded
    await Order.findOneAndUpdate(
      { 'paymentResult.payment_intent': paymentIntentId },
      {
        status: 'refunded',
        refundedAt: new Date(),
        refundDetails: {
          amount: refund.amount / 100,
          reason: refund.reason,
          refundId: refund.id,
          status: refund.status,
        },
      }
    )

    res.json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
      message: 'Refund processed successfully',
    })
  } catch (error) {
    console.error('❌ Error processing refund:', error)
    throw new ApiError(500, 'Failed to process refund')
  }
})

// controllers/paymentController.js - IMPROVED decrementInventoryDirectly
export const decrementInventoryDirectly = asyncHandler(async (req, res) => {
  let { sessionId } = req.body

  try {
    console.log('🔄 Direct inventory decrement requested')
    console.log('🎯 Raw sessionId from request:', sessionId)

    // Validate session ID
    if (!sessionId || typeof sessionId !== 'string') {
      throw new ApiError(400, 'Session ID is required and must be a string')
    }

    sessionId = sessionId.trim()

    if (!sessionId.startsWith('cs_')) {
      throw new ApiError(400, `Invalid session ID format. Must start with 'cs_'.`)
    }

    console.log('🎯 Processing session:', sessionId)

    // First, try to get session status using the same method that works
    let session
    try {
      session = await paymentService.retrieveCheckoutSession(sessionId)
    } catch (stripeError) {
      console.error('❌ Stripe session retrieval failed:', stripeError.message)

      // If Stripe fails, try to use the existing order from getSessionStatus
      const existingOrder = await Order.findOne({
        'paymentResult.session_id': sessionId,
      }).populate('items.product')

      if (existingOrder) {
        console.log('📦 Using existing order instead of Stripe session:', existingOrder._id)
        return res.json({
          success: true,
          data: {
            order: existingOrder,
            usedExisting: true,
          },
          message: 'Used existing order data',
        })
      }

      throw new ApiError(400, `Cannot process session: ${stripeError.message}`)
    }

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      throw new ApiError(400, `Payment not completed. Status: ${session.payment_status}`)
    }

    console.log('💰 Payment status confirmed:', session.payment_status)

    // Verify session belongs to user
    if (!session.metadata || !session.metadata.userId) {
      throw new ApiError(400, 'Session metadata missing user ID')
    }

    if (session.metadata.userId !== req.user.id) {
      throw new ApiError(403, 'Not authorized to access this session')
    }

    console.log('👤 User authorized:', req.user.id)

    // Check if order already exists to avoid duplicates
    const existingOrder = await Order.findOne({
      'paymentResult.session_id': sessionId,
    })

    if (existingOrder) {
      console.log('📦 Order already exists:', existingOrder._id)

      // Still update inventory if order exists but inventory wasn't updated
      await updateInventoryFromOrder(existingOrder)

      return res.json({
        success: true,
        data: {
          order: existingOrder,
          existing: true,
        },
        message: 'Order already processed, inventory updated',
      })
    }

    // Create order and decrement inventory
    console.log('🛒 Creating new order...')
    const order = await createOrderFromSession(session)

    console.log('✅ Direct inventory decrement successful. Order:', order._id)

    res.json({
      success: true,
      data: {
        order: {
          id: order._id,
          items: order.items,
          totalPrice: order.pricing.totalPrice,
          status: order.status,
        },
      },
      message: 'Inventory updated successfully',
    })
  } catch (error) {
    console.error('❌ Direct inventory decrement failed:', error.message)

    // More specific error handling
    if (error.message.includes('Session not found') || error.message.includes('Invalid session')) {
      throw new ApiError(400, `Session not found or invalid: ${sessionId}`)
    } else if (error.message.includes('Not authorized')) {
      throw new ApiError(403, 'Not authorized to process this session')
    } else {
      throw new ApiError(500, `Failed to update inventory: ${error.message}`)
    }
  }
})

// Helper function to update inventory from existing order
const updateInventoryFromOrder = async (order) => {
  try {
    console.log('🔄 Updating inventory from existing order:', order._id)

    for (const item of order.items) {
      const product = await Product.findById(item.product)
      if (!product) continue

      // Check if inventory needs updating
      const currentStock = product.inventory.quantity
      const expectedStock = currentStock + item.quantity // If inventory wasn't decremented

      if (expectedStock > currentStock) {
        console.log(
          `📦 Updating inventory for ${product.title}: ${currentStock} -> ${
            currentStock - item.quantity
          }`
        )
        product.inventory.quantity -= item.quantity
        await product.save()
      }
    }

    console.log('✅ Inventory updated from existing order')
  } catch (error) {
    console.error('❌ Error updating inventory from order:', error)
    throw error
  }
}
