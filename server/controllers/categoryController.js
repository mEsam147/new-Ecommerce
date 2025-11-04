// controllers/categoryController.js
import Category from '../models/Category.js'
import Product from '../models/Product.js'
import Brand from '../models/Brand.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('subcategories')
    .populate('parent', 'name slug')
    .sort({ sortOrder: 1, name: 1 })

  res.json({
    success: true,
    data: categories,
  })
})

export const getTopCategories = async (req, res) => {
  try {
    const { limit = 6 } = req.query

    const categories = await Category.find({
      isActive: true,
      parent: null,
    })
      .populate({
        path: 'subcategories',
        match: { isActive: true },
        select: 'name slug image featured productsCount',
        options: { limit: 3 },
      })
      .select('name slug description image featured productsCount')
      .sort({ featured: -1, productsCount: -1 })
      .limit(parseInt(limit))

    res.status(200).json({
      success: true,
      data: categories,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top categories',
      error: error.message,
    })
  }
}

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
export const getCategoryTree = asyncHandler(async (req, res) => {
  const categories = await Category.getCategoryTree()

  res.json({
    success: true,
    data: categories,
  })
})

// @desc    Get categories by brand slug
// @route   GET /api/categories/brand/:brandSlug
// @access  Public
export const getCategoriesByBrand = asyncHandler(async (req, res) => {
  const { brandSlug } = req.params

  console.log(`Fetching categories for brand: ${brandSlug}`)

  // Find the brand first
  const brand = await Brand.findOne({ slug: brandSlug, isActive: true })

  if (!brand) {
    console.log('Brand not found:', brandSlug)
    throw new ApiError(404, 'Brand not found')
  }

  console.log(`Found brand: ${brand.name}`)

  try {
    // Method 1: Using aggregation (more efficient)
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
          productsCount: { $sum: 1 },
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
          parent: '$categoryInfo.parent',
          featured: '$categoryInfo.featured',
          sortOrder: '$categoryInfo.sortOrder',
          productsCount: 1,
          createdAt: '$categoryInfo.createdAt',
          updatedAt: '$categoryInfo.updatedAt',
        },
      },
      {
        $sort: { productsCount: -1, name: 1 },
      },
    ])

    console.log(`Found ${categories.length} categories for brand ${brand.name}`)

    res.json({
      success: true,
      data: categories,
      brand: {
        _id: brand._id,
        name: brand.name,
        slug: brand.slug,
      },
    })
  } catch (error) {
    console.error('Error in getCategoriesByBrand:', error)

    // Fallback method if aggregation fails
    const products = await Product.find({
      brand: { $regex: new RegExp(`^${brand.name}$`, 'i') },
      isActive: true,
    }).select('category')

    const categoryCounts = {}
    products.forEach((product) => {
      if (product.category) {
        categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1
      }
    })

    const categoryNames = Object.keys(categoryCounts)
    const categories = await Category.find({
      name: { $in: categoryNames },
      isActive: true,
    }).sort({ sortOrder: 1, name: 1 })

    const categoriesWithCounts = categories.map((category) => ({
      ...category.toObject(),
      productsCount: categoryCounts[category.name] || 0,
    }))

    res.json({
      success: true,
      data: categoriesWithCounts,
      brand: {
        _id: brand._id,
        name: brand.name,
        slug: brand.slug,
      },
    })
  }
})

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('subcategories')
    .populate('parent')
    .populate('productsCount')

  if (!category) {
    throw new ApiError(404, 'Category not found')
  }

  // Get featured products in this category
  const featuredProducts = await Product.find({
    category: category.name,
    isFeatured: true,
    isActive: true,
  }).limit(8)

  res.json({
    success: true,
    data: {
      category,
      featuredProducts,
    },
  })
})

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate('subcategories')
    .populate('parent')
    .populate('productsCount')

  if (!category) {
    throw new ApiError(404, 'Category not found')
  }

  // Get products in this category
  const products = await Product.find({
    category: category.name,
    isActive: true,
  }).limit(12)

  res.json({
    success: true,
    data: {
      category,
      products,
    },
  })
})

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body)

  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully',
  })
})

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!category) {
    throw new ApiError(404, 'Category not found')
  }

  res.json({
    success: true,
    data: category,
    message: 'Category updated successfully',
  })
})

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)

  if (!category) {
    throw new ApiError(404, 'Category not found')
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category.name })
  if (productCount > 0) {
    throw new ApiError(400, 'Cannot delete category with existing products')
  }

  // Check if category has subcategories
  const subcategoryCount = await Category.countDocuments({ parent: category._id })
  if (subcategoryCount > 0) {
    throw new ApiError(400, 'Cannot delete category with existing subcategories')
  }

  await Category.findByIdAndDelete(req.params.id)

  res.json({
    success: true,
    message: 'Category deleted successfully',
  })
})

// @desc    Upload category image
// @route   POST /api/categories/:id/image
// @access  Private/Admin
export const uploadCategoryImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload an image')
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      image: {
        public_id: req.file.public_id,
        url: req.file.path,
      },
    },
    { new: true }
  )

  if (!category) {
    throw new ApiError(404, 'Category not found')
  }

  res.json({
    success: true,
    data: category,
    message: 'Category image uploaded successfully',
  })
})
