// // models/Product.js
// import mongoose from 'mongoose'

// const variantSchema = new mongoose.Schema({
//   size: {
//     type: String,
//     required: true,
//   },
//   color: {
//     type: String,
//     required: true,
//   },
//   stock: {
//     type: Number,
//     required: true,
//     min: 0,
//     default: 0,
//   },
//   sku: {
//     type: String,
//     unique: true,
//     sparse: true,
//   },
//   price: {
//     type: Number,
//     min: 0,
//   },
// })

// const productSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: [true, 'Product title is required'],
//       trim: true,
//       maxlength: [200, 'Title cannot be more than 200 characters'],
//     },
//     slug: {
//       type: String,
//       unique: true,
//       lowercase: true,
//     },
//     description: {
//       type: String,
//       required: [true, 'Product description is required'],
//       maxlength: [2000, 'Description cannot be more than 2000 characters'],
//     },
//     shortDescription: {
//       type: String,
//       maxlength: [500, 'Short description cannot be more than 500 characters'],
//     },
//     price: {
//       type: Number,
//       required: [true, 'Product price is required'],
//       min: [0, 'Price must be positive'],
//     },
//     comparePrice: {
//       type: Number,
//       min: [0, 'Compare price must be positive'],
//     },
//     costPrice: {
//       type: Number,
//       min: [0, 'Cost price must be positive'],
//     },
//     category: {
//       type: String,
//       required: [true, 'Product category is required'],
//       index: true,
//     },
//     subcategory: {
//       type: String,
//       default: 'N/A',
//     },
//     brand: {
//       type: String,
//       index: true,
//     },
//     images: [
//       {
//         public_id: {
//           type: String,
//           required: true,
//         },
//         url: {
//           type: String,
//           required: true,
//         },
//         alt: String,
//         isPrimary: {
//           type: Boolean,
//           default: false,
//         },
//       },
//     ],
//     variants: [variantSchema],
//     features: [String],
//     specifications: {
//       weight: {
//         type: String,
//         default: 'N/A',
//       },
//       dimensions: {
//         type: String,
//         default: 'N/A',
//       },
//       material: {
//         type: String,
//         default: 'N/A',
//       },
//       color: {
//         type: String,
//         default: 'N/A',
//       },
//       warranty: {
//         type: String,
//         default: '2 years',
//       },
//       // Additional dynamic specifications
//       additional: {
//         type: Map,
//         of: String,
//       },
//     },
//     tags: [String],
//     metaTitle: String,
//     metaDescription: String,
//     isFeatured: {
//       type: Boolean,
//       default: false,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//       index: true,
//     },
//     inventory: {
//       trackQuantity: {
//         type: Boolean,
//         default: true,
//       },
//       quantity: {
//         type: Number,
//         default: 0,
//       },
//       lowStockAlert: {
//         type: Number,
//         default: 5,
//       },
//     },
//     shipping: {
//       weight: Number,
//       dimensions: {
//         length: Number,
//         width: Number,
//         height: Number,
//       },
//       freeShipping: {
//         type: Boolean,
//         default: false,
//       },
//     },
//     seo: {
//       canonicalUrl: String,
//       metaRobots: String,
//     },
//     rating: {
//       average: {
//         type: Number,
//         default: 0,
//         min: 0,
//         max: 5,
//       },
//       count: {
//         type: Number,
//         default: 0,
//       },
//       distribution: {
//         1: { type: Number, default: 0 },
//         2: { type: Number, default: 0 },
//         3: { type: Number, default: 0 },
//         4: { type: Number, default: 0 },
//         5: { type: Number, default: 0 },
//       },
//     },
//     salesCount: {
//       type: Number,
//       default: 0,
//     },
//     viewCount: {
//       type: Number,
//       default: 0,
//     },
//     coupons: [
//       {
//         code: {
//           type: String,
//           required: true,
//           uppercase: true,
//         },
//         discountType: {
//           type: String,
//           enum: ['percentage', 'fixed'],
//           default: 'percentage',
//         },
//         discountValue: {
//           type: Number,
//           required: true,
//           min: 0,
//         },
//         minPurchase: {
//           type: Number,
//           default: 0,
//         },
//         maxDiscount: {
//           type: Number,
//         },
//         startDate: {
//           type: Date,
//           required: true,
//         },
//         endDate: {
//           type: Date,
//           required: true,
//         },
//         usageLimit: {
//           type: Number,
//         },
//         usedCount: {
//           type: Number,
//           default: 0,
//         },
//         isActive: {
//           type: Boolean,
//           default: true,
//         },
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// )

// // Indexes for search and filtering
// productSchema.index({ title: 'text', description: 'text', tags: 'text' })
// productSchema.index({ category: 1, brand: 1, price: 1 })
// productSchema.index({ isActive: 1, isFeatured: 1 })
// productSchema.index({ 'rating.average': -1 })
// productSchema.index({ salesCount: -1 })
// productSchema.index({ createdAt: -1 })
// productSchema.index({ 'coupons.code': 1 })
// productSchema.index({ 'coupons.isActive': 1 })

// // Virtual for discount percentage
// productSchema.virtual('discountPercentage').get(function () {
//   if (this.comparePrice && this.comparePrice > this.price) {
//     return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100)
//   }
//   return 0
// })

// // Virtual for active coupons
// productSchema.virtual('activeCoupons').get(function () {
//   const now = new Date()
//   return this.coupons.filter(
//     (coupon) =>
//       coupon.isActive &&
//       coupon.startDate <= now &&
//       coupon.endDate >= now &&
//       (coupon.usageLimit === undefined || coupon.usedCount < coupon.usageLimit)
//   )
// })

// // Pre-save middleware to generate slug
// productSchema.pre('save', function (next) {
//   if (this.isModified('title')) {
//     this.slug = this.title
//       .toLowerCase()
//       .replace(/[^a-z0-9 -]/g, '')
//       .replace(/\s+/g, '-')
//       .replace(/-+/g, '-')
//   }
//   next()
// })

// // Method to check if product is in stock
// productSchema.methods.isInStock = function (variantIndex = null) {
//   if (variantIndex !== null && this.variants[variantIndex]) {
//     return this.variants[variantIndex].stock > 0
//   }
//   return this.inventory.quantity > 0
// }

// // Method to apply coupon
// productSchema.methods.applyCoupon = function (couponCode, cartTotal) {
//   const coupon = this.coupons.find(
//     (c) =>
//       c.code === couponCode.toUpperCase() &&
//       c.isActive &&
//       c.startDate <= new Date() &&
//       c.endDate >= new Date() &&
//       (c.usageLimit === undefined || c.usedCount < c.usageLimit) &&
//       cartTotal >= c.minPurchase
//   )

//   if (!coupon) {
//     return { success: false, message: 'Invalid or expired coupon' }
//   }

//   let discount = 0
//   if (coupon.discountType === 'percentage') {
//     discount = (cartTotal * coupon.discountValue) / 100
//     if (coupon.maxDiscount && discount > coupon.maxDiscount) {
//       discount = coupon.maxDiscount
//     }
//   } else {
//     discount = coupon.discountValue
//   }

//   return {
//     success: true,
//     discount,
//     finalAmount: cartTotal - discount,
//     coupon: {
//       code: coupon.code,
//       discountType: coupon.discountType,
//       discountValue: coupon.discountValue,
//     },
//   }
// }

// // Static method to get featured products
// productSchema.statics.getFeatured = function (limit = 10) {
//   return this.find({
//     isFeatured: true,
//     isActive: true,
//   })
//     .sort({ 'rating.average': -1, salesCount: -1 })
//     .limit(limit)
// }

// // Static method to get products by category
// productSchema.statics.getByCategory = function (category, limit = 20) {
//   return this.find({
//     category,
//     isActive: true,
//   })
//     .sort({ 'rating.average': -1 })
//     .limit(limit)
// }

// export default mongoose.model('Product', productSchema)

import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  price: {
    type: Number,
    min: 0,
  },
})

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot be more than 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be positive'],
    },
    comparePrice: {
      type: Number,
      min: [0, 'Compare price must be positive'],
    },
    costPrice: {
      type: Number,
      min: [0, 'Cost price must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      index: true,
    },
    subcategory: {
      type: String,
      default: 'N/A',
    },
    brand: {
      type: String,
      index: true,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    variants: [variantSchema],
    features: [String],
    specifications: {
      weight: {
        type: String,
        default: 'N/A',
      },
      dimensions: {
        type: String,
        default: 'N/A',
      },
      material: {
        type: String,
        default: 'N/A',
      },
      color: {
        type: String,
        default: 'N/A',
      },
      warranty: {
        type: String,
        default: '2 years',
      },
      // Additional dynamic specifications
      additional: {
        type: Map,
        of: String,
      },
    },
    tags: [String],
    metaTitle: String,
    metaDescription: String,
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    inventory: {
      trackQuantity: {
        type: Boolean,
        default: true,
      },
      quantity: {
        type: Number,
        default: 0,
      },
      lowStockAlert: {
        type: Number,
        default: 5,
      },
    },
    shipping: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      freeShipping: {
        type: Boolean,
        default: false,
      },
    },
    seo: {
      canonicalUrl: String,
      metaRobots: String,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
      },
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    coupons: [
      {
        code: {
          type: String,
          required: true,
          uppercase: true,
        },
        discountType: {
          type: String,
          enum: ['percentage', 'fixed'],
          default: 'percentage',
        },
        discountValue: {
          type: Number,
          required: true,
          min: 0,
        },
        minPurchase: {
          type: Number,
          default: 0,
        },
        maxDiscount: {
          type: Number,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        usageLimit: {
          type: Number,
        },
        usedCount: {
          type: Number,
          default: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Indexes for search and filtering
productSchema.index({ title: 'text', description: 'text', tags: 'text' })
productSchema.index({ category: 1, brand: 1, price: 1 })
productSchema.index({ isActive: 1, isFeatured: 1 })
productSchema.index({ 'rating.average': -1 })
productSchema.index({ salesCount: -1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ 'coupons.code': 1 })
productSchema.index({ 'coupons.isActive': 1 })

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100)
  }
  return 0
})

// Virtual for active coupons
productSchema.virtual('activeCoupons').get(function () {
  const now = new Date()
  return this.coupons.filter(
    (coupon) =>
      coupon.isActive &&
      coupon.startDate <= now &&
      coupon.endDate >= now &&
      (coupon.usageLimit === undefined || coupon.usedCount < coupon.usageLimit)
  )
})

// Pre-save middleware to generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }
  next()
})

// Method to check if product is in stock
productSchema.methods.isInStock = function (variantIndex = null) {
  if (variantIndex !== null && this.variants[variantIndex]) {
    return this.variants[variantIndex].stock > 0
  }
  return this.inventory.quantity > 0
}

// Method to apply coupon
productSchema.methods.applyCoupon = function (couponCode, cartTotal) {
  const coupon = this.coupons.find(
    (c) =>
      c.code === couponCode.toUpperCase() &&
      c.isActive &&
      c.startDate <= new Date() &&
      c.endDate >= new Date() &&
      (c.usageLimit === undefined || c.usedCount < c.usageLimit) &&
      cartTotal >= c.minPurchase
  )

  if (!coupon) {
    return { success: false, message: 'Invalid or expired coupon' }
  }

  let discount = 0
  if (coupon.discountType === 'percentage') {
    discount = (cartTotal * coupon.discountValue) / 100
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }
  } else {
    discount = coupon.discountValue
  }

  return {
    success: true,
    discount,
    finalAmount: cartTotal - discount,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
  }
}

// Static method to get featured products
productSchema.statics.getFeatured = function (limit = 10) {
  return this.find({
    isFeatured: true,
    isActive: true,
  })
    .sort({ 'rating.average': -1, salesCount: -1 })
    .limit(limit)
}

// Static method to get products by category
productSchema.statics.getByCategory = function (category, limit = 20) {
  return this.find({
    category,
    isActive: true,
  })
    .sort({ 'rating.average': -1 })
    .limit(limit)
}

export default mongoose.model('Product', productSchema)
