// models/Brand.js
import mongoose from 'mongoose'

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Brand name cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    logo: {
      public_id: String,
      url: String,
    },
    banner: {
      public_id: String,
      url: String,
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+\..+/, 'Please enter a valid URL'],
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    originCountry: String,
    foundedYear: Number,
    contactEmail: String,
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
    },
    followerCount: {
      type: Number,
      default: 0,
    },
    productCount: {
      type: Number,
      default: 0,
    },
    story: {
      type: String,
      maxlength: [5000, 'Brand story cannot be more than 5000 characters'],
    },
    metaTitle: String,
    metaDescription: String,
    seo: {
      canonicalUrl: String,
      metaRobots: String,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
brandSchema.index({ name: 'text', description: 'text' })
brandSchema.index({ isActive: 1, isFeatured: 1 })
brandSchema.index({ 'rating.average': -1 })
brandSchema.index({ productCount: -1 })
brandSchema.index({ followerCount: -1 })

// Pre-save middleware to generate slug
brandSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }
  next()
})

// Static method to get featured brands
brandSchema.statics.getFeatured = function (limit = 10) {
  return this.find({
    isFeatured: true,
    isActive: true,
  })
    .sort({ 'rating.average': -1, productCount: -1 })
    .limit(limit)
}

// Static method to get brands by category
brandSchema.statics.getByCategory = function (categoryId) {
  return this.find({
    categories: categoryId,
    isActive: true,
  }).sort({ name: 1 })
}

// Method to update product count
brandSchema.methods.updateProductCount = async function () {
  const Product = mongoose.model('Product')
  const count = await Product.countDocuments({
    brand: this.name,
    isActive: true,
  })
  this.productCount = count
  await this.save()
}

// Virtual for discount percentage
brandSchema.virtual('discountPercentage').get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100)
  }
  return 0
})

export default mongoose.model('Brand', brandSchema)
