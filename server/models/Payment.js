// // models/Payment.js
// import mongoose from 'mongoose'

// const paymentSchema = new mongoose.Schema(
//   {
//     order: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Order',
//       required: true,
//     },
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     paymentMethod: {
//       type: String,
//       required: true,
//       enum: ['card', 'paypal', 'stripe'],
//     },
//     paymentIntentId: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     currency: {
//       type: String,
//       required: true,
//       default: 'usd',
//     },
//     status: {
//       type: String,
//       enum: [
//         'requires_payment_method',
//         'requires_confirmation',
//         'requires_action',
//         'processing',
//         'requires_capture',
//         'canceled',
//         'succeeded',
//         'failed',
//       ],
//       required: true,
//     },
//     captureMethod: {
//       type: String,
//       enum: ['automatic', 'manual'],
//       default: 'automatic',
//     },
//     refunds: [
//       {
//         refundId: String,
//         amount: Number,
//         reason: String,
//         status: String,
//         createdAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//     metadata: {
//       type: Map,
//       of: String,
//     },
//     error: {
//       code: String,
//       message: String,
//       decline_code: String,
//     },
//     receiptUrl: String,
//     billingDetails: {
//       name: String,
//       email: String,
//       phone: String,
//       address: {
//         line1: String,
//         line2: String,
//         city: String,
//         state: String,
//         postal_code: String,
//         country: String,
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// )

// // Indexes
// paymentSchema.index({ paymentIntentId: 1 })
// paymentSchema.index({ user: 1, createdAt: -1 })
// paymentSchema.index({ order: 1 })
// paymentSchema.index({ status: 1 })

// // Method to process refund
// paymentSchema.methods.processRefund = async function (amount, reason = '') {
//   if (this.status !== 'succeeded') {
//     throw new Error('Cannot refund payment that is not succeeded')
//   }

//   if (amount > this.amount) {
//     throw new Error('Refund amount cannot exceed payment amount')
//   }

//   // Calculate total already refunded
//   const totalRefunded = this.refunds.reduce((total, refund) => total + refund.amount, 0)

//   if (amount > this.amount - totalRefunded) {
//     throw new Error('Refund amount exceeds available amount')
//   }

//   // In a real implementation, this would call Stripe API
//   const refund = {
//     refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//     amount,
//     reason,
//     status: 'pending',
//     createdAt: new Date(),
//   }

//   this.refunds.push(refund)
//   await this.save()

//   // Simulate refund processing
//   setTimeout(() => {
//     refund.status = 'succeeded'
//     this.save()
//   }, 2000)

//   return refund
// }

// // models/Payment.js - Add these methods to your existing schema

// // Add to your existing paymentSchema methods:

// // Method to check if refund is allowed
// paymentSchema.methods.canRequestRefund = function () {
//   if (this.status !== 'succeeded') return false

//   // Check if within 30 days
//   const paymentDate = new Date(this.createdAt)
//   const daysSincePayment = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
//   if (daysSincePayment > 30) return false

//   // Check if already has successful or pending refund
//   const hasActiveRefund = this.refunds?.some(
//     (refund) => refund.status === 'succeeded' || refund.status === 'pending'
//   )

//   return !hasActiveRefund
// }

// // Method to get total refunded amount
// paymentSchema.methods.getTotalRefunded = function () {
//   return (
//     this.refunds?.reduce((total, refund) => {
//       return refund.status === 'succeeded' ? total + refund.amount : total
//     }, 0) || 0
//   )
// }

// // Method to get refund status
// paymentSchema.methods.getRefundStatus = function () {
//   if (!this.refunds || this.refunds.length === 0) {
//     return 'none'
//   }

//   const hasSucceeded = this.refunds.some((refund) => refund.status === 'succeeded')
//   const hasPending = this.refunds.some((refund) => refund.status === 'pending')
//   const hasFailed = this.refunds.some((refund) => refund.status === 'failed')

//   if (hasSucceeded) return 'succeeded'
//   if (hasPending) return 'pending'
//   if (hasFailed) return 'failed'

//   return 'processing'
// }

// export default mongoose.model('Payment', paymentSchema)

// models/Payment.js
import mongoose from 'mongoose'

const refundSchema = new mongoose.Schema(
  {
    refundId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      enum: ['duplicate', 'fraudulent', 'requested_by_customer', 'defective_product', 'other'],
      default: 'requested_by_customer',
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'cancelled'],
      default: 'pending',
    },
    notes: String,
    processedAt: Date,
    failureReason: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
)

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['card', 'paypal', 'stripe', 'apple_pay', 'google_pay', 'bank_transfer'],
    },
    paymentMethodDetails: {
      // Store payment method specific details
      card: {
        brand: String,
        last4: String,
        exp_month: Number,
        exp_year: Number,
        country: String,
        funding: String,
      },
      paypal: {
        payer_email: String,
        payer_id: String,
      },
    },
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountCaptured: {
      type: Number,
      default: 0,
    },
    amountRefunded: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'usd',
    },
    status: {
      type: String,
      enum: [
        'requires_payment_method',
        'requires_confirmation',
        'requires_action',
        'processing',
        'requires_capture',
        'canceled',
        'succeeded',
        'failed',
      ],
      required: true,
      index: true,
    },
    captureMethod: {
      type: String,
      enum: ['automatic', 'manual'],
      default: 'automatic',
    },
    refunds: [refundSchema],
    metadata: {
      type: Map,
      of: String,
    },
    error: {
      code: String,
      message: String,
      decline_code: String,
      param: String,
      type: String,
    },
    receiptUrl: String,
    billingDetails: {
      name: String,
      email: String,
      phone: String,
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postal_code: String,
        country: String,
      },
    },
    shippingDetails: {
      name: String,
      phone: String,
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postal_code: String,
        country: String,
      },
    },
    fraudDetails: {
      stripe_radar: String,
      user_report: String,
    },
    calculatedStatementDescriptor: String,
    statementDescriptor: String,
    statementDescriptorSuffix: String,
    // Additional fields for better tracking
    gateway: {
      type: String,
      enum: ['stripe', 'paypal', 'adyen', 'braintree'],
      default: 'stripe',
    },
    gatewayResponse: mongoose.Schema.Types.Mixed,
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    threeDSecure: {
      authenticated: Boolean,
      version: String,
    },
    disputes: [
      {
        disputeId: String,
        amount: Number,
        reason: String,
        status: String,
        evidence: mongoose.Schema.Types.Mixed,
        createdAt: Date,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 })
paymentSchema.index({ status: 1, createdAt: -1 })
paymentSchema.index({ 'refunds.status': 1 })
paymentSchema.index({ order: 1, status: 1 })
paymentSchema.index({ createdAt: 1 })
paymentSchema.index({ 'paymentMethodDetails.card.last4': 1 })

// Virtuals
paymentSchema.virtual('isSuccessful').get(function () {
  return this.status === 'succeeded'
})

paymentSchema.virtual('isRefundable').get(function () {
  return this.status === 'succeeded' && this.getTotalRefunded() < this.amount
})

paymentSchema.virtual('isFailed').get(function () {
  return ['failed', 'canceled'].includes(this.status)
})

paymentSchema.virtual('isPending').get(function () {
  return [
    'requires_payment_method',
    'requires_confirmation',
    'requires_action',
    'processing',
  ].includes(this.status)
})

paymentSchema.virtual('isCaptured').get(function () {
  return this.amountCaptured > 0
})

paymentSchema.virtual('isPartiallyRefunded').get(function () {
  return this.getTotalRefunded() > 0 && this.getTotalRefunded() < this.amount
})

paymentSchema.virtual('isFullyRefunded').get(function () {
  return this.getTotalRefunded() === this.amount
})

// Methods
paymentSchema.methods.getTotalRefunded = function () {
  return this.refunds
    .filter((refund) => refund.status === 'succeeded')
    .reduce((total, refund) => total + refund.amount, 0)
}

paymentSchema.methods.getAvailableForRefund = function () {
  return this.amount - this.getTotalRefunded()
}

paymentSchema.methods.canProcessRefund = function (amount) {
  if (!this.isRefundable) return false
  if (amount > this.getAvailableForRefund()) return false

  // Check if there's any pending refund
  const hasPendingRefund = this.refunds.some((refund) => refund.status === 'pending')
  return !hasPendingRefund
}

paymentSchema.methods.processRefund = async function (
  amount,
  reason = 'requested_by_customer',
  notes = '',
  processedBy = null
) {
  if (!this.canProcessRefund(amount)) {
    throw new Error(
      `Cannot process refund. Available: ${this.getAvailableForRefund()}, Requested: ${amount}`
    )
  }

  const refund = {
    refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    reason,
    notes,
    status: 'pending',
    processedAt: new Date(),
    processedBy,
  }

  this.refunds.push(refund)
  await this.save()

  // In real implementation, this would call Stripe API
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update refund status to succeeded
    const refundIndex = this.refunds.findIndex((r) => r.refundId === refund.refundId)
    if (refundIndex !== -1) {
      this.refunds[refundIndex].status = 'succeeded'
      this.amountRefunded += amount
      await this.save()
    }

    return this.refunds[refundIndex]
  } catch (error) {
    // Update refund status to failed
    const refundIndex = this.refunds.findIndex((r) => r.refundId === refund.refundId)
    if (refundIndex !== -1) {
      this.refunds[refundIndex].status = 'failed'
      this.refunds[refundIndex].failureReason = error.message
      await this.save()
    }
    throw error
  }
}

paymentSchema.methods.getRefundStatus = function () {
  if (this.refunds.length === 0) return 'none'

  const hasSucceeded = this.refunds.some((refund) => refund.status === 'succeeded')
  const hasPending = this.refunds.some((refund) => refund.status === 'pending')
  const hasFailed = this.refunds.some((refund) => refund.status === 'failed')

  if (hasSucceeded) return 'succeeded'
  if (hasPending) return 'pending'
  if (hasFailed) return 'failed'

  return 'processing'
}

paymentSchema.methods.capturePayment = async function (amount = null) {
  if (this.status !== 'requires_capture') {
    throw new Error('Payment cannot be captured in current state')
  }

  const captureAmount = amount || this.amount
  if (captureAmount > this.amount) {
    throw new Error('Capture amount cannot exceed payment amount')
  }

  // In real implementation, call Stripe API to capture payment
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    this.status = 'succeeded'
    this.amountCaptured = captureAmount
    await this.save()

    return this
  } catch (error) {
    throw new Error(`Failed to capture payment: ${error.message}`)
  }
}

paymentSchema.methods.cancelPayment = async function () {
  if (
    !['requires_payment_method', 'requires_capture', 'requires_confirmation'].includes(this.status)
  ) {
    throw new Error('Payment cannot be cancelled in current state')
  }

  // In real implementation, call Stripe API to cancel payment intent
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    this.status = 'canceled'
    await this.save()

    return this
  } catch (error) {
    throw new Error(`Failed to cancel payment: ${error.message}`)
  }
}

paymentSchema.methods.addDispute = function (disputeData) {
  const dispute = {
    disputeId: disputeData.disputeId || `dp_${Date.now()}`,
    amount: disputeData.amount,
    reason: disputeData.reason,
    status: disputeData.status || 'needs_response',
    evidence: disputeData.evidence || {},
    createdAt: new Date(),
  }

  this.disputes.push(dispute)
  return this.save()
}

// Static methods
paymentSchema.statics.findByPaymentIntent = function (paymentIntentId) {
  return this.findOne({ paymentIntentId })
    .populate('order')
    .populate('user', 'name email')
    .populate('refunds.processedBy', 'name email')
}

paymentSchema.statics.getUserPayments = function (userId, page = 1, limit = 10, filters = {}) {
  const query = { user: userId, ...filters }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('order', 'orderNumber status totalAmount')
}

paymentSchema.statics.getPaymentStats = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'succeeded',
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        successfulPayments: { $sum: 1 },
        averagePaymentValue: { $avg: '$amount' },
        totalRefunds: {
          $sum: {
            $reduce: {
              input: '$refunds',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.amount'] },
            },
          },
        },
        paymentMethods: {
          $push: '$paymentMethod',
        },
      },
    },
    {
      $project: {
        totalRevenue: 1,
        successfulPayments: 1,
        averagePaymentValue: 1,
        totalRefunds: 1,
        paymentMethodDistribution: {
          $arrayToObject: {
            $map: {
              input: '$paymentMethods',
              as: 'method',
              in: {
                k: '$$method',
                v: {
                  $size: {
                    $filter: {
                      input: '$paymentMethods',
                      as: 'm',
                      cond: { $eq: ['$$m', '$$method'] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ])
}

paymentSchema.statics.getRevenueByPeriod = async function (period = 'month') {
  const groupFormat = period === 'day' ? '%Y-%m-%d' : '%Y-%m'

  return this.aggregate([
    {
      $match: {
        status: 'succeeded',
        createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }, // Last year
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupFormat,
            date: '$createdAt',
          },
        },
        revenue: { $sum: '$amount' },
        transactions: { $sum: 1 },
        averageOrderValue: { $avg: '$amount' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ])
}

// Middleware
paymentSchema.pre('save', function (next) {
  // Auto-calculate amountRefunded
  if (this.isModified('refunds')) {
    this.amountRefunded = this.getTotalRefunded()
  }

  // Set default metadata if not provided
  if (!this.metadata) {
    this.metadata = new Map()
  }

  next()
})

// Query helpers
paymentSchema.query.byStatus = function (status) {
  return this.where({ status })
}

paymentSchema.query.byPaymentMethod = function (method) {
  return this.where({ paymentMethod: method })
}

paymentSchema.query.byDateRange = function (startDate, endDate) {
  return this.where({
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  })
}

paymentSchema.query.withRefunds = function () {
  return this.where('refunds.0').exists(true)
}

export default mongoose.model('Payment', paymentSchema)
