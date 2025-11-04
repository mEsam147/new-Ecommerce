// controllers/productController.js
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Review from '../models/Review.js'
import Order from '../models/Order.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiFeatures from '../utils/apiFeatures.js'
import productService from '../services/productService.js'

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Product.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate()

  // Get products with populated category and brand
  const products = await features.query.populate('category', 'name slug').where({ isActive: true })

  const total = await Product.countDocuments(features.filterQuery)

  res.json({
    success: true,
    data: products,
    pagination: {
      page: features.page,
      limit: features.limit,
      total,
      pages: Math.ceil(total / features.limit),
    },
  })
})

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .where({ isActive: true })

  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  // Increment view count
  product.viewCount += 1
  await product.save()

  // Get related products
  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .select('title images price rating')

  // Get product reviews
  const reviews = await Review.find({ product: product._id })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(10)

  res.json({
    success: true,
    data: {
      product,
      relatedProducts,
      reviews,
    },
  })
})

export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params

  const product = await Product.findOne({ slug })
    .populate('category', 'name slug')
    .where({ isActive: true })

  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  // Increment view count
  product.viewCount += 1
  await product.save()

  // Get related products (same category, different products)
  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(8)
    .select('title images price rating slug brand')
    .sort({ 'rating.average': -1, salesCount: -1 })

  // Get product reviews with user info
  const reviews = await Review.find({ product: product._id })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(20)

  // Calculate review statistics
  const reviewStats = await Review.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
  ])

  res.json({
    success: true,
    data: {
      product,
      relatedProducts,
      reviews,
      reviewStats,
    },
  })
})

// controllers/productController.js - Add these methods

/* -------------------------------------------------------------------------- */
/*                               NEW ARRIVALS                                */
/* -------------------------------------------------------------------------- */
export const getNewArrivals = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query

  const products = await Product.find({
    status: 'active',
    isActive: true,
  })
    .select('-description -specifications -reviews -createdAt -updatedAt')
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean()

  res.json({
    success: true,
    data: products,
    count: products.length,
    message: 'New arrivals fetched successfully',
  })
})

/* -------------------------------------------------------------------------- */
/*                               TOP SELLING                                 */
/* -------------------------------------------------------------------------- */
// export const getTopSelling = asyncHandler(async (req, res) => {
//   const { limit = 8 } = req.query

//   const products = await Product.find({
//     status: 'active',
//     isActive: true,
//   })
//     .select('-description -specifications -reviews -createdAt -updatedAt')
//     .populate('category', 'name slug')
//     .sort({
//       salesCount: -1,
//       rating: -1,
//     })
//     .limit(parseInt(limit))
//     .lean()

//   res.json({
//     success: true,
//     data: products,
//     count: products.length,
//     message: 'Top selling products fetched successfully',
//   })
// })

/* -------------------------------------------------------------------------- */
/*                               FEATURED PRODUCTS                           */
/* -------------------------------------------------------------------------- */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query

  const products = await Product.find({
    status: 'active',
    isActive: true,
    featured: true,
  })
    .select('-description -specifications -reviews -createdAt -updatedAt')
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean()

  res.json({
    success: true,
    data: products,
    count: products.length,
    message: 'Featured products fetched successfully',
  })
})

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  // Validate category
  if (req.body.category) {
    const category = await Category.findById(req.body.category)
    if (!category) {
      throw new ApiError(400, 'Invalid category')
    }
  }

  // Generate SKU if not provided
  if (!req.body.sku && req.body.title) {
    req.body.sku = productService.generateSKU(req.body.title)
  }

  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    data: product,
    message: 'Product created successfully',
  })
})

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  // Validate category if provided
  if (req.body.category) {
    const category = await Category.findById(req.body.category)
    if (!category) {
      throw new ApiError(400, 'Invalid category')
    }
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.json({
    success: true,
    data: product,
    message: 'Product updated successfully',
  })
})

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  // Check if product has orders
  const orderCount = await Order.countDocuments({
    'items.product': product._id,
  })

  if (orderCount > 0) {
    // Soft delete
    product.isActive = false
    await product.save()

    res.json({
      success: true,
      message: 'Product deactivated successfully (has existing orders)',
    })
  } else {
    // Hard delete
    await Product.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Product deleted successfully',
    })
  }
})

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private/Admin
export const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'Please upload at least one image')
  }

  const images = req.files.map((file) => ({
    public_id: file.public_id,
    url: file.path,
    alt: product.title,
  }))

  // Set first image as primary if no primary exists
  if (images.length > 0 && !product.images.some((img) => img.isPrimary)) {
    images[0].isPrimary = true
  }

  product.images.push(...images)
  await product.save()

  res.json({
    success: true,
    data: product,
    message: 'Images uploaded successfully',
  })
})

// @desc    Update inventory
// @route   PATCH /api/products/:id/inventory
// @access  Private/Admin
export const updateInventory = asyncHandler(async (req, res) => {
  const product = await productService.updateProductInventory(req.params.id, req.body)

  res.json({
    success: true,
    data: product,
    message: 'Inventory updated successfully',
  })
})

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
// export const getFeaturedProducts = asyncHandler(async (req, res) => {
//   const products = await productService.getFeaturedProducts(8)

//   res.json({
//     success: true,
//     data: products,
//   })
// })

// @desc    Get products by category
// @route   GET /api/products/category/:categorySlug
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categorySlug } = req.params
  const { page = 1, limit = 12, sort = 'createdAt' } = req.query

  const category = await Category.findOne({ slug: categorySlug })
  if (!category) {
    throw new ApiError(404, 'Category not found')
  }

  // Get all subcategories
  const categoryTree = await Category.getCategoryTree()
  const categoryIds = [category._id]

  // Function to get all child category IDs
  const getChildCategoryIds = (parentId, tree) => {
    const parent = tree.find((cat) => cat._id.toString() === parentId.toString())
    if (parent && parent.children) {
      parent.children.forEach((child) => {
        categoryIds.push(child._id)
        getChildCategoryIds(child._id, tree)
      })
    }
  }

  getChildCategoryIds(category._id, categoryTree)

  const products = await Product.find({
    category: { $in: categoryIds },
    isActive: true,
  })
    .populate('category', 'name slug')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)

  const total = await Product.countDocuments({
    category: { $in: categoryIds },
    isActive: true,
  })

  res.json({
    success: true,
    data: products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

// @desc    Get popular products
// @route   GET /api/products/analytics/popular
// @access  Private/Admin
// export const getPopularProducts = asyncHandler(async (req, res) => {
//   const { period = '7days', limit = 10 } = req.query

//   const popularProducts = await productService.getPopularProducts(period, parseInt(limit))

//   res.json({
//     success: true,
//     data: popularProducts,
//   })
// })

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
// export const getTrendingProducts = asyncHandler(async (req, res) => {
//   const { limit = 10 } = req.query

//   const trendingProducts = await productService.getTrendingProducts(parseInt(limit))

//   res.json({
//     success: true,
//     data: trendingProducts,
//   })
// })

// @desc    Get recommended products for user
// @route   GET /api/products/recommended
// @access  Private
export const getRecommendedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query

  const recommendedProducts = await productService.getRecommendedProducts(
    req.user.id,
    parseInt(limit)
  )

  res.json({
    success: true,
    data: recommendedProducts,
  })
})

// @desc    Search products with advanced filtering
// @route   GET /api/products/search/advanced
// @access  Public
export const advancedSearch = asyncHandler(async (req, res) => {
  const searchResults = await productService.searchProducts(req.query)

  res.json({
    success: true,
    data: searchResults,
  })
})

// @desc    Get low stock products
// @route   GET /api/products/analytics/low-stock
// @access  Private/Admin
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const { threshold = 5 } = req.query

  const lowStockProducts = await productService.getLowStockProducts(parseInt(threshold))

  res.json({
    success: true,
    data: lowStockProducts,
  })
})

// @desc    Get product analytics
// @route   GET /api/products/analytics/overview
// @access  Private/Admin
export const getProductAnalytics = asyncHandler(async (req, res) => {
  const { period = '30days' } = req.query

  const analytics = await productService.getProductAnalytics(period)

  res.json({
    success: true,
    data: analytics,
  })
})

// @desc    Bulk update product prices
// @route   PUT /api/products/bulk/prices
// @access  Private/Admin
export const bulkUpdatePrices = asyncHandler(async (req, res) => {
  const { updates } = req.body

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new ApiError(400, 'Updates array is required')
  }

  const result = await productService.bulkUpdatePrices(updates)

  res.json({
    success: true,
    data: result,
    message: `${result.modifiedCount} products updated successfully`,
  })
})

// @desc    Get product variants
// @route   GET /api/products/:id/variants
// @access  Private/Admin
export const getProductVariants = asyncHandler(async (req, res) => {
  const variants = await productService.getProductVariants(req.params.id)

  res.json({
    success: true,
    data: variants,
  })
})

// @desc    Update variant stock
// @route   PATCH /api/products/:productId/variants/:variantId/stock
// @access  Private/Admin
export const updateVariantStock = asyncHandler(async (req, res) => {
  const { stock } = req.body

  const result = await productService.updateVariantStock(
    req.params.productId,
    req.params.variantId,
    parseInt(stock)
  )

  res.json({
    success: true,
    data: result,
    message: 'Variant stock updated successfully',
  })
})

// @desc    Soft delete product
// @route   DELETE /api/products/:id/soft
// @access  Private/Admin
export const softDeleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.softDeleteProduct(req.params.id)

  res.json({
    success: true,
    data: product,
    message: 'Product soft deleted successfully',
  })
})

// @desc    Restore product
// @route   PATCH /api/products/:id/restore
// @access  Private/Admin
export const restoreProduct = asyncHandler(async (req, res) => {
  const product = await productService.restoreProduct(req.params.id)

  res.json({
    success: true,
    data: product,
    message: 'Product restored successfully',
  })
})

// @desc    Validate product data
// @route   POST /api/products/validate
// @access  Private/Admin
export const validateProduct = asyncHandler(async (req, res) => {
  const errors = productService.validateProductData(req.body)

  if (errors.length > 0) {
    throw new ApiError(400, 'Product validation failed', false, errors)
  }

  res.json({
    success: true,
    message: 'Product data is valid',
  })
})

// @desc    Get products by multiple IDs
// @route   POST /api/products/bulk
// @access  Public
export const getProductsByIds = asyncHandler(async (req, res) => {
  const { productIds, populate = [], select = '' } = req.body

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new ApiError(400, 'Product IDs array is required')
  }

  const products = await productService.getProductsByIds(productIds, {
    populate,
    select,
  })

  res.json({
    success: true,
    data: products,
  })
})

// @desc    Create multiple products
// @route   POST /api/products/bulk/create
// @access  Private/Admin
export const createMultipleProducts = asyncHandler(async (req, res) => {
  const { products } = req.body

  if (!Array.isArray(products) || products.length === 0) {
    throw new ApiError(400, 'Products array is required')
  }

  // Validate all products
  for (const productData of products) {
    const errors = productService.validateProductData(productData)
    if (errors.length > 0) {
      throw new ApiError(400, `Validation failed for product: ${errors.join(', ')}`)
    }
  }

  const createdProducts = await productService.createMultipleProducts(products)

  res.status(201).json({
    success: true,
    data: createdProducts,
    message: `${createdProducts.length} products created successfully`,
  })
})

// @desc    Update product rating from reviews
// @route   PATCH /api/products/:id/update-rating
// @access  Private/Admin
export const updateProductRating = asyncHandler(async (req, res) => {
  await productService.updateProductRatings(req.params.id)

  const product = await Product.findById(req.params.id).select('rating title')

  res.json({
    success: true,
    data: product,
    message: 'Product rating updated successfully',
  })
})

// @desc    Set product as featured
// @route   PATCH /api/products/:id/feature
// @access  Private/Admin
export const setFeaturedProduct = asyncHandler(async (req, res) => {
  const { featured } = req.body

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isFeatured: featured },
    { new: true }
  ).select('title isFeatured')

  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  res.json({
    success: true,
    data: product,
    message: `Product ${featured ? 'added to' : 'removed from'} featured products`,
  })
})

// @desc    Get product statistics
// @route   GET /api/products/analytics/stats
// @access  Private/Admin
export const getProductStats = asyncHandler(async (req, res) => {
  const stats = await Product.aggregate([
    {
      $match: { isActive: true },
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$inventory.quantity'] } },
        averagePrice: { $avg: '$price' },
        featuredProducts: {
          $sum: { $cond: ['$isFeatured', 1, 0] },
        },
        outOfStock: {
          $sum: { $cond: [{ $eq: ['$inventory.quantity', 0] }, 1, 0] },
        },
        lowStock: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gt: ['$inventory.quantity', 0] },
                  { $lte: ['$inventory.quantity', '$inventory.lowStockAlert'] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ])

  // Get products by category
  const productsByCategory = await Product.aggregate([
    {
      $match: { isActive: true },
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$inventory.quantity'] } },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $project: {
        category: '$category.name',
        count: 1,
        totalValue: 1,
      },
    },
    { $sort: { count: -1 } },
  ])

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalProducts: 0,
        totalValue: 0,
        averagePrice: 0,
        featuredProducts: 0,
        outOfStock: 0,
        lowStock: 0,
      },
      byCategory: productsByCategory,
    },
  })
})

// @desc    Export products
// @route   GET /api/products/export
// @access  Private/Admin
export const exportProducts = asyncHandler(async (req, res) => {
  const { format = 'json', includeInactive = false } = req.query

  let filter = {}
  if (!includeInactive) {
    filter.isActive = true
  }

  const products = await Product.find(filter)
    .populate('category', 'name')
    .select('-__v -createdAt -updatedAt')

  if (format === 'csv') {
    // Simple CSV conversion (in a real app, you'd use a library like json2csv)
    const csvData = products.map((product) => ({
      Title: product.title,
      SKU: product.sku || '',
      Price: product.price,
      Stock: product.inventory.quantity,
      Category: product.category?.name || '',
      Brand: product.brand || '',
      Active: product.isActive ? 'Yes' : 'No',
    }))

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv')

    // Simple CSV header and rows
    const headers = Object.keys(csvData[0] || {}).join(',')
    const rows = csvData.map((row) => Object.values(row).join(',')).join('\n')

    return res.send(`${headers}\n${rows}`)
  }

  res.json({
    success: true,
    data: products,
    exportedAt: new Date().toISOString(),
    total: products.length,
  })
})

// export const getTrendingProducts = async (req, res) => {
//   try {
//     const { limit = 8 } = req.query

//     // Get products with multiple criteria for trending
//     const trendingProducts = await Product.aggregate([
//       {
//         $match: {
//           isActive: true,
//           $or: [
//             { isFeatured: true },
//             { 'rating.average': { $gte: 4 } },
//             { salesCount: { $gte: 10 } },
//             { viewCount: { $gte: 100 } },
//           ],
//         },
//       },
//       {
//         $addFields: {
//           // Calculate trending score based on multiple factors
//           trendingScore: {
//             $add: [
//               { $multiply: ['$rating.average', 20] }, // Rating weight
//               { $multiply: ['$salesCount', 0.5] }, // Sales weight
//               { $multiply: ['$viewCount', 0.1] }, // Views weight
//               { $cond: [{ $eq: ['$isFeatured', true] }, 50, 0] }, // Featured bonus
//             ],
//           },
//           // Recency bonus for products created in last 30 days
//           recencyBonus: {
//             $cond: [
//               { $gte: ['$createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
//               30,
//               0,
//             ],
//           },
//         },
//       },
//       {
//         $addFields: {
//           finalScore: { $add: ['$trendingScore', '$recencyBonus'] },
//         },
//       },
//       {
//         $sort: { finalScore: -1, createdAt: -1 },
//       },
//       {
//         $limit: parseInt(limit),
//       },
//       {
//         $project: {
//           title: 1,
//           slug: 1,
//           price: 1,
//           comparePrice: 1,
//           images: 1,
//           rating: 1,
//           salesCount: 1,
//           category: 1,
//           brand: 1,
//           isFeatured: 1,
//           createdAt: 1,
//           trendingScore: 1,
//         },
//       },
//     ])

//     res.status(200).json({
//       success: true,
//       data: trendingProducts,
//       count: trendingProducts.length,
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching trending products',
//       error: error.message,
//     })
//   }
// }

// Get popular products (based on sales and ratings)

export const getTrendingProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query

    // Validate limit parameter
    const parsedLimit = parseInt(limit)
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be a number between 1 and 50',
      })
    }

    // Get current date for recency calculation
    const currentDate = new Date()
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Simple aggregation without complex scoring first
    const trendingProducts = await Product.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { isFeatured: true },
            { 'rating.average': { $gte: 4 } },
            { salesCount: { $gte: 5 } },
          ],
        },
      },
      {
        $project: {
          title: 1,
          slug: 1,
          price: 1,
          comparePrice: 1,
          images: { $slice: ['$images', 1] }, // Only get first image
          rating: 1,
          salesCount: 1,
          category: 1,
          brand: 1,
          isFeatured: 1,
          createdAt: 1,
          viewCount: 1,
          // Calculate a simple trending score
          trendingScore: {
            $add: [
              { $ifNull: ['$rating.average', 0] },
              { $multiply: [{ $ifNull: ['$salesCount', 0] }, 0.1] },
              { $cond: [{ $eq: ['$isFeatured', true] }, 2, 0] },
            ],
          },
        },
      },
      {
        $sort: {
          trendingScore: -1,
          createdAt: -1,
        },
      },
      {
        $limit: parsedLimit,
      },
    ])

    // If no products found with criteria, get any active products
    let finalProducts = trendingProducts
    if (trendingProducts.length === 0) {
      finalProducts = await Product.find({ isActive: true })
        .select(
          'title slug price comparePrice images rating salesCount category brand isFeatured createdAt'
        )
        .sort({ createdAt: -1 })
        .limit(parsedLimit)
        .lean()
    }

    res.status(200).json({
      success: true,
      data: finalProducts,
      count: finalProducts.length,
    })
  } catch (error) {
    console.error('Error in getTrendingProducts:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching trending products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    })
  }
}

export const getPopularProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query

    const products = await Product.find({
      isActive: true,
      $or: [{ salesCount: { $gte: 5 } }, { 'rating.average': { $gte: 4 } }],
    })
      .select('title slug price comparePrice images rating salesCount category brand')
      .sort({ salesCount: -1, 'rating.average': -1 })
      .limit(parseInt(limit))

    res.status(200).json({
      success: true,
      data: products,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular products',
      error: error.message,
    })
  }
}

// Get new arrivals
// export const getNewArrivals = async (req, res) => {
//   try {
//     const { limit = 8 } = req.query

//     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

//     const products = await Product.find({
//       isActive: true,
//       createdAt: { $gte: thirtyDaysAgo },
//     })
//       .select('title slug price comparePrice images rating category brand createdAt')
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit))

//     res.status(200).json({
//       success: true,
//       data: products,
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching new arrivals',
//       error: error.message,
//     })
//   }
// }

// Get top selling products
export const getTopSelling = async (req, res) => {
  try {
    const { limit = 8 } = req.query

    const products = await Product.find({
      isActive: true,
      salesCount: { $gt: 0 },

      status: 'active',
    })
      .select('title slug price comparePrice images rating salesCount category brand')
      .sort({ salesCount: -1 })
      .limit(parseInt(limit))

    res.status(200).json({
      success: true,
      data: products,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top selling products',
      error: error.message,
    })
  }
}
