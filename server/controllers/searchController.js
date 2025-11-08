// controllers/searchController.js
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import searchService from '../services/searchService.js'

/**
 * @desc    Global search across products, categories, and brands
 * @route   GET /api/search
 * @access  Public
 */
export const searchAll = asyncHandler(async (req, res) => {
  const { q: query, limit = 8 } = req.query

  if (!query || query.trim().length < 2) {
    return res.json({
      success: true,
      data: {
        products: [],
        categories: [],
        brands: [],
        suggestions: [],
      },
    })
  }

  const results = await searchService.searchAll(query, parseInt(limit))

  res.json({
    success: true,
    data: results,
  })
})

/**
 * @desc    Search only products with advanced filtering
 * @route   GET /api/search/products
 * @access  Public
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const {
    q: query,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    sort = 'relevance',
    page = 1,
    limit = 12,
  } = req.query

  if (!query || query.trim().length < 2) {
    throw new ApiError(400, 'Search query must be at least 2 characters long')
  }

  const filters = {
    category: category || undefined,
    brand: brand || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    inStock: inStock || undefined,
    sort,
    page: parseInt(page),
    limit: parseInt(limit),
  }

  const results = await searchService.searchProducts(query, filters)

  res.json({
    success: true,
    data: results,
  })
})

/**
 * @desc    Get search suggestions
 * @route   GET /api/search/suggestions
 * @access  Public
 */
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q: query, limit = 5 } = req.query

  if (!query || query.trim().length < 2) {
    return res.json({
      success: true,
      data: [],
    })
  }

  const suggestions = await searchService.generateSearchSuggestions(query, parseInt(limit))

  res.json({
    success: true,
    data: suggestions,
  })
})

/**
 * @desc    Get popular search terms
 * @route   GET /api/search/popular
 * @access  Public
 */
export const getPopularSearches = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query

  const popularSearches = await searchService.getPopularSearches(parseInt(limit))

  res.json({
    success: true,
    data: popularSearches,
  })
})

/**
 * @desc    Search by specific type
 * @route   GET /api/search/:type
 * @access  Public
 */
export const searchByType = asyncHandler(async (req, res) => {
  const { type } = req.params
  const { q: query, limit = 12 } = req.query

  if (!query || query.trim().length < 2) {
    throw new ApiError(400, 'Search query must be at least 2 characters long')
  }

  if (!['products', 'categories', 'brands'].includes(type)) {
    throw new ApiError(400, 'Invalid search type. Must be: products, categories, or brands')
  }

  const results = await searchService.searchByType(type, query, parseInt(limit))

  res.json({
    success: true,
    data: results,
    query: query.trim(),
    type,
  })
})

/**
 * @desc    Get search analytics (admin only)
 * @route   GET /api/search/analytics/popular
 * @access  Private/Admin
 */
export const getSearchAnalytics = asyncHandler(async (req, res) => {
  // This would typically query a search_analytics collection
  // For now, return basic analytics based on product data

  const popularProducts = await Product.aggregate([
    {
      $match: { isActive: true },
    },
    {
      $project: {
        title: 1,
        viewCount: 1,
        salesCount: 1,
        searchScore: {
          $add: [{ $multiply: ['$viewCount', 0.3] }, { $multiply: ['$salesCount', 0.7] }],
        },
      },
    },
    {
      $sort: { searchScore: -1 },
    },
    {
      $limit: 10,
    },
  ])

  res.json({
    success: true,
    data: {
      popularProducts,
      totalSearches: 0, // You would track this in a separate collection
      trendingSearches: [],
    },
  })
})
