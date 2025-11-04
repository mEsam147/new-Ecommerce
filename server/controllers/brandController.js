// controllers/brandController.js
import Brand from '../models/Brand.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiFeatures from '../utils/apiFeatures.js'

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Brand.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate()

  const brands = await features.query.populate('categories', 'name slug').where({ isActive: true })

  const total = await Brand.countDocuments(features.filterQuery)

  res.json({
    success: true,
    data: brands,
    pagination: {
      page: features.page,
      limit: features.limit,
      total,
      pages: Math.ceil(total / features.limit),
    },
  })
})

// @desc    Get brand by slug
// @route   GET /api/brands/slug/:slug
// @access  Public
export const getBrandBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params

  const brand = await Brand.findOne({ slug })
    .populate('categories', 'name slug')
    .where({ isActive: true })

  if (!brand) {
    throw new ApiError(404, 'Brand not found')
  }

  // Get brand statistics
  const productCount = await Product.countDocuments({
    brand: brand.name,
    isActive: true,
  })

  // Update product count if different
  if (brand.productCount !== productCount) {
    brand.productCount = productCount
    await brand.save()
  }

  res.json({
    success: true,
    data: brand,
  })
})

// @desc    Get brand products by slug with advanced filtering and sorting
// @route   GET /api/brands/slug/:slug/products
// @access  Public
export const getBrandProductsBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params
  const {
    page = 1,
    limit = 12,
    category,
    sort = 'featured',
    minPrice,
    maxPrice,
    search,
  } = req.query

  // Find brand first
  const brand = await Brand.findOne({ slug }).where({ isActive: true })

  if (!brand) {
    throw new ApiError(404, 'Brand not found')
  }

  // Build filter object
  const filter = {
    brand: { $regex: new RegExp(`^${brand.name}$`, 'i') },
    isActive: true,
  }

  // Add category filter
  if (category) {
    const categories = Array.isArray(category) ? category : category.split(',')
    filter.category = { $in: categories }
  }

  // Add price range filter
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = parseFloat(minPrice)
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
  }

  // Add search filter
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ]
  }

  // Build sort object
  let sortOptions = {}
  switch (sort) {
    case 'newest':
      sortOptions = { createdAt: -1 }
      break
    case 'oldest':
      sortOptions = { createdAt: 1 }
      break
    case 'price-low':
      sortOptions = { price: 1 }
      break
    case 'price-high':
      sortOptions = { price: -1 }
      break
    case 'name-asc':
      sortOptions = { title: 1 }
      break
    case 'name-desc':
      sortOptions = { title: -1 }
      break
    case 'featured':
      sortOptions = { isFeatured: -1, createdAt: -1 }
      break
    case 'popular':
      sortOptions = { salesCount: -1, viewCount: -1 }
      break
    case 'rating':
      sortOptions = { 'rating.average': -1, 'rating.count': -1 }
      break
    default:
      sortOptions = { isFeatured: -1, createdAt: -1 }
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit)
  const productsLimit = parseInt(limit)

  // Execute query with population
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort(sortOptions)
    .limit(productsLimit)
    .skip(skip)

  const total = await Product.countDocuments(filter)

  // Get price range for filter UI
  const priceStats = await Product.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ])

  const priceRange =
    priceStats.length > 0
      ? {
          min: Math.floor(priceStats[0].minPrice),
          max: Math.ceil(priceStats[0].maxPrice),
        }
      : { min: 0, max: 0 }

  res.json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: productsLimit,
      total,
      pages: Math.ceil(total / productsLimit),
    },
    brand: {
      _id: brand._id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logo: brand.logo,
    },
    filters: {
      priceRange,
    },
  })
})

// @desc    Get single brand by ID
// @route   GET /api/brands/:id
// @access  Public
export const getBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id)
    .populate('categories', 'name slug')
    .where({ isActive: true })

  if (!brand) {
    throw new ApiError(404, 'Brand not found')
  }

  // Get brand statistics
  const productCount = await Product.countDocuments({
    brand: brand.name,
    isActive: true,
  })

  // Update product count if different
  if (brand.productCount !== productCount) {
    brand.productCount = productCount
    await brand.save()
  }

  res.json({
    success: true,
    data: brand,
  })
})

// @desc    Create new brand
// @route   POST /api/brands
// @access  Private/Admin
export const createBrand = asyncHandler(async (req, res) => {
  // Check if brand name already exists
  const existingBrand = await Brand.findOne({
    name: new RegExp(`^${req.body.name}$`, 'i'),
  })

  if (existingBrand) {
    throw new ApiError(400, 'Brand with this name already exists')
  }

  const brand = await Brand.create(req.body)

  res.status(201).json({
    success: true,
    data: brand,
    message: 'Brand created successfully',
  })
})

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
export const updateBrand = asyncHandler(async (req, res) => {
  let brand = await Brand.findById(req.params.id)

  if (!brand) {
    throw new ApiError(404, 'Brand not found')
  }

  // Check if brand name already exists (excluding current brand)
  if (req.body.name && req.body.name !== brand.name) {
    const existingBrand = await Brand.findOne({
      name: new RegExp(`^${req.body.name}$`, 'i'),
      _id: { $ne: brand._id },
    })

    if (existingBrand) {
      throw new ApiError(400, 'Brand with this name already exists')
    }
  }

  brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('categories', 'name slug')

  res.json({
    success: true,
    data: brand,
    message: 'Brand updated successfully',
  })
})

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id)

  if (!brand) {
    throw new ApiError(404, 'Brand not found')
  }

  // Check if brand has products
  const productCount = await Product.countDocuments({
    brand: brand.name,
  })

  if (productCount > 0) {
    throw new ApiError(400, 'Cannot delete brand with existing products')
  }

  await Brand.findByIdAndDelete(req.params.id)

  res.json({
    success: true,
    message: 'Brand deleted successfully',
  })
})

// @desc    Upload brand logo
// @route   POST /api/brands/:id/logo
// @access  Private/Admin
export const uploadBrandLogo = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id)

  if (!brand) {
    throw new ApiError(404, 'Brand not found')
  }

  if (!req.file) {
    throw new ApiError(400, 'Please upload a logo image')
  }

  brand.logo = {
    public_id: req.file.public_id,
    url: req.file.path,
  }

  await brand.save()

  res.json({
    success: true,
    data: brand,
    message: 'Brand logo uploaded successfully',
  })
})

// @desc    Upload brand banner
// @route   POST /api/brands/:id/banner
// @access  Private/Admin
export const uploadBrandBanner = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id)

  if (!brand) {
    throw new ApiError(404, 'Brand not found')
  }

  if (!req.file) {
    throw new ApiError(400, 'Please upload a banner image')
  }

  brand.banner = {
    public_id: req.file.public_id,
    url: req.file.path,
  }

  await brand.save()

  res.json({
    success: true,
    data: brand,
    message: 'Brand banner uploaded successfully',
  })
})

// @desc    Get brand products by ID
// @route   GET /api/brands/:id/products
// @access  Public
export const getBrandProducts = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id)

  if (!brand) {
    throw new ApiError(404, 'Brand not found')
  }

  const features = new ApiFeatures(Product.find({ brand: brand.name }), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate()

  const products = await features.query.populate('category', 'name slug').where({ isActive: true })

  const total = await Product.countDocuments({
    brand: brand.name,
    isActive: true,
  })

  res.json({
    success: true,
    data: products,
    pagination: {
      page: features.page,
      limit: features.limit,
      total,
      pages: Math.ceil(total / features.limit),
    },
    brand: {
      _id: brand._id,
      name: brand.name,
      slug: brand.slug,
    },
  })
})

// @desc    Get featured brands
// @route   GET /api/brands/featured
// @access  Public
export const getFeaturedBrands = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query

  const brands = await Brand.find({
    isFeatured: true,
    isActive: true,
  })
    .populate('categories', 'name slug')
    .sort({ 'rating.average': -1, productCount: -1 })
    .limit(parseInt(limit))

  res.json({
    success: true,
    data: brands,
  })
})

// @desc    Follow brand
// @route   POST /api/brands/:id/follow
// @access  Private
export const followBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id)

  if (!brand) {
    throw new ApiError(404, 'Brand not found')
  }

  const user = await User.findById(req.user.id)

  // Check if already following
  if (user.followedBrands.includes(brand._id)) {
    throw new ApiError(400, 'Already following this brand')
  }

  // Add to user's followed brands
  user.followedBrands.push(brand._id)
  await user.save()

  // Increment brand follower count
  brand.followerCount += 1
  await brand.save()

  res.json({
    success: true,
    message: 'Brand followed successfully',
    data: {
      brand: {
        _id: brand._id,
        name: brand.name,
        followerCount: brand.followerCount,
      },
    },
  })
})

// @desc    Unfollow brand
// @route   DELETE /api/brands/:id/unfollow
// @access  Private
export const unfollowBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id)

  if (!brand) {
    throw new ApiError(404, 'Brand not found')
  }

  const user = await User.findById(req.user.id)

  // Check if following
  if (!user.followedBrands.includes(brand._id)) {
    throw new ApiError(400, 'Not following this brand')
  }

  // Remove from user's followed brands
  user.followedBrands = user.followedBrands.filter(
    (brandId) => brandId.toString() !== brand._id.toString()
  )
  await user.save()

  // Decrement brand follower count
  brand.followerCount = Math.max(0, brand.followerCount - 1)
  await brand.save()

  res.json({
    success: true,
    message: 'Brand unfollowed successfully',
    data: {
      brand: {
        _id: brand._id,
        name: brand.name,
        followerCount: brand.followerCount,
      },
    },
  })
})

// @desc    Get user's followed brands
// @route   GET /api/brands/user/followed
// @access  Private
export const getFollowedBrands = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'followedBrands',
    select: 'name slug logo description productCount followerCount',
    match: { isActive: true },
  })

  res.json({
    success: true,
    data: user.followedBrands || [],
  })
})

// @desc    Get categories for a specific brand
// @route   GET /api/brands/:slug/categories
// @access  Public
export const getBrandCategories = asyncHandler(async (req, res) => {
  const { slug } = req.params

  const brand = await Brand.findOne({ slug }).where({ isActive: true })

  if (!brand) {
    throw new ApiError(404, 'Brand not found')
  }

  // Get unique categories from brand's products with counts
  const categories = await Product.aggregate([
    {
      $match: {
        brand: { $regex: new RegExp(`^${brand.name}$`, 'i') },
        isActive: true,
      },
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'categories',
        let: { categoryName: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$name', '$$categoryName'] },
              isActive: true,
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              slug: 1,
              description: 1,
              image: 1,
            },
          },
        ],
        as: 'categoryInfo',
      },
    },
    {
      $unwind: '$categoryInfo',
    },
    {
      $project: {
        _id: '$categoryInfo._id',
        name: '$categoryInfo.name',
        slug: '$categoryInfo.slug',
        description: '$categoryInfo.description',
        image: '$categoryInfo.image',
        productsCount: '$count',
      },
    },
    {
      $sort: { productsCount: -1, name: 1 },
    },
  ])

  res.json({
    success: true,
    data: categories,
  })
})

//
