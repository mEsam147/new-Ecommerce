// models/PaymentMethod.js
import mongoose from 'mongoose'

const paymentMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stripePaymentMethodId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['card', 'paypal', 'apple_pay', 'google_pay'],
      index: true,
    },
    // Card-specific fields
    brand: {
      type: String,
      required: function () {
        return this.type === 'card'
      },
      enum: ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay', 'unknown'],
    },
    last4: {
      type: String,
      required: function () {
        return this.type === 'card'
      },
      validate: {
        validator: function (v) {
          return /^\d{4}$/.test(v)
        },
        message: 'Last 4 digits must be exactly 4 numbers',
      },
    },
    expMonth: {
      type: Number,
      required: function () {
        return this.type === 'card'
      },
      min: 1,
      max: 12,
      validate: {
        validator: Number.isInteger,
        message: 'Expiration month must be an integer',
      },
    },
    expYear: {
      type: Number,
      required: function () {
        return this.type === 'card'
      },
      validate: {
        validator: function (v) {
          return v >= new Date().getFullYear()
        },
        message: 'Expiration year must be in the future',
      },
    },
    // Common fields
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: function () {
        return this.type === 'paypal'
      },
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: 'Invalid email format',
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Security and validation
    fingerprint: {
      type: String,
      sparse: true,
    },
    country: {
      type: String,
      default: 'US',
      maxlength: 2,
    },
    // Metadata for analytics
    metadata: {
      createdVia: {
        type: String,
        enum: ['checkout', 'wallet', 'manual'],
        default: 'checkout',
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verificationAttempts: {
        type: Number,
        default: 0,
        max: 3,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.stripePaymentMethodId
        delete ret.fingerprint
        return ret
      },
    },
  }
)

// Compound indexes
paymentMethodSchema.index({ user: 1, isDefault: 1 })
paymentMethodSchema.index({ user: 1, isActive: 1 })
paymentMethodSchema.index({ user: 1, type: 1 })
paymentMethodSchema.index({ user: 1, createdAt: -1 })

// Pre-save middleware
paymentMethodSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    try {
      await this.constructor.updateMany(
        {
          user: this.user,
          _id: { $ne: this._id },
          isActive: true,
        },
        { $set: { isDefault: false } }
      )
    } catch (error) {
      return next(error)
    }
  }
  next()
})

// Static methods
paymentMethodSchema.statics.setDefaultPaymentMethod = async function (userId, paymentMethodId) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    await this.updateMany(
      { user: userId, isActive: true },
      { $set: { isDefault: false } },
      { session }
    )

    const updatedMethod = await this.findOneAndUpdate(
      { _id: paymentMethodId, user: userId, isActive: true },
      { $set: { isDefault: true } },
      { new: true, session }
    )

    if (!updatedMethod) {
      throw new Error('Payment method not found or inactive')
    }

    await session.commitTransaction()
    return updatedMethod
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

paymentMethodSchema.statics.getUserDefaultPaymentMethod = async function (userId) {
  return this.findOne({
    user: userId,
    isActive: true,
    isDefault: true,
  })
}

paymentMethodSchema.statics.getActivePaymentMethods = async function (userId) {
  return this.find({
    user: userId,
    isActive: true,
  }).sort({ isDefault: -1, createdAt: -1 })
}

// Instance methods
paymentMethodSchema.methods.toClientFormat = function () {
  const obj = this.toObject()

  const baseFormat = {
    id: obj._id,
    type: obj.type,
    isDefault: obj.isDefault,
    name: obj.name,
    email: obj.email,
    isActive: obj.isActive,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  }

  if (obj.type === 'card') {
    baseFormat.brand = obj.brand
    baseFormat.last4 = obj.last4
    baseFormat.expiry = `${obj.expMonth.toString().padStart(2, '0')}/${obj.expYear
      .toString()
      .slice(-2)}`
    baseFormat.icon = this.getCardIcon(obj.brand)
  }

  return baseFormat
}

paymentMethodSchema.methods.getCardIcon = function (brand) {
  const icons = {
    visa: '/icons/visa.svg',
    mastercard: '/icons/mastercard.svg',
    amex: '/icons/amex.svg',
    discover: '/icons/discover.svg',
    diners: '/icons/diners.svg',
    jcb: '/icons/jcb.svg',
    unionpay: '/icons/unionpay.svg',
  }
  return icons[brand] || '/icons/credit-card.svg'
}

paymentMethodSchema.methods.isExpired = function () {
  if (this.type !== 'card') return false

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  return (
    this.expYear < currentYear || (this.expYear === currentYear && this.expMonth < currentMonth)
  )
}

paymentMethodSchema.methods.safeDelete = async function () {
  this.isActive = false
  this.isDefault = false
  return this.save()
}

export default mongoose.model('PaymentMethod', paymentMethodSchema)
