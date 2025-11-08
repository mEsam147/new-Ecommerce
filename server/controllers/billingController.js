// controllers/billingController.js
import Payment from '../models/Payment.js'
import Order from '../models/Order.js'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import paymentService from '../services/paymentService.js'

// @desc    Get user's payment history
// @route   GET /api/billing/payments
// @access  Private
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const userId = req.user.id

  // Calculate pagination
  const skip = (page - 1) * limit

  // Get payments with order details
  const payments = await Payment.find({ user: userId })
    .populate({
      path: 'order',
      select: 'orderNumber items totalPrice',
      populate: {
        path: 'items.product',
        select: 'title images price',
      },
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip)

  // Get total count for pagination
  const total = await Payment.countDocuments({ user: userId })

  res.json({
    success: true,
    data: {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  })
})

// @desc    Get billing statistics
// @route   GET /api/billing/stats
// @access  Private
export const getBillingStats = asyncHandler(async (req, res) => {
  const userId = req.user.id

  // Get all successful payments
  const payments = await Payment.find({
    user: userId,
    status: 'succeeded',
  })

  // Calculate statistics
  const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalOrders = await Order.countDocuments({ user: userId })
  const successfulPayments = payments.length

  // Get failed payments count
  const failedPayments = await Payment.countDocuments({
    user: userId,
    status: 'failed',
  })

  // Calculate refunded amount
  const refundedAmount = payments.reduce((sum, payment) => {
    const paymentRefunds =
      payment.refunds?.reduce(
        (refundSum, refund) =>
          refund.status === 'succeeded' ? refundSum + refund.amount : refundSum,
        0
      ) || 0
    return sum + paymentRefunds
  }, 0)

  // Calculate average order value
  const averageOrderValue = successfulPayments > 0 ? totalSpent / successfulPayments : 0

  res.json({
    success: true,
    data: {
      totalSpent,
      totalOrders,
      successfulPayments,
      failedPayments,
      refundedAmount,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    },
  })
})

// @desc    Get user's payment methods
// @route   GET /api/billing/payment-methods
// @access  Private
export const getPaymentMethods = asyncHandler(async (req, res) => {
  const userId = req.user.id

  // In a real implementation, you would fetch this from Stripe
  // For now, we'll return mock data or extract from recent payments
  const recentPayments = await Payment.find({ user: userId }).sort({ createdAt: -1 }).limit(5)

  const paymentMethods = []

  // Extract unique payment methods from recent payments
  const seenMethods = new Set()
  recentPayments.forEach((payment) => {
    const methodKey = `${payment.paymentMethod}-${payment.billingDetails?.name}`

    if (!seenMethods.has(methodKey) && payment.billingDetails) {
      seenMethods.add(methodKey)

      paymentMethods.push({
        id: `pm_${payment._id}`,
        type: payment.paymentMethod,
        card:
          payment.paymentMethod === 'card'
            ? {
                brand: 'visa', // You would get this from Stripe
                last4: '4242', // You would get this from Stripe
                exp_month: 12,
                exp_year: 2025,
              }
            : undefined,
        isDefault: paymentMethods.length === 0, // First one is default
      })
    }
  })

  // If no payment methods found, return empty array
  res.json({
    success: true,
    data: {
      paymentMethods,
    },
  })
})

// @desc    Request refund for a payment
// @route   POST /api/billing/payments/:id/refund
// @access  Private
export const requestRefund = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { reason } = req.body
  const userId = req.user.id

  // Find the payment
  const payment = await Payment.findOne({ _id: id, user: userId })

  if (!payment) {
    throw new ApiError(404, 'Payment not found')
  }

  // Validate refund eligibility
  if (payment.status !== 'succeeded') {
    throw new ApiError(400, 'Refund can only be requested for successful payments')
  }

  // Check if payment is within refund period (30 days)
  const paymentDate = new Date(payment.createdAt)
  const daysSincePayment = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)

  if (daysSincePayment > 30) {
    throw new ApiError(400, 'Refund can only be requested within 30 days of payment')
  }

  // Check if refund already exists
  const existingRefund = payment.refunds?.find(
    (refund) => refund.status === 'succeeded' || refund.status === 'pending'
  )

  if (existingRefund) {
    throw new ApiError(400, 'Refund has already been processed or is pending')
  }

  try {
    // Process refund through Stripe
    const refund = await paymentService.createRefund(
      payment.paymentIntentId,
      payment.amount,
      reason
    )

    // Add refund to payment record
    payment.refunds = payment.refunds || []
    payment.refunds.push({
      refundId: refund.id,
      amount: refund.amount / 100, // Convert back from cents
      reason: reason,
      status: refund.status,
      createdAt: new Date(),
    })

    await payment.save()

    // Update order status if this is a full refund
    if (refund.amount === payment.amount * 100) {
      await Order.findOneAndUpdate(
        { _id: payment.order },
        {
          status: 'refunded',
          refundedAt: new Date(),
        }
      )
    }

    res.json({
      success: true,
      message: 'Refund request submitted successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
    })
  } catch (error) {
    console.error('Refund processing error:', error)
    throw new ApiError(500, 'Failed to process refund request')
  }
})

// @desc    Download invoice for a payment
// @route   POST /api/billing/payments/:id/invoice
// @access  Private
export const downloadInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  // Find the payment
  const payment = await Payment.findOne({ _id: id, user: userId }).populate({
    path: 'order',
    populate: {
      path: 'items.product',
      select: 'title sku',
    },
  })

  if (!payment) {
    throw new ApiError(404, 'Payment not found')
  }

  // In a real implementation, you would generate a PDF invoice
  // For now, we'll return the receipt URL or create a simple download link
  let invoiceUrl = payment.receiptUrl

  if (!invoiceUrl) {
    // Generate a mock invoice URL (in real app, generate PDF and upload to cloud storage)
    invoiceUrl = `/api/billing/invoices/${payment._id}/download`
  }

  res.json({
    success: true,
    data: {
      url: invoiceUrl,
    },
    message: 'Invoice download ready',
  })
})

// @desc    Get invoice download
// @route   GET /api/billing/invoices/:id/download
// @access  Private
export const downloadInvoiceFile = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  // Verify payment exists and belongs to user
  const payment = await Payment.findOne({ _id: id, user: userId }).populate({
    path: 'order',
    populate: {
      path: 'items.product',
      select: 'title sku price',
    },
  })

  if (!payment) {
    throw new ApiError(404, 'Invoice not found')
  }

  // In a real implementation, you would:
  // 1. Generate a PDF invoice using a library like pdfkit
  // 2. Include company logo, payment details, item breakdown, etc.
  // 3. Stream the PDF to the response

  // For now, we'll return a simple JSON response
  // You can implement PDF generation later
  res.json({
    success: true,
    data: {
      invoice: {
        id: payment._id,
        orderNumber: payment.order.orderNumber,
        date: payment.createdAt,
        amount: payment.amount,
        currency: payment.currency,
        items: payment.order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.totalPrice,
        })),
        billingDetails: payment.billingDetails,
      },
    },
    message: 'PDF invoice generation would happen here',
  })
})

// @desc    Get payment details
// @route   GET /api/billing/payments/:id
// @access  Private
export const getPaymentDetails = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  const payment = await Payment.findOne({ _id: id, user: userId }).populate({
    path: 'order',
    populate: {
      path: 'items.product',
      select: 'title images price',
    },
  })

  if (!payment) {
    throw new ApiError(404, 'Payment not found')
  }

  res.json({
    success: true,
    data: {
      payment,
    },
  })
})
