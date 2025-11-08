// services/searchService.js
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Brand from '../models/Brand.js'

export class SearchService {
  /**
   * Search products with advanced filtering - FIXED VERSION
   */
  async searchProducts(query, filters = {}) {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sort = 'relevance',
      page = 1,
      limit = 12,
    } = filters

    try {
      // Build the base filter
      const filter = { isActive: true }

      // Text search using MongoDB text search if query provided
      if (query && query.trim().length >= 2) {
        const searchQuery = query.trim()

        // Use MongoDB text search with proper handling
        filter.$text = { $search: searchQuery }
      }

      // Category filter
      if (category) {
        const categories = Array.isArray(category) ? category : [category]
        filter.category = { $in: categories }
      }

      // Brand filter
      if (brand) {
        const brands = Array.isArray(brand) ? brand : [brand]
        filter.brand = { $in: brands }
      }

      // Price range filter
      if (minPrice || maxPrice) {
        filter.price = {}
        if (minPrice) filter.price.$gte = parseFloat(minPrice)
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
      }

      // Stock filter
      if (inStock === 'true') {
        filter.$or = [{ 'inventory.quantity': { $gt: 0 } }, { 'variants.stock': { $gt: 0 } }]
      }

      // Build sort options with proper text score handling
      let sortOptions = {}
      let projection = {
        title: 1,
        slug: 1,
        price: 1,
        comparePrice: 1,
        images: 1,
        rating: 1,
        salesCount: 1,
        brand: 1,
        category: 1,
        inventory: 1,
        variants: 1,
        createdAt: 1,
      }

      // If using text search, include text score
      if (filter.$text) {
        projection.score = { $meta: 'textScore' }
      }

      // Apply sort options
      switch (sort) {
        case 'relevance':
          if (filter.$text) {
            sortOptions = { score: { $meta: 'textScore' } }
          } else {
            sortOptions = {
              'rating.average': -1,
              salesCount: -1,
              isFeatured: -1,
              createdAt: -1,
            }
          }
          break
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
        case 'popular':
          sortOptions = { salesCount: -1, 'rating.average': -1 }
          break
        case 'rating':
          sortOptions = { 'rating.average': -1, 'rating.count': -1 }
          break
        case 'featured':
          sortOptions = { isFeatured: -1, createdAt: -1 }
          break
        default:
          if (filter.$text) {
            sortOptions = { score: { $meta: 'textScore' } }
          } else {
            sortOptions = {
              'rating.average': -1,
              salesCount: -1,
              isFeatured: -1,
            }
          }
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit)
      const limitNum = parseInt(limit)

      // Build the query
      let productQuery = Product.find(filter)
        .select(projection)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .limit(limitNum)
        .skip(skip)

      // Execute query and count in parallel
      const [products, total] = await Promise.all([
        productQuery.lean(),
        Product.countDocuments(filter),
      ])

      // Get filter options
      const filterOptions = await this.getFilterOptions(filter)

      return {
        products,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        filters: filterOptions,
        query,
      }
    } catch (error) {
      console.error('Search error:', error)

      // Fallback to regex search if text search fails
      if (error.message.includes('text score metadata')) {
        return this.searchProductsFallback(query, filters)
      }

      throw new Error('Search failed')
    }
  }

  /**
   * Fallback search using regex when text search fails
   */
  async searchProductsFallback(query, filters = {}) {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sort = 'relevance',
      page = 1,
      limit = 12,
    } = filters

    // Build the base filter
    const filter = { isActive: true }

    // Text search using regex (fallback)
    if (query && query.trim().length >= 2) {
      const searchRegex = new RegExp(query.trim(), 'i')
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { brand: searchRegex },
        { category: searchRegex },
      ]
    }

    // Apply other filters (same as above)
    if (category) {
      const categories = Array.isArray(category) ? category : [category]
      filter.category = { $in: categories }
    }

    if (brand) {
      const brands = Array.isArray(brand) ? brand : [brand]
      filter.brand = { $in: brands.map((b) => new RegExp(b, 'i')) }
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }

    if (inStock === 'true') {
      filter.$or = [{ 'inventory.quantity': { $gt: 0 } }, { 'variants.stock': { $gt: 0 } }]
    }

    // Build sort options for fallback
    const sortOptions = this.buildSortOptions(sort, query)

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const limitNum = parseInt(limit)

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select(
          'title slug price comparePrice images rating salesCount brand category inventory variants createdAt'
        )
        .populate('category', 'name slug')
        .sort(sortOptions)
        .limit(limitNum)
        .skip(skip)
        .lean(),
      Product.countDocuments(filter),
    ])

    // Get filter options
    const filterOptions = await this.getFilterOptions(filter)

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      filters: filterOptions,
      query,
    }
  }

  /**
   * Global search across products, categories, and brands
   */
  async searchAll(query, limit = 8) {
    if (!query || query.trim().length < 2) {
      return {
        products: [],
        categories: [],
        brands: [],
        suggestions: [],
      }
    }

    const searchQuery = query.trim()

    try {
      const [products, categories, brands, suggestions] = await Promise.all([
        this.searchProductsBasic(searchQuery, limit),
        this.searchCategories(searchQuery, 5),
        this.searchBrands(searchQuery, 5),
        this.generateSearchSuggestions(searchQuery),
      ])

      return {
        products,
        categories,
        brands,
        suggestions,
        query: searchQuery,
      }
    } catch (error) {
      console.error('Global search error:', error)
      throw new Error('Global search failed')
    }
  }

  /**
   * Basic product search for global search
   */
  async searchProductsBasic(query, limit) {
    const searchRegex = new RegExp(query, 'i')

    return await Product.find({
      isActive: true,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { brand: searchRegex },
        { category: searchRegex },
      ],
    })
      .select('title slug price comparePrice images rating salesCount brand category')
      .populate('category', 'name slug')
      .sort({
        'rating.average': -1,
        salesCount: -1,
        isFeatured: -1,
      })
      .limit(limit)
      .lean()
  }

  /**
   * Search categories
   */
  async searchCategories(query, limit) {
    const searchRegex = new RegExp(query, 'i')

    return await Category.find({
      isActive: true,
      $or: [{ name: searchRegex }, { description: searchRegex }],
    })
      .select('name slug description image productsCount')
      .sort({ productsCount: -1, name: 1 })
      .limit(limit)
      .lean()
  }

  /**
   * Search brands
   */
  async searchBrands(query, limit) {
    const searchRegex = new RegExp(query, 'i')

    return await Brand.find({
      isActive: true,
      $or: [{ name: searchRegex }, { description: searchRegex }],
    })
      .select('name slug description logo productCount followerCount')
      .sort({ productCount: -1, followerCount: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Generate search suggestions
   */
  async generateSearchSuggestions(query, limit = 8) {
    const suggestions = []

    try {
      // Product title suggestions
      const productSuggestions = await Product.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
        ],
        isActive: true,
      })
        .select('title category slug brand')
        .limit(3)
        .lean()

      suggestions.push(
        ...productSuggestions.map((p) => ({
          type: 'product',
          text: p.title,
          category: p.category,
          brand: p.brand,
          slug: p.slug,
          url: `/products/${p.slug}`,
        }))
      )

      // Category suggestions
      const categorySuggestions = await Category.find({
        name: { $regex: query, $options: 'i' },
        isActive: true,
      })
        .select('name slug')
        .limit(2)
        .lean()

      suggestions.push(
        ...categorySuggestions.map((c) => ({
          type: 'category',
          text: c.name,
          slug: c.slug,
          url: `/categories/${c.slug}`,
        }))
      )

      // Brand suggestions
      const brandSuggestions = await Brand.find({
        name: { $regex: query, $options: 'i' },
        isActive: true,
      })
        .select('name slug')
        .limit(2)
        .lean()

      suggestions.push(
        ...brandSuggestions.map((b) => ({
          type: 'brand',
          text: b.name,
          slug: b.slug,
          url: `/brands/${b.slug}`,
        }))
      )

      return suggestions.slice(0, limit)
    } catch (error) {
      console.error('Suggestions generation error:', error)
      return suggestions
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearches(limit = 10) {
    // Return mock data - in production, track this in a separate collection
    const popularSearches = [
      { term: 'iPhone', count: 1250, type: 'product' },
      { term: 'Samsung', count: 980, type: 'brand' },
      { term: 'Laptop', count: 876, type: 'category' },
      { term: 'Headphones', count: 754, type: 'category' },
      { term: 'Nike', count: 632, type: 'brand' },
      { term: 'Smart Watch', count: 543, type: 'product' },
      { term: 'Camera', count: 432, type: 'category' },
      { term: 'Gaming', count: 321, type: 'category' },
      { term: 'Shoes', count: 298, type: 'category' },
      { term: 'Home Decor', count: 287, type: 'category' },
    ].slice(0, parseInt(limit))

    return popularSearches
  }

  /**
   * Build sort options based on sort type
   */
  buildSortOptions(sort, query) {
    switch (sort) {
      case 'relevance':
        return {
          'rating.average': -1,
          salesCount: -1,
          isFeatured: -1,
          createdAt: -1,
        }
      case 'newest':
        return { createdAt: -1 }
      case 'oldest':
        return { createdAt: 1 }
      case 'price-low':
        return { price: 1 }
      case 'price-high':
        return { price: -1 }
      case 'name-asc':
        return { title: 1 }
      case 'name-desc':
        return { title: -1 }
      case 'popular':
        return { salesCount: -1, 'rating.average': -1 }
      case 'rating':
        return { 'rating.average': -1, 'rating.count': -1 }
      case 'featured':
        return { isFeatured: -1, createdAt: -1 }
      default:
        return {
          'rating.average': -1,
          salesCount: -1,
          isFeatured: -1,
        }
    }
  }

  /**
   * Get filter options for UI
   */
  async getFilterOptions(baseFilter) {
    try {
      const [categories, brands, priceRange] = await Promise.all([
        // Get categories with counts
        Product.aggregate([
          { $match: baseFilter },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: 'name',
              as: 'categoryInfo',
            },
          },
          { $unwind: '$categoryInfo' },
          {
            $project: {
              _id: '$categoryInfo._id',
              name: '$categoryInfo.name',
              slug: '$categoryInfo.slug',
              count: 1,
            },
          },
          { $sort: { count: -1 } },
        ]),

        // Get brands with counts
        Product.aggregate([
          { $match: baseFilter },
          { $group: { _id: '$brand', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ]),

        // Get price range
        Product.aggregate([
          { $match: baseFilter },
          {
            $group: {
              _id: null,
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' },
            },
          },
        ]),
      ])

      return {
        categories: categories || [],
        brands: (brands || []).map((b) => ({ name: b._id, count: b.count })),
        priceRange:
          priceRange.length > 0
            ? {
                min: Math.floor(priceRange[0].minPrice || 0),
                max: Math.ceil(priceRange[0].maxPrice || 1000),
              }
            : { min: 0, max: 1000 },
      }
    } catch (error) {
      console.error('Filter options error:', error)
      return {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 1000 },
      }
    }
  }

  /**
   * Search by specific type (products, categories, brands)
   */
  async searchByType(type, query, limit = 12) {
    const searchRegex = new RegExp(query.trim(), 'i')

    switch (type) {
      case 'products':
        return await this.searchProductsBasic(query, limit)
      case 'categories':
        return await this.searchCategories(query, limit)
      case 'brands':
        return await this.searchBrands(query, limit)
      default:
        throw new Error('Invalid search type')
    }
  }
}

export default new SearchService()
