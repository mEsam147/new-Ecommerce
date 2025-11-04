// models/Order.js
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
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
})

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      // required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      name: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: 'US',
      },
      phone: String,
    },
    billingAddress: {
      name: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    contactInfo: {
      email: {
        type: String,
        required: true,
      },
      phone: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['card', 'paypal', 'stripe', 'cash_on_delivery'],
      default: 'card',
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
      payment_intent: String,
    },
    pricing: {
      itemsPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      shippingPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      taxPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      discountAmount: {
        type: Number,
        default: 0,
      },
      totalPrice: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    coupon: {
      code: String,
      discountType: String,
      discountValue: Number,
      discountAmount: Number,
    },
    shipping: {
      method: {
        type: String,
        required: true,
        default: 'standard',
      },
      carrier: String,
      trackingNumber: String,
      estimatedDelivery: Date,
      shippedAt: Date,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
        'failed',
      ],
      default: 'pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    notes: String,
    cancellationReason: String,
    refundAmount: Number,
    refundedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes
orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ orderNumber: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ 'paymentResult.payment_intent': 1 })

// Pre-save middleware to generate order number and calculate totals
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  // Calculate items price
  this.pricing.itemsPrice = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  // Calculate total price
  this.pricing.totalPrice =
    this.pricing.itemsPrice +
    this.pricing.shippingPrice +
    this.pricing.taxPrice -
    this.pricing.discountAmount

  next()
})

// Method to update order status
orderSchema.methods.updateStatus = function (newStatus, notes = '') {
  const previousStatus = this.status
  this.status = newStatus

  // Update timestamps based on status
  const now = new Date()
  switch (newStatus) {
    case 'paid':
      this.isPaid = true
      this.paidAt = now
      break
    case 'shipped':
      this.shipping.shippedAt = now
      break
    case 'delivered':
      this.isDelivered = true
      this.deliveredAt = now
      break
    case 'refunded':
      this.refundedAt = now
      break
  }

  if (notes) {
    this.notes = notes
  }

  return this.save()
}

// Static method to get orders by user
orderSchema.statics.getUserOrders = function (userId, page = 1, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'name email')
    .populate('items.product', 'title images')
}

// Static method to get sales statistics
orderSchema.statics.getSalesStats = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['delivered', 'shipped', 'processing'] },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$pricing.totalPrice' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$pricing.totalPrice' },
      },
    },
  ])
}

export default mongoose.model('Order', orderSchema)
