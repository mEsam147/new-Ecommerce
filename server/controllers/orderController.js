// controllers/orderController.js
import Order from '../models/Order.js'
import Payment from '../models/Payment.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import Coupon from '../models/Coupon.js'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiFeatures from '../utils/apiFeatures.js'
import emailService from '../services/emailService.js'
import inventoryService from '../services/inventoryService.js'
import paymentService from '../services/paymentService.js'
import mongoose from 'mongoose'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
// controllers/orderController.js - Improved createOrder
export const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingAddress,
    billingAddress,
    paymentMethod,
    couponCode,
    customerNotes,
    shippingMethod = 'standard',
  } = req.body

  const userId = req.user.id

  // Validate required fields
  if (!shippingAddress) {
    throw new ApiError(400, 'Shipping address is required')
  }

  if (!paymentMethod) {
    throw new ApiError(400, 'Payment method is required')
  }

  // Validate shipping address structure
  if (
    !shippingAddress.name ||
    !shippingAddress.street ||
    !shippingAddress.city ||
    !shippingAddress.state ||
    !shippingAddress.zipCode
  ) {
    throw new ApiError(
      400,
      'Complete shipping address (name, street, city, state, zipCode) is required'
    )
  }

  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    // Get user's cart with product details
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'title images price variants inventory isActive weight sku')
      .session(session)

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty')
    }

    // Validate cart items and inventory
    const validationResult = await inventoryService.validateCartItems(cart.items)
    if (!validationResult.isValid) {
      throw new ApiError(400, `Inventory validation failed: ${validationResult.errors.join(', ')}`)
    }

    // Calculate pricing
    const pricing = await calculateOrderPricing(
      validationResult.validItems,
      shippingMethod,
      couponCode,
      userId
    )

    // Build order items with proper validation
    const orderItems = validationResult.validItems.map((item) => {
      const orderItem = {
        product: item.product._id,
        variant: item.variant || {},
        name: item.product.title,
        image: item.product.images.find((img) => img.isPrimary)?.url || item.product.images[0]?.url,
        price: Number(item.price),
        quantity: Number(item.quantity),
        totalPrice: Number(item.price) * Number(item.quantity),
        weight: item.product.weight || 0,
        sku: item.variant?.sku || item.product.sku,
      }

      // Validate required fields
      if (!orderItem.name || !orderItem.image || !orderItem.price || !orderItem.quantity) {
        throw new ApiError(400, `Invalid item data for product: ${item.product.title}`)
      }

      return orderItem
    })

    // Create order with all required fields
    const orderData = {
      user: userId,
      items: orderItems,
      shipping: {
        method: shippingMethod,
        cost: pricing.shipping,
        address: {
          name: shippingAddress.name,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country || 'US',
          phone: shippingAddress.phone || '',
        },
      },
      billingAddress: billingAddress || {
        name: shippingAddress.name,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country || 'US',
        phone: shippingAddress.phone || '',
      },
      pricing: {
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
        tax: pricing.tax,
        discount: pricing.discount,
        total: pricing.total,
        currency: pricing.currency,
      },
      payment: {
        method: paymentMethod,
        status: 'pending',
        amount: pricing.total,
        currency: 'USD',
      },
      customerNotes: customerNotes || '',
      fraudCheck: {
        status: 'pending',
        score: await calculateFraudScore(req.user, shippingAddress, pricing.total),
      },
    }

    console.log('Creating order with data:', JSON.stringify(orderData, null, 2))

    const order = new Order(orderData)

    // Validate the order before saving
    const validationError = order.validateSync()
    if (validationError) {
      const errors = Object.values(validationError.errors).map((err) => err.message)
      console.error('Order validation errors:', errors)
      throw new ApiError(400, `Order validation failed: ${errors.join(', ')}`)
    }

    await order.save({ session })

    // Rest of your existing code for inventory reservation, cart clearing, etc.
    await inventoryService.reserveInventory(validationResult.validItems, session)

    // Clear cart
    await Cart.findByIdAndUpdate(
      cart._id,
      { items: [], totalPrice: 0, totalItems: 0, $unset: { appliedCoupon: 1 } },
      { session }
    )

    // Handle payment intent creation
    let paymentIntent = null
    if (paymentMethod === 'stripe') {
      paymentIntent = await paymentService.createPaymentIntent({
        amount: Math.round(pricing.total * 100),
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
          userId: userId,
        },
        receipt_email: req.user.email,
        description: `Order ${order.orderNumber}`,
      })

      order.payment.paymentIntentId = paymentIntent.id
      await order.save({ session })
    }

    await session.commitTransaction()

    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmation(req.user.email, req.user.name, order)
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError)
    }

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
      paymentIntent: paymentIntent
        ? {
            clientSecret: paymentIntent.client_secret,
          }
        : null,
    })
  } catch (error) {
    await session.abortTransaction()
    console.error('Order creation error:', error)

    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message)
      throw new ApiError(400, `Validation failed: ${errors.join(', ')}`)
    }

    throw error
  } finally {
    session.endSession()
  }
})

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query

  const query = { user: req.user.id }
  if (status) query.status = status

  const features = new ApiFeatures(Order.find(query), req.query).filter().sort(sort).paginate()

  const orders = await features.query.populate('items.product', 'title images slug').lean()

  const total = await Order.countDocuments(query)

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

export const getOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    // Validate order ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid order ID')
    }

    // Find order with minimal population and safe options
    const order = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate({
        path: 'items.product',
        select: 'title images slug description price inventory', // Select only needed fields
        options: {
          // Disable virtuals for populated products to avoid the error
          virtuals: false,
        },
      })
      .populate('statusHistory.updatedBy', 'name')
      .lean({ virtuals: false }) // Disable virtuals to prevent the error

    if (!order) {
      throw new ApiError(404, 'Order not found')
    }

    // Check authorization
    const orderUserId = order.user?._id?.toString() || order.user?.toString()

    if (orderUserId !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to access this order')
    }

    // Manually clean up the order data to ensure no virtuals cause issues
    const safeOrderData = JSON.parse(JSON.stringify(order))

    res.json({
      success: true,
      data: safeOrderData,
    })
  } catch (error) {
    console.error('Error in getOrder controller:', error)

    if (error instanceof ApiError) {
      throw error
    }

    // If it's the virtual property error, provide a more specific message
    if (error.message?.includes('filter') || error.stack?.includes('filter')) {
      throw new ApiError(500, 'Error processing order data. Please try again.')
    }

    throw new ApiError(500, 'Internal server error while fetching order')
  }
})
// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search, sort = '-createdAt' } = req.query

  const query = {}
  if (status) query.status = status
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shipping.address.name': { $regex: search, $options: 'i' } },
      { 'shipping.address.email': { $regex: search, $options: 'i' } },
    ]
  }

  const features = new ApiFeatures(Order.find(query), req.query).filter().sort(sort).paginate()

  const orders = await features.query
    .populate('user', 'name email')
    .populate('items.product', 'title images')
    .lean()

  const total = await Order.countDocuments(query)

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body

  const order = await Order.findById(req.params.id)
  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  await order.updateStatus(status, note, req.user.id)

  // Send status update email
  if (order.user) {
    const user = await User.findById(order.user)
    if (user) {
      await emailService.sendOrderStatusUpdate(user.email, user.name, order, status)
    }
  }

  res.json({
    success: true,
    data: order,
    message: 'Order status updated successfully',
  })
})

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
// controllers/orderController.js - Fixed cancelOrder function
// controllers/orderController.js - Fixed cancelOrder function
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body

  // Find order with proper population
  const order = await Order.findById(req.params.id).populate('user', '_id name email')

  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  console.log('Current order status:', order.status)

  // Check authorization
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to cancel this order')
  }

  // Check if order is already cancelled
  if (order.status === 'cancelled') {
    return res.json({
      success: true,
      data: order,
      message: 'Order is already cancelled',
    })
  }

  // Define cancellable statuses
  const cancellableStatuses = ['pending', 'confirmed', 'processing']

  // Check if order can be cancelled
  if (!cancellableStatuses.includes(order.status)) {
    throw new ApiError(400, `Order cannot be cancelled. Current status: ${order.status}`)
  }

  try {
    // Update order status
    if (typeof order.updateStatus === 'function') {
      await order.updateStatus('cancelled', reason || 'Order cancelled by user', req.user.id)
    } else {
      // Fallback if updateStatus method doesn't exist
      order.status = 'cancelled'
      order.cancellationReason = reason || 'Order cancelled by user'

      // Add to status history
      if (!order.statusHistory) {
        order.statusHistory = []
      }
      order.statusHistory.push({
        status: 'cancelled',
        note: reason || 'Order cancelled by user',
        updatedBy: req.user.id,
        timestamp: new Date(),
      })

      await order.save()
    }

    // Process refund if payment was completed
    if (
      order.payment &&
      order.payment.status === 'completed' &&
      order.pricing &&
      order.pricing.total > 0
    ) {
      try {
        const payment = await Payment.findOne({ order: order._id })
        if (payment) {
          if (typeof payment.processRefund === 'function') {
            await payment.processRefund(order.pricing.total, reason || 'order_cancelled')
          } else {
            console.log('Payment refund processing not available, updating payment status manually')
            payment.status = 'refunded'
            await payment.save()
          }
        }
      } catch (refundError) {
        console.error('Refund processing failed:', refundError)
        // Continue with cancellation even if refund fails
      }
    }

    // Send cancellation confirmation email
    try {
      if (order.user && order.user.email) {
        await emailService.sendOrderCancellationConfirmation(
          order.user.email,
          order.user.name,
          order,
          reason
        )
      }
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError)
    }

    // Get the updated order
    const updatedOrder = await Order.findById(order._id)

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order cancelled successfully',
    })
  } catch (error) {
    console.error('Error during order cancellation:', error)
    throw new ApiError(500, `Failed to cancel order: ${error.message}`)
  }
})

// @desc    Process order refund
// @route   POST /api/orders/:id/refund
// @access  Private/Admin
export const processRefund = asyncHandler(async (req, res) => {
  const { amount, reason, notes } = req.body

  const order = await Order.findById(req.params.id)
  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  if (!order.canBeRefunded) {
    throw new ApiError(400, 'Order cannot be refunded in its current state')
  }

  const refundAmount = amount || order.pricing.total
  const refund = await order.processRefund(refundAmount, reason)

  // Update payment record
  const payment = await Payment.findOne({ order: order._id })
  if (payment) {
    await payment.processRefund(refundAmount, reason, notes)
  }

  // Send refund confirmation email
  if (order.user) {
    const user = await User.findById(order.user)
    if (user) {
      await emailService.sendRefundConfirmation(user.email, user.name, order, refund)
    }
  }

  res.json({
    success: true,
    data: refund,
    message: 'Refund processed successfully',
  })
})

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  const { period = '30days', startDate, endDate } = req.query

  let dateRange = {}
  if (startDate && endDate) {
    dateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    }
  } else {
    const now = new Date()
    switch (period) {
      case '7days':
        dateRange.startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case '30days':
        dateRange.startDate = new Date(now.setDate(now.getDate() - 30))
        break
      case '90days':
        dateRange.startDate = new Date(now.setDate(now.getDate() - 90))
        break
      default:
        dateRange.startDate = new Date(now.setDate(now.getDate() - 30))
    }
    dateRange.endDate = new Date()
  }

  const [salesStats, statusStats, revenueTrend] = await Promise.all([
    Order.getSalesStats(dateRange.startDate, dateRange.endDate),
    Order.getOrdersByStatus(),
    getRevenueTrend(dateRange.startDate, dateRange.endDate),
  ])

  res.json({
    success: true,
    data: {
      overview: salesStats,
      byStatus: statusStats,
      revenueTrend,
      dateRange,
    },
  })
})

// @desc    Get order invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
export const getOrderInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'title sku')

  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  // Check authorization
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to access this order invoice')
  }

  // Create PDF invoice
  const doc = new PDFDocument({ margin: 50 })

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`)

  // Pipe PDF to response
  doc.pipe(res)

  // Add invoice content
  addInvoiceContent(doc, order)

  // Finalize PDF
  doc.end()
})

// @desc    Track order
// @route   GET /api/orders/:id/track
// @access  Private
export const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .select('orderNumber status shipping statusHistory createdAt')

  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  // Check authorization
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to track this order')
  }

  const trackingInfo = {
    orderNumber: order.orderNumber,
    status: order.status,
    shipping: order.shipping,
    statusHistory: order.statusHistory,
    estimatedDelivery: order.shipping.estimatedDelivery,
    createdAt: order.createdAt,
  }

  res.json({
    success: true,
    data: trackingInfo,
  })
})

// @desc    Request return
// @route   POST /api/orders/:id/return
// @access  Private
export const requestReturn = asyncHandler(async (req, res) => {
  const { items, reason, notes } = req.body

  const order = await Order.findById(req.params.id)
  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  // Check authorization
  if (order.user.toString() !== req.user.id) {
    throw new ApiError(403, 'Not authorized to request return for this order')
  }

  // Check if order can be returned
  if (!order.isDelivered) {
    throw new ApiError(400, 'Order must be delivered to request a return')
  }

  const deliveryDate = order.shipping.deliveredAt || order.updatedAt
  const returnPeriod = 30 // days
  const returnDeadline = new Date(deliveryDate.getTime() + returnPeriod * 24 * 60 * 60 * 1000)

  if (new Date() > returnDeadline) {
    throw new ApiError(400, 'Return period has expired')
  }

  // Validate return items
  const returnItems = items.map((item) => {
    const orderItem = order.items.id(item.itemId)
    if (!orderItem) {
      throw new ApiError(400, `Item ${item.itemId} not found in order`)
    }
    if (item.quantity > orderItem.quantity) {
      throw new ApiError(400, `Return quantity exceeds ordered quantity for ${orderItem.name}`)
    }
    return {
      itemId: item.itemId,
      product: orderItem.product,
      name: orderItem.name,
      quantity: item.quantity,
      price: orderItem.price,
      reason: item.reason,
    }
  })

  // Create return request
  const returnRequest = {
    requestId: `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    items: returnItems,
    reason,
    notes,
    status: 'pending',
    requestedAt: new Date(),
    totalAmount: returnItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }

  // Add return request to order
  if (!order.returnRequests) {
    order.returnRequests = []
  }
  order.returnRequests.push(returnRequest)

  await order.save()

  // Send return request notification
  try {
    const user = await User.findById(order.user)
    await emailService.sendReturnRequestConfirmation(user.email, user.name, order, returnRequest)
  } catch (emailError) {
    console.error('Failed to send return confirmation email:', emailError)
  }

  res.json({
    success: true,
    data: returnRequest,
    message: 'Return request submitted successfully',
  })
})

// @desc    Update shipping info
// @route   PUT /api/orders/:id/shipping
// @access  Private/Admin
export const updateShippingInfo = asyncHandler(async (req, res) => {
  const { trackingNumber, carrier, estimatedDelivery, notes } = req.body

  const order = await Order.findById(req.params.id)
  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  // Update shipping info
  if (trackingNumber) order.shipping.trackingNumber = trackingNumber
  if (carrier) order.shipping.carrier = carrier
  if (estimatedDelivery) order.shipping.estimatedDelivery = new Date(estimatedDelivery)

  // Generate tracking URL if not provided
  if (trackingNumber && carrier && !order.shipping.trackingUrl) {
    order.shipping.trackingUrl = generateTrackingUrl(carrier, trackingNumber)
  }

  await order.save()

  // Send shipping update email
  if (order.user && trackingNumber) {
    const user = await User.findById(order.user)
    if (user) {
      await emailService.sendShippingUpdate(user.email, user.name, order)
    }
  }

  res.json({
    success: true,
    data: order,
    message: 'Shipping information updated successfully',
  })
})

// Helper functions
async function calculateOrderPricing(items, shippingMethod, couponCode, userId) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  // Calculate shipping
  const shippingCost = calculateShippingCost(items, shippingMethod)

  // Calculate tax (simplified - in real app, use tax service)
  const taxRate = 0.08 // 8%
  const tax = subtotal * taxRate

  // Apply coupon
  let discount = 0
  if (couponCode) {
    try {
      const coupon = await Coupon.findValidCoupon(couponCode, userId, subtotal, items)
      discount = coupon.calculateDiscount(subtotal)
    } catch (error) {
      console.warn('Coupon validation failed:', error.message)
    }
  }

  const total = Math.max(0, subtotal + shippingCost + tax - discount)

  return {
    subtotal: Number(subtotal.toFixed(2)),
    shipping: Number(shippingCost.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    total: Number(total.toFixed(2)),
    currency: 'USD',
  }
}

function calculateShippingCost(items, method) {
  const totalWeight = items.reduce((total, item) => {
    const itemWeight = item.product?.weight || 0.5 // Default 0.5kg
    return total + itemWeight * item.quantity
  }, 0)

  const baseRates = {
    standard: 5 + totalWeight * 0.5,
    express: 15 + totalWeight * 1,
    overnight: 25 + totalWeight * 2,
    free: 0,
  }

  return Math.max(0, baseRates[method] || baseRates.standard)
}

async function calculateFraudScore(user, shippingAddress, orderAmount) {
  // Simple fraud scoring - in real app, integrate with fraud detection service
  let score = 50 // Neutral score

  // Check order amount
  if (orderAmount > 1000) score -= 10
  if (orderAmount > 5000) score -= 20

  // Check shipping address match
  if (user.defaultAddress) {
    const addressMatch =
      user.defaultAddress.street === shippingAddress.street &&
      user.defaultAddress.city === shippingAddress.city
    if (!addressMatch) score -= 15
  }

  // Check user order history
  const recentOrders = await Order.countDocuments({
    user: user._id,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })
  if (recentOrders > 5) score -= 10

  return Math.max(0, Math.min(100, score))
}

async function getRevenueTrend(startDate, endDate) {
  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['delivered', 'shipped', 'processing'] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
    },
  ])
}

function addInvoiceContent(doc, order) {
  // Header
  doc.fontSize(20).text('INVOICE', { align: 'center' })
  doc.moveDown()

  // Company Info
  doc.fontSize(12)
  doc.text('Your Company Name', 50, 100)
  doc.text('123 Business Street', 50, 115)
  doc.text('City, State 12345', 50, 130)
  doc.text('Email: info@company.com', 50, 145)
  doc.text('Phone: (555) 123-4567', 50, 160)

  // Invoice Details
  const invoiceTop = 100
  doc.text(`Invoice Number: ${order.orderNumber}`, 350, invoiceTop, { align: 'right' })
  doc.text(`Date: ${order.createdAt.toLocaleDateString()}`, 350, invoiceTop + 15, {
    align: 'right',
  })
  doc.text(`Status: ${order.status.toUpperCase()}`, 350, invoiceTop + 30, { align: 'right' })

  // Customer Info
  doc.moveDown(3)
  doc.text('BILL TO:', 50, 220)
  doc.text(order.shipping.address.name, 50, 235)
  doc.text(order.shipping.address.street, 50, 250)
  doc.text(
    `${order.shipping.address.city}, ${order.shipping.address.state} ${order.shipping.address.zipCode}`,
    50,
    265
  )
  if (order.shipping.address.phone) {
    doc.text(`Phone: ${order.shipping.address.phone}`, 50, 280)
  }

  // Line
  doc.moveTo(50, 320).lineTo(550, 320).stroke()

  // Table Header
  doc.text('Description', 50, 340)
  doc.text('Quantity', 350, 340)
  doc.text('Price', 450, 340)
  doc.text('Total', 500, 340)

  doc.moveTo(50, 360).lineTo(550, 360).stroke()

  // Items
  let yPosition = 380
  order.items.forEach((item) => {
    doc.text(item.name, 50, yPosition)
    doc.text(item.quantity.toString(), 350, yPosition)
    doc.text(`$${item.price.toFixed(2)}`, 450, yPosition)
    doc.text(`$${item.totalPrice.toFixed(2)}`, 500, yPosition)
    yPosition += 20
  })

  // Totals
  const totalsY = yPosition + 40
  doc
    .moveTo(50, totalsY - 20)
    .lineTo(550, totalsY - 20)
    .stroke()

  doc.text('Subtotal:', 400, totalsY)
  doc.text(`$${order.pricing.subtotal.toFixed(2)}`, 500, totalsY)

  doc.text('Shipping:', 400, totalsY + 20)
  doc.text(`$${order.pricing.shipping.toFixed(2)}`, 500, totalsY + 20)

  doc.text('Tax:', 400, totalsY + 40)
  doc.text(`$${order.pricing.tax.toFixed(2)}`, 500, totalsY + 40)

  if (order.pricing.discount > 0) {
    doc.text('Discount:', 400, totalsY + 60)
    doc.text(`-$${order.pricing.discount.toFixed(2)}`, 500, totalsY + 60)
  }

  doc
    .moveTo(400, totalsY + 80)
    .lineTo(550, totalsY + 80)
    .stroke()
  doc.fontSize(14).text('TOTAL:', 400, totalsY + 100)
  doc.text(`$${order.pricing.total.toFixed(2)}`, 500, totalsY + 100)

  // Footer
  doc.fontSize(10)
  doc.text('Thank you for your business!', 50, totalsY + 150, { align: 'center' })
  doc.text('Please contact us with any questions.', 50, totalsY + 165, { align: 'center' })
}

function generateTrackingUrl(carrier, trackingNumber) {
  const carriers = {
    ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
  }

  return (
    carriers[carrier.toLowerCase()] ||
    `https://www.google.com/search?q=${carrier}+tracking+${trackingNumber}`
  )
}
