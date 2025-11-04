// // models/Coupon.js
// import mongoose from 'mongoose';

// const couponSchema = new mongoose.Schema({
//   code: {
//     type: String,
//     required: [true, 'Coupon code is required'],
//     unique: true,
//     uppercase: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     maxlength: [500, 'Description cannot be more than 500 characters']
//   },
//   discountType: {
//     type: String,
//     enum: ['percentage', 'fixed', 'free_shipping'],
//     required: true,
//     default: 'percentage'
//   },
//   discountValue: {
//     type: Number,
//     required: [true, 'Discount value is required'],
//     min: [0, 'Discount value must be positive']
//   },
//   minimumAmount: {
//     type: Number,
//     min: [0, 'Minimum amount must be positive'],
//     default: 0
//   },
//   maximumDiscount: {
//     type: Number,
//     min: [0, 'Maximum discount must be positive']
//   },
//   startDate: {
//     type: Date,
//     required: [true, 'Start date is required']
//   },
//   endDate: {
//     type: Date,
//     required: [true, 'End date is required']
//   },
//   usageLimit: {
//     type: Number,
//     min: [0, 'Usage limit must be positive']
//   },
//   usedCount: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//   perUserLimit: {
//     type: Number,
//     min: [0, 'Per user limit must be positive'],
//     default: 1
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   isSingleUse: {
//     type: Boolean,
//     default: false
//   },
//   applicableCategories: [{
//     type: String
//   }],
//   excludedCategories: [{
//     type: String
//   }],
//   applicableProducts: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product'
//   }],
//   excludedProducts: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product'
//   }],
//   customerEligibility: {
//     type: String,
//     enum: ['all', 'new_customers', 'existing_customers', 'specific_customers'],
//     default: 'all'
//   },
//   specificCustomers: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   usageHistory: [{
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     order: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Order'
//     },
//     usedAt: {
//       type: Date,
//       default: Date.now
//     },
//     discountAmount: Number
//   }]
// }, {
//   timestamps: true
// });

// // Indexes
// couponSchema.index({ code: 1 });
// couponSchema.index({ startDate: 1, endDate: 1 });
// couponSchema.index({ isActive: 1 });

// // Virtual for isExpired
// couponSchema.virtual('isExpired').get(function() {
//   return this.endDate < new Date();
// });

// // Virtual for isUsageLimitReached
// couponSchema.virtual('isUsageLimitReached').get(function() {
//   return this.usageLimit && this.usedCount >= this.usageLimit;
// });

// // Virtual for remainingUses
// couponSchema.virtual('remainingUses').get(function() {
//   return this.usageLimit ? this.usageLimit - this.usedCount : null;
// });

// // Method to validate coupon
// couponSchema.methods.validateCoupon = function(userId, cartAmount, products = []) {
//   const now = new Date();

//   // Check if coupon is active
//   if (!this.isActive) {
//     return { isValid: false, message: 'Coupon is not active' };
//   }

//   // Check date validity
//   if (now < this.startDate || now > this.endDate) {
//     return { isValid: false, message: 'Coupon is expired or not yet active' };
//   }

//   // Check usage limit
//   if (this.isUsageLimitReached) {
//     return { isValid: false, message: 'Coupon usage limit reached' };
//   }

//   // Check minimum amount
//   if (cartAmount < this.minimumAmount) {
//     return { isValid: false, message: `Minimum order amount of $${this.minimumAmount} required` };
//   }

//   // Check per user limit
//   if (this.perUserLimit > 0) {
//     const userUsageCount = this.usageHistory.filter(
//       usage => usage.user && usage.user.toString() === userId.toString()
//     ).length;

//     if (userUsageCount >= this.perUserLimit) {
//       return { isValid: false, message: 'Coupon usage limit reached for this user' };
//     }
//   }

//   // Check customer eligibility
//   if (this.customerEligibility === 'new_customers') {
//     // Implementation would require checking if user has previous orders
//     return { isValid: false, message: 'Coupon only valid for new customers' };
//   }

//   if (this.customerEligibility === 'specific_customers' && this.specificCustomers.length > 0) {
//     if (!this.specificCustomers.includes(userId)) {
//       return { isValid: false, message: 'Coupon not valid for this customer' };
//     }
//   }

//   // Check product restrictions
//   if (products.length > 0) {
//     const productIds = products.map(p => p.product?.toString?.() || p.toString());

//     // Check excluded products
//     if (this.excludedProducts.length > 0 && this.excludedProducts.some(p => productIds.includes(p.toString()))) {
//       return { isValid: false, message: 'Coupon not valid for some products in cart' };
//     }

//     // Check applicable products if specified
//     if (this.applicableProducts.length > 0 && !this.applicableProducts.some(p => productIds.includes(p.toString()))) {
//       return { isValid: false, message: 'Coupon not valid for products in cart' };
//     }
//   }

//   return { isValid: true, message: 'Coupon is valid' };
// };

// // Method to calculate discount
// couponSchema.methods.calculateDiscount = function(cartAmount) {
//   let discountAmount = 0;

//   switch (this.discountType) {
//     case 'percentage':
//       discountAmount = (cartAmount * this.discountValue) / 100;
//       if (this.maximumDiscount && discountAmount > this.maximumDiscount) {
//         discountAmount = this.maximumDiscount;
//       }
//       break;

//     case 'fixed':
//       discountAmount = Math.min(this.discountValue, cartAmount);
//       break;

//     case 'free_shipping':
//       discountAmount = 0; // Handle shipping separately
//       break;

//     default:
//       discountAmount = 0;
//   }

//   return Math.max(0, Math.min(discountAmount, cartAmount));
// };

// // Static method to find valid coupon
// couponSchema.statics.findValidCoupon = function(code, userId, cartAmount, products = []) {
//   return this.findOne({
//     code: code.toUpperCase(),
//     isActive: true,
//     startDate: { $lte: new Date() },
//     endDate: { $gte: new Date() }
//   }).then(coupon => {
//     if (!coupon) {
//       throw new Error('Coupon not found');
//     }

//     const validation = coupon.validateCoupon(userId, cartAmount, products);
//     if (!validation.isValid) {
//       throw new Error(validation.message);
//     }

//     return coupon;
//   });
// };

// export default mongoose.model('Coupon', couponSchema);

// models/Coupon.js
import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [4, 'Coupon code must be at least 4 characters'],
      maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    },
    name: {
      type: String,
      required: [true, 'Coupon name is required'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'free_shipping'],
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value must be positive'],
      validate: {
        validator: function (value) {
          if (this.discountType === 'percentage') {
            return value >= 0 && value <= 100
          }
          return value >= 0
        },
        message: 'Percentage discount must be between 0-100',
      },
    },
    minimumAmount: {
      type: Number,
      min: [0, 'Minimum amount must be positive'],
      default: 0,
    },
    maximumDiscount: {
      type: Number,
      min: [0, 'Maximum discount must be positive'],
      validate: {
        validator: function (value) {
          if (this.discountType !== 'percentage') return true
          return !value || value >= 0
        },
        message: 'Maximum discount must be positive',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      validate: {
        validator: function (value) {
          return value >= new Date()
        },
        message: 'Start date must be in the future',
      },
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value > this.startDate
        },
        message: 'End date must be after start date',
      },
    },
    usageLimit: {
      type: Number,
      min: [1, 'Usage limit must be at least 1'],
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      min: [1, 'Per user limit must be at least 1'],
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSingleUse: {
      type: Boolean,
      default: false,
    },
    applicableCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    excludedCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    excludedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    customerEligibility: {
      type: String,
      enum: ['all', 'new_customers', 'existing_customers', 'specific_customers'],
      default: 'all',
    },
    specificCustomers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes for performance
couponSchema.index({ code: 1 })
couponSchema.index({ startDate: 1, endDate: 1 })
couponSchema.index({ isActive: 1 })
couponSchema.index({ createdBy: 1 })

// Virtuals
couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.endDate
})

couponSchema.virtual('isNotStarted').get(function () {
  return new Date() < this.startDate
})

couponSchema.virtual('isUsageLimitReached').get(function () {
  return this.usageLimit && this.usedCount >= this.usageLimit
})

couponSchema.virtual('remainingUses').get(function () {
  return this.usageLimit ? this.usageLimit - this.usedCount : Infinity
})

couponSchema.virtual('isValid').get(function () {
  return this.isActive && !this.isExpired && !this.isNotStarted && !this.isUsageLimitReached
})

// Pre-save middleware
couponSchema.pre('save', function (next) {
  if (this.discountType === 'free_shipping') {
    this.discountValue = 0
    this.maximumDiscount = undefined
  }
  next()
})

couponSchema.statics.findValidCoupon = async function (code, userId, cartAmount, cartItems = []) {
  if (!code || typeof code !== 'string') {
    throw new Error('Valid coupon code is required')
  }

  // Find the coupon
  const coupon = await this.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  })

  if (!coupon) {
    throw new Error('Coupon not found or inactive')
  }

  // Use the instance method for validation
  const validation = await coupon.validateCoupon(userId, cartAmount, cartItems)
  if (!validation.isValid) {
    throw new Error(validation.errors[0])
  }

  return coupon
}
// Validation method
// models/Coupon.js - Update validateCoupon method
couponSchema.methods.validateCoupon = async function (userId, cartAmount, cartItems = []) {
  const errors = []
  const now = new Date()

  // Check active status
  if (!this.isActive) {
    errors.push('Coupon is not active')
  }

  // Check dates
  if (now < this.startDate) {
    errors.push('Coupon is not yet active')
  }

  if (now > this.endDate) {
    errors.push('Coupon has expired')
  }

  // Check usage limits
  if (this.isUsageLimitReached) {
    errors.push('Coupon usage limit reached')
  }

  // Check minimum amount
  if (cartAmount < this.minimumAmount) {
    errors.push(`Minimum order amount of $${this.minimumAmount} required`)
  }

  // Check per user limit (only for authenticated users)
  if (this.perUserLimit > 0 && userId) {
    const User = mongoose.model('User')
    const user = await User.findById(userId)

    if (user) {
      const userCouponUsage = user.couponUsage?.get(this._id.toString()) || 0
      if (userCouponUsage >= this.perUserLimit) {
        errors.push('You have reached the usage limit for this coupon')
      }
    }
  }

  // Check customer eligibility (only for authenticated users)
  if (userId) {
    if (this.customerEligibility === 'specific_customers' && this.specificCustomers.length > 0) {
      if (
        !this.specificCustomers.some((customerId) => customerId.toString() === userId.toString())
      ) {
        errors.push('Coupon not valid for your account')
      }
    }
  }

  // Check product restrictions
  if (cartItems.length > 0) {
    const productIds = cartItems.map((item) => item.productId?.toString())
    const categoryNames = cartItems.map((item) => item.product?.category).filter(Boolean)

    // Check excluded products
    if (this.excludedProducts.length > 0) {
      const hasExcludedProduct = this.excludedProducts.some((productId) =>
        productIds.includes(productId.toString())
      )
      if (hasExcludedProduct) {
        errors.push('Coupon cannot be used with some products in your cart')
      }
    }

    // Check applicable products
    if (this.applicableProducts.length > 0) {
      const hasApplicableProduct = this.applicableProducts.some((productId) =>
        productIds.includes(productId.toString())
      )
      if (!hasApplicableProduct) {
        errors.push('Coupon not valid for products in your cart')
      }
    }

    // Check excluded categories
    if (this.excludedCategories.length > 0) {
      const hasExcludedCategory = this.excludedCategories.some((category) =>
        categoryNames.includes(category)
      )
      if (hasExcludedCategory) {
        errors.push('Coupon cannot be used with some categories in your cart')
      }
    }

    // Check applicable categories
    if (this.applicableCategories.length > 0) {
      const hasApplicableCategory = this.applicableCategories.some((category) =>
        categoryNames.includes(category)
      )
      if (!hasApplicableCategory) {
        errors.push('Coupon not valid for categories in your cart')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  }
}

// Calculate discount amount
couponSchema.methods.calculateDiscount = function (cartAmount) {
  let discountAmount = 0

  switch (this.discountType) {
    case 'percentage':
      discountAmount = (cartAmount * this.discountValue) / 100
      if (this.maximumDiscount && discountAmount > this.maximumDiscount) {
        discountAmount = this.maximumDiscount
      }
      break

    case 'fixed':
      discountAmount = Math.min(this.discountValue, cartAmount)
      break

    case 'free_shipping':
      // This would be handled separately in shipping calculation
      discountAmount = 0
      break

    default:
      discountAmount = 0
  }

  return Math.round(discountAmount * 100) / 100 // Round to 2 decimal places
}

// Static method to find and validate coupon
couponSchema.statics.findAndValidate = async function (code, userId, cartAmount, cartItems = []) {
  if (!code || typeof code !== 'string') {
    throw new Error('Valid coupon code is required')
  }

  const coupon = await this.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
  })

  if (!coupon) {
    throw new Error('Coupon not found')
  }

  const validation = await coupon.validateCoupon(userId, cartAmount, cartItems)
  if (!validation.isValid) {
    throw new Error(validation.errors[0])
  }

  return coupon
}

// Increment usage
couponSchema.methods.incrementUsage = async function (userId, orderId, discountAmount) {
  this.usedCount += 1

  // Update user's coupon usage
  const User = mongoose.model('User')
  await User.findByIdAndUpdate(userId, {
    $inc: { [`couponUsage.${this._id}`]: 1 },
  })

  await this.save()
}

export default mongoose.model('Coupon', couponSchema)
