// controllers/orderController.js
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import Coupon from '../models/Coupon.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiFeatures from '../utils/apiFeatures.js'
import emailService from '../services/emailService.js'

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, billingAddress, paymentMethod, couponCode, notes } = req.body

  const userId = req.user.id

  // Get user's cart
  const cart = await Cart.findOne({ user: userId }).populate(
    'items.product',
    'title images price variants inventory isActive'
  )

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty')
  }

  // Validate cart items and calculate totals
  let itemsPrice = 0
  const orderItems = []
  const outOfStockItems = []

  for (const cartItem of cart.items) {
    const product = cartItem.product

    if (!product) {
      outOfStockItems.push('Unknown product')
      continue
    }

    if (!product.isActive) {
      outOfStockItems.push(product.title)
      continue
    }

    let availableStock = product.inventory.quantity
    let variantStock = null

    // Check if we're dealing with a variant
    if (cartItem.variant && cartItem.variant.size && cartItem.variant.color) {
      // Find the specific variant
      const variant = product.variants.find(
        (v) => v.size === cartItem.variant.size && v.color === cartItem.variant.color
      )

      if (!variant) {
        outOfStockItems.push(
          `${product.title} (${cartItem.variant.size}/${cartItem.variant.color})`
        )
        continue
      }

      variantStock = variant.stock
      availableStock = variantStock
    }

    // Check stock availability
    if (availableStock < cartItem.quantity) {
      outOfStockItems.push(product.title)
      continue
    }

    const itemTotal = cartItem.price * cartItem.quantity
    itemsPrice += itemTotal

    orderItems.push({
      product: product._id,
      variant: cartItem.variant || {},
      name: product.title,
      image: product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url,
      price: cartItem.price,
      quantity: cartItem.quantity,
      totalPrice: itemTotal,
    })
  }

  if (outOfStockItems.length > 0) {
    throw new ApiError(400, `Some items are out of stock: ${outOfStockItems.join(', ')}`)
  }

  if (orderItems.length === 0) {
    throw new ApiError(400, 'No valid items in cart')
  }

  // Calculate shipping price (simplified)
  const shippingPrice = itemsPrice > 100 ? 0 : 10 // Free shipping over $100

  // Calculate tax (simplified - 8%)
  const taxPrice = itemsPrice * 0.08

  // Apply coupon if provided
  let discountAmount = 0
  let couponData = null

  if (couponCode) {
    try {
      const coupon = await Coupon.findValidCoupon(couponCode, userId, itemsPrice, orderItems)
      discountAmount = coupon.calculateDiscount(itemsPrice)
      couponData = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      }
    } catch (error) {
      throw new ApiError(400, error.message)
    }
  }

  // Calculate total price
  const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount

  // Create order
  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    contactInfo: {
      email: req.user.email,
      phone: shippingAddress.phone,
    },
    paymentMethod,
    pricing: {
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount,
      totalPrice,
    },
    coupon: couponData,
    notes,
    shipping: {
      method: itemsPrice > 100 ? 'free' : 'standard',
    },
  })

  // Update product inventory
  for (const item of orderItems) {
    const product = await Product.findById(item.product)

    if (item.variant && item.variant.size && item.variant.color) {
      // Update variant stock
      const variantIndex = product.variants.findIndex(
        (v) => v.size === item.variant.size && v.color === item.variant.color
      )

      if (variantIndex !== -1) {
        product.variants[variantIndex].stock -= item.quantity

        // If tracking overall inventory, update that too
        if (product.inventory.trackQuantity) {
          product.inventory.quantity -= item.quantity
        }
      }
    } else {
      // Update general inventory
      if (product.inventory.trackQuantity) {
        product.inventory.quantity -= item.quantity
      }
    }

    product.salesCount += item.quantity
    await product.save()
  }

  // Clear cart
  cart.items = []
  await cart.save()

  // Send order confirmation email
  try {
    await emailService.sendOrderConfirmation(req.user.email, req.user.name, order)
  } catch (emailError) {
    console.error('Failed to send order confirmation email:', emailError)
    // Don't fail the order if email fails
  }

  res.status(201).json({
    success: true,
    data: order,
    message: 'Order created successfully',
  })
})

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Order.find({ user: req.user.id }), req.query)
    .filter()
    .sort()
    .paginate()

  const orders = await features.query
    .populate('items.product', 'title images')
    .sort({ createdAt: -1 })

  const total = await Order.countDocuments({ user: req.user.id })

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: features.page,
      limit: features.limit,
      total,
      pages: Math.ceil(total / features.limit),
    },
  })
})

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'title images slug')

  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  // Check if user owns the order or is admin
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to access this order')
  }

  res.json({
    success: true,
    data: order,
  })
})

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Order.find(), req.query).filter().sort().paginate()

  const orders = await features.query
    .populate('user', 'name email')
    .populate('items.product', 'title images')
    .sort({ createdAt: -1 })

  const total = await Order.countDocuments(features.filterQuery)

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: features.page,
      limit: features.limit,
      total,
      pages: Math.ceil(total / features.limit),
    },
  })
})

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body

  const order = await Order.findById(req.params.id)
  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  await order.updateStatus(status, notes)

  // Send status update email
  if (order.contactInfo.email) {
    await emailService.sendOrderStatusUpdate(
      order.contactInfo.email,
      order.user.name,
      order,
      status
    )
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
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body

  const order = await Order.findById(req.params.id)
  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  // Check if user owns the order
  if (order.user.toString() !== req.user.id) {
    throw new ApiError(403, 'Not authorized to cancel this order')
  }

  // Check if order can be cancelled
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new ApiError(400, 'Order cannot be cancelled at this stage')
  }

  order.status = 'cancelled'
  order.cancellationReason = reason
  await order.save()

  // Restore product inventory
  for (const item of order.items) {
    const product = await Product.findById(item.product)

    if (item.variant.size && item.variant.color) {
      const variant = product.variants.find(
        (v) => v.size === item.variant.size && v.color === item.variant.color
      )
      if (variant) {
        variant.stock += item.quantity
      }
    } else {
      product.inventory.quantity += item.quantity
    }

    product.salesCount -= item.quantity
    await product.save()
  }

  res.json({
    success: true,
    data: order,
    message: 'Order cancelled successfully',
  })
})

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  const { period = '30days' } = req.query

  let startDate = new Date()
  switch (period) {
    case '7days':
      startDate.setDate(startDate.getDate() - 7)
      break
    case '30days':
      startDate.setDate(startDate.getDate() - 30)
      break
    case '90days':
      startDate.setDate(startDate.getDate() - 90)
      break
    default:
      startDate.setDate(startDate.getDate() - 30)
  }

  const stats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['delivered', 'shipped', 'processing'] },
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalPrice' },
        averageOrderValue: { $avg: '$pricing.totalPrice' },
      },
    },
  ])

  // Get orders by status
  const statusStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ])

  res.json({
    success: true,
    data: {
      overview: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
      byStatus: statusStats,
    },
  })
})
