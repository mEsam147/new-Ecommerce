// models/Order.js - Fix virtual properties
import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    size: String,
    color: String,
    sku: String,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  weight: {
    type: Number,
    default: 0,
  },
  sku: String,
})

const shippingSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['standard', 'express', 'overnight', 'free'],
    default: 'standard',
  },
  carrier: String,
  trackingNumber: String,
  trackingUrl: String,
  estimatedDelivery: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cost: {
    type: Number,
    default: 0,
  },
  address: {
    name: String,
    company: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'US',
    },
    phone: String,
  },
})

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['card', 'paypal', 'stripe', 'apple_pay', 'google_pay'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  transactionId: String,
  paymentIntentId: String,
  amount: Number,
  currency: {
    type: String,
    default: 'USD',
  },
  refunds: [
    {
      amount: Number,
      reason: String,
      createdAt: Date,
      refundId: String,
    },
  ],
  gatewayResponse: mongoose.Schema.Types.Mixed,
})

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    guest: {
      email: String,
      name: String,
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'ready_for_shipment',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'refunded',
        'failed',
        'on_hold',
      ],
      default: 'pending',
      index: true,
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        default: 0,
      },
      shipping: {
        type: Number,
        required: true,
        default: 0,
      },
      tax: {
        type: Number,
        required: true,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
        default: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    payment: {
      type: paymentSchema,
      default: () => ({}), // Add default empty object
    },
    shipping: {
      type: shippingSchema,
      default: () => ({}), // Add default empty object
    },
    billingAddress: {
      name: String,
      company: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
    },
    customerNotes: String,
    internalNotes: String,
    cancellationReason: String,
    fraudCheck: {
      score: Number,
      status: {
        type: String,
        enum: ['pending', 'passed', 'failed', 'manual_review'],
        default: 'pending',
      },
      flags: [String],
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Ensure virtuals don't break when underlying data is missing
        delete ret.id
        return ret
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        // Ensure virtuals don't break when underlying data is missing
        delete ret.id
        return ret
      },
    },
  }
)

// Fixed Virtuals with proper null checks
orderSchema.virtual('isPaid').get(function () {
  return this.payment && this.payment.status === 'completed'
})

orderSchema.virtual('isShipped').get(function () {
  return this.status === 'shipped' || this.status === 'out_for_delivery'
})

orderSchema.virtual('isDelivered').get(function () {
  return this.status === 'delivered'
})

orderSchema.virtual('canBeCancelled').get(function () {
  return ['pending', 'confirmed', 'processing'].includes(this.status)
})

orderSchema.virtual('canBeRefunded').get(function () {
  // Add proper null checks for all properties
  return this.isPaid && this.status && ['delivered', 'shipped', 'processing'].includes(this.status)
})

// Indexes
orderSchema.index({ createdAt: -1 })
orderSchema.index({ 'payment.paymentIntentId': 1 })
orderSchema.index({ 'shipping.trackingNumber': 1 })
orderSchema.index({ orderNumber: 'text' })

// Pre-save middleware - FIXED DUPLICATE METHOD DEFINITION
orderSchema.pre('save', function (next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = this.generateOrderNumber()
    if (!this.statusHistory) {
      this.statusHistory = []
    }
    this.statusHistory.push({
      status: this.status,
      note: 'Order created',
    })
  }

  // Calculate pricing
  this.calculatePricing()
  next()
})

// Methods
orderSchema.methods.generateOrderNumber = function () {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

orderSchema.methods.calculatePricing = function () {
  // Ensure pricing object exists
  this.pricing = this.pricing || {}

  this.pricing.subtotal = this.items.reduce((total, item) => total + item.price * item.quantity, 0)

  // Ensure all pricing fields have default values
  this.pricing.shipping = this.pricing.shipping || 0
  this.pricing.tax = this.pricing.tax || 0
  this.pricing.discount = this.pricing.discount || 0
  this.pricing.currency = this.pricing.currency || 'USD'

  this.pricing.total = Math.max(
    0,
    this.pricing.subtotal + this.pricing.shipping + this.pricing.tax - this.pricing.discount
  )
}

orderSchema.methods.updateStatus = async function (newStatus, note = '', updatedBy = null) {
  const previousStatus = this.status
  this.status = newStatus

  // Initialize statusHistory if it doesn't exist
  if (!this.statusHistory) {
    this.statusHistory = []
  }

  this.statusHistory.push({
    status: newStatus,
    note,
    updatedBy,
    timestamp: new Date(),
  })

  // Auto-update timestamps based on status with null checks
  const now = new Date()
  switch (newStatus) {
    case 'processing':
      if (this.payment) {
        this.payment.status = 'processing'
      }
      break
    case 'shipped':
      if (this.shipping) {
        this.shipping.shippedAt = now
      }
      break
    case 'delivered':
      if (this.shipping) {
        this.shipping.deliveredAt = now
      }
      break
    case 'cancelled':
      await this.restoreInventory()
      break
  }

  return this.save()
}

orderSchema.methods.restoreInventory = async function () {
  const Product = mongoose.model('Product')

  for (const item of this.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        'inventory.quantity': item.quantity,
        salesCount: -item.quantity,
      },
    })

    // Restore variant stock if applicable
    if (item.variant && (item.variant.size || item.variant.color)) {
      await Product.updateOne(
        {
          _id: item.product,
          'variants.size': item.variant.size,
          'variants.color': item.variant.color,
        },
        { $inc: { 'variants.$.stock': item.quantity } }
      )
    }
  }
}

orderSchema.methods.processRefund = async function (amount, reason = '') {
  // Add null checks for virtual properties
  if (!this.canBeRefunded) {
    throw new Error('Order cannot be refunded in its current state')
  }

  // Ensure payment object exists
  if (!this.payment) {
    this.payment = {}
  }
  if (!this.payment.refunds) {
    this.payment.refunds = []
  }

  const refundableAmount = this.pricing.total - this.getTotalRefunded()
  if (amount > refundableAmount) {
    throw new Error(`Refund amount exceeds available amount. Maximum: $${refundableAmount}`)
  }

  const refund = {
    amount,
    reason,
    createdAt: new Date(),
    refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }

  this.payment.refunds.push(refund)

  // Update payment status based on refund amount
  if (amount === this.pricing.total) {
    this.payment.status = 'refunded'
    this.status = 'refunded'
  } else {
    this.payment.status = 'partially_refunded'
  }

  await this.save()
  return refund
}

orderSchema.methods.getTotalRefunded = function () {
  if (!this.payment || !this.payment.refunds) {
    return 0
  }
  return this.payment.refunds.reduce((total, refund) => total + refund.amount, 0)
}

// Static methods
orderSchema.statics.getUserOrders = function (userId, page = 1, limit = 10, status = null) {
  const query = { user: userId }
  if (status) query.status = status

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('items.product', 'title images slug')
}

orderSchema.statics.getSalesStats = async function (startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['delivered', 'shipped', 'processing'] },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$pricing.total' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$pricing.total' },
        totalItemsSold: { $sum: { $size: '$items' } },
      },
    },
  ])

  return stats[0] || { totalSales: 0, totalOrders: 0, averageOrderValue: 0, totalItemsSold: 0 }
}

orderSchema.statics.getOrdersByStatus = function () {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
      },
    },
    {
      $sort: { count: -1 },
    },
  ])
}

export default mongoose.model('Order', orderSchema)
