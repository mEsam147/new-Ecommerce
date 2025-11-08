// models/Payment.js
import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['card', 'paypal', 'stripe'],
    },
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
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
    },
    captureMethod: {
      type: String,
      enum: ['automatic', 'manual'],
      default: 'automatic',
    },
    refunds: [
      {
        refundId: String,
        amount: Number,
        reason: String,
        status: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metadata: {
      type: Map,
      of: String,
    },
    error: {
      code: String,
      message: String,
      decline_code: String,
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
  },
  {
    timestamps: true,
  }
)

// Indexes
paymentSchema.index({ paymentIntentId: 1 })
paymentSchema.index({ user: 1, createdAt: -1 })
paymentSchema.index({ order: 1 })
paymentSchema.index({ status: 1 })

// Method to process refund
paymentSchema.methods.processRefund = async function (amount, reason = '') {
  if (this.status !== 'succeeded') {
    throw new Error('Cannot refund payment that is not succeeded')
  }

  if (amount > this.amount) {
    throw new Error('Refund amount cannot exceed payment amount')
  }

  // Calculate total already refunded
  const totalRefunded = this.refunds.reduce((total, refund) => total + refund.amount, 0)

  if (amount > this.amount - totalRefunded) {
    throw new Error('Refund amount exceeds available amount')
  }

  // In a real implementation, this would call Stripe API
  const refund = {
    refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    reason,
    status: 'pending',
    createdAt: new Date(),
  }

  this.refunds.push(refund)
  await this.save()

  // Simulate refund processing
  setTimeout(() => {
    refund.status = 'succeeded'
    this.save()
  }, 2000)

  return refund
}

// models/Payment.js - Add these methods to your existing schema

// Add to your existing paymentSchema methods:

// Method to check if refund is allowed
paymentSchema.methods.canRequestRefund = function () {
  if (this.status !== 'succeeded') return false

  // Check if within 30 days
  const paymentDate = new Date(this.createdAt)
  const daysSincePayment = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSincePayment > 30) return false

  // Check if already has successful or pending refund
  const hasActiveRefund = this.refunds?.some(
    (refund) => refund.status === 'succeeded' || refund.status === 'pending'
  )

  return !hasActiveRefund
}

// Method to get total refunded amount
paymentSchema.methods.getTotalRefunded = function () {
  return (
    this.refunds?.reduce((total, refund) => {
      return refund.status === 'succeeded' ? total + refund.amount : total
    }, 0) || 0
  )
}

// Method to get refund status
paymentSchema.methods.getRefundStatus = function () {
  if (!this.refunds || this.refunds.length === 0) {
    return 'none'
  }

  const hasSucceeded = this.refunds.some((refund) => refund.status === 'succeeded')
  const hasPending = this.refunds.some((refund) => refund.status === 'pending')
  const hasFailed = this.refunds.some((refund) => refund.status === 'failed')

  if (hasSucceeded) return 'succeeded'
  if (hasPending) return 'pending'
  if (hasFailed) return 'failed'

  return 'processing'
}

export default mongoose.model('Payment', paymentSchema)
