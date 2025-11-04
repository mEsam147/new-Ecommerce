// services/productService.js
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';

class ProductService {
  /**
   * Get popular products based on various criteria
   */
  async getPopularProducts(period = '7days', limit = 10) {
    try {
      const startDate = this.calculateStartDate(period);

      const popularProducts = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $in: ['delivered', 'shipped'] }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { totalSold: -1, totalRevenue: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            _id: '$product._id',
            title: '$product.title',
            images: '$product.images',
            price: '$product.price',
            rating: '$product.rating',
            category: '$product.category',
            totalSold: 1,
            totalRevenue: 1,
            orderCount: 1,
            conversionRate: {
              $multiply: [
                {
                  $divide: [
                    '$totalSold',
                    { $add: ['$product.viewCount', 1] }
                  ]
                },
                100
              ]
            }
          }
        }
      ]);

      return popularProducts;
    } catch (error) {
      throw new ApiError(500, `Error fetching popular products: ${error.message}`);
    }
  }

  /**
   * Get trending products based on views and sales velocity
   */
  async getTrendingProducts(limit = 10) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const trendingProducts = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            status: { $in: ['delivered', 'shipped'] }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            recentSales: { $sum: '$items.quantity' },
            recentRevenue: { $sum: '$items.totalPrice' }
          }
        },
        { $sort: { recentSales: -1 } },
        { $limit: limit * 2 }, // Get more for filtering
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $match: {
            'product.isActive': true,
            'product.inventory.quantity': { $gt: 0 }
          }
        },
        {
          $project: {
            _id: '$product._id',
            title: '$product.title',
            images: '$product.images',
            price: '$product.price',
            rating: '$product.rating',
            recentSales: 1,
            recentRevenue: 1,
            viewCount: '$product.viewCount',
            salesVelocity: {
              $divide: ['$recentSales', 7] // Sales per day
            },
            popularityScore: {
              $add: [
                { $multiply: ['$recentSales', 0.6] },
                { $multiply: ['$product.viewCount', 0.3] },
                { $multiply: ['$product.rating.average', 0.1] }
              ]
            }
          }
        },
        { $sort: { popularityScore: -1 } },
        { $limit: limit }
      ]);

      return trendingProducts;
    } catch (error) {
      throw new ApiError(500, `Error fetching trending products: ${error.message}`);
    }
  }

  /**
   * Get recommended products for a user
   */
  async getRecommendedProducts(userId, limit = 8) {
    try {
      // Get user's order history
      const userOrders = await Order.find({ user: userId })
        .populate('items.product')
        .sort({ createdAt: -1 })
        .limit(10);

      if (userOrders.length === 0) {
        // If no order history, return featured products
        return await this.getFeaturedProducts(limit);
      }

      // Extract categories from purchased products
      const purchasedCategories = new Set();
      const purchasedProducts = new Set();

      userOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.product && item.product.category) {
            purchasedCategories.add(item.product.category.toString());
            purchasedProducts.add(item.product._id.toString());
          }
        });
      });

      // Get products from same categories (excluding purchased ones)
      const recommendedProducts = await Product.find({
        category: { $in: Array.from(purchasedCategories) },
        _id: { $nin: Array.from(purchasedProducts) },
        isActive: true,
        'inventory.quantity': { $gt: 0 }
      })
        .populate('category', 'name')
        .sort({ 'rating.average': -1, salesCount: -1 })
        .limit(limit);

      // If not enough recommendations, add popular products
      if (recommendedProducts.length < limit) {
        const additionalProducts = await this.getPopularProducts('30days', limit - recommendedProducts.length);
        recommendedProducts.push(...additionalProducts);
      }

      return recommendedProducts;
    } catch (error) {
      throw new ApiError(500, `Error generating recommendations: ${error.message}`);
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 8) {
    try {
      const featuredProducts = await Product.find({
        isFeatured: true,
        isActive: true,
        'inventory.quantity': { $gt: 0 }
      })
        .populate('category', 'name slug')
        .sort({ 'rating.average': -1, createdAt: -1 })
        .limit(limit);

      return featuredProducts;
    } catch (error) {
      throw new ApiError(500, `Error fetching featured products: ${error.message}`);
    }
  }

  /**
   * Search products with advanced filtering
   */
  async searchProducts(searchParams) {
    try {
      const {
        query,
        category,
        brand,
        minPrice,
        maxPrice,
        inStock,
        sortBy = 'relevance',
        page = 1,
        limit = 12,
        tags,
        rating
      } = searchParams;

      let filter = { isActive: true };

      // Text search
      if (query) {
        filter.$text = { $search: query };
      }

      // Category filter
      if (category) {
        // Handle both category ID and slug
        if (this.isValidObjectId(category)) {
          filter.category = category;
        } else {
          const categoryDoc = await Category.findOne({ slug: category });
          if (categoryDoc) {
            filter.category = categoryDoc._id;
          }
        }
      }

      // Brand filter
      if (brand) {
        filter.brand = new RegExp(brand, 'i');
      }

      // Price range filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
      }

      // Stock filter
      if (inStock === 'true') {
        filter.$or = [
          { 'inventory.quantity': { $gt: 0 } },
          { 'variants.stock': { $gt: 0 } }
        ];
      }

      // Tags filter
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        filter.tags = { $in: tagArray.map(tag => new RegExp(tag, 'i')) };
      }

      // Rating filter
      if (rating) {
        filter['rating.average'] = { $gte: parseFloat(rating) };
      }

      // Build sort options
      let sortOptions = {};
      switch (sortBy) {
        case 'price_low':
          sortOptions = { price: 1 };
          break;
        case 'price_high':
          sortOptions = { price: -1 };
          break;
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'rating':
          sortOptions = { 'rating.average': -1, 'rating.count': -1 };
          break;
        case 'popular':
          sortOptions = { salesCount: -1 };
          break;
        case 'relevance':
        default:
          if (query) {
            sortOptions = { score: { $meta: 'textScore' } };
          } else {
            sortOptions = { createdAt: -1 };
          }
          break;
      }

      // Build query
      let productQuery = Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Add text score for relevance sorting
      if (query && sortBy === 'relevance') {
        productQuery = productQuery.select({ score: { $meta: 'textScore' } });
      }

      const products = await productQuery;
      const total = await Product.countDocuments(filter);

      // Get search suggestions
      const suggestions = query ? await this.getSearchSuggestions(query) : [];

      return {
        products,
        total,
        suggestions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new ApiError(500, `Error searching products: ${error.message}`);
    }
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query, limit = 5) {
    try {
      const suggestions = await Product.aggregate([
        {
          $match: {
            $text: { $search: query },
            isActive: true
          }
        },
        {
          $project: {
            title: 1,
            category: 1,
            brand: 1,
            score: { $meta: 'textScore' }
          }
        },
        { $sort: { score: { $meta: 'textScore' } } },
        { $limit: limit }
      ]);

      return suggestions;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Update product inventory
   */
  async updateProductInventory(productId, inventoryData) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      const { quantity, variants, lowStockAlert } = inventoryData;

      if (quantity !== undefined) {
        product.inventory.quantity = quantity;
      }

      if (lowStockAlert !== undefined) {
        product.inventory.lowStockAlert = lowStockAlert;
      }

      if (variants && Array.isArray(variants)) {
        variants.forEach(variantUpdate => {
          const variant = product.variants.id(variantUpdate._id);
          if (variant) {
            if (variantUpdate.stock !== undefined) {
              variant.stock = variantUpdate.stock;
            }
            if (variantUpdate.price !== undefined) {
              variant.price = variantUpdate.price;
            }
          }
        });
      }

      await product.save();
      return product;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error updating inventory: ${error.message}`);
    }
  }

  /**
   * Bulk update product prices
   */
  async bulkUpdatePrices(updates) {
    try {
      const bulkOperations = updates.map(update => ({
        updateOne: {
          filter: { _id: update.productId },
          update: {
            $set: {
              price: update.price,
              ...(update.comparePrice && { comparePrice: update.comparePrice })
            }
          }
        }
      }));

      const result = await Product.bulkWrite(bulkOperations);
      return result;
    } catch (error) {
      throw new ApiError(500, `Error bulk updating prices: ${error.message}`);
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(threshold = 5) {
    try {
      const lowStockProducts = await Product.find({
        isActive: true,
        $or: [
          { 'inventory.quantity': { $lte: threshold } },
          {
            'variants.stock': { $lte: threshold },
            'variants.0': { $exists: true } // Has at least one variant
          }
        ]
      })
        .populate('category', 'name')
        .sort({ 'inventory.quantity': 1 });

      return lowStockProducts;
    } catch (error) {
      throw new ApiError(500, `Error fetching low stock products: ${error.message}`);
    }
  }

  /**
   * Get product analytics
   */
  async getProductAnalytics(period = '30days') {
    try {
      const startDate = this.calculateStartDate(period);

      const analytics = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $in: ['delivered', 'shipped'] }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' },
            averageSalePrice: { $avg: '$items.price' }
          }
        },
        { $sort: { totalRevenue: -1 } },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            productId: '$_id',
            title: '$product.title',
            category: '$product.category',
            price: '$product.price',
            totalSold: 1,
            totalRevenue: 1,
            averageSalePrice: 1,
            profitMargin: {
              $subtract: [
                '$averageSalePrice',
                { $ifNull: ['$product.costPrice', 0] }
              ]
            }
          }
        }
      ]);

      // Calculate overall stats
      const overallStats = {
        totalProducts: await Product.countDocuments({ isActive: true }),
        totalRevenue: analytics.reduce((sum, item) => sum + item.totalRevenue, 0),
        totalSold: analytics.reduce((sum, item) => sum + item.totalSold, 0),
        averageOrderValue: analytics.length > 0 ?
          analytics.reduce((sum, item) => sum + item.totalRevenue, 0) / analytics.length : 0
      };

      return {
        products: analytics,
        overall: overallStats,
        period: {
          start: startDate,
          end: new Date()
        }
      };
    } catch (error) {
      throw new ApiError(500, `Error generating product analytics: ${error.message}`);
    }
  }

  /**
   * Update product ratings based on reviews
   */
  async updateProductRatings(productId) {
    try {
      const reviews = await Review.find({ product: productId, isVerified: true });

      if (reviews.length === 0) {
        return;
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        distribution[review.rating]++;
      });

      await Product.findByIdAndUpdate(productId, {
        'rating.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal
        'rating.count': reviews.length,
        'rating.distribution': distribution
      });
    } catch (error) {
      throw new ApiError(500, `Error updating product ratings: ${error.message}`);
    }
  }

  /**
   * Get products by multiple IDs
   */
  async getProductsByIds(productIds, options = {}) {
    try {
      const { populate = [], select = '' } = options;

      let query = Product.find({
        _id: { $in: productIds },
        isActive: true
      });

      if (populate.length > 0) {
        populate.forEach(field => {
          query = query.populate(field);
        });
      }

      if (select) {
        query = query.select(select);
      }

      const products = await query;

      // Maintain original order
      const productMap = new Map();
      products.forEach(product => {
        productMap.set(product._id.toString(), product);
      });

      return productIds.map(id => productMap.get(id.toString())).filter(Boolean);
    } catch (error) {
      throw new ApiError(500, `Error fetching products by IDs: ${error.message}`);
    }
  }

  /**
   * Create multiple products (bulk insert)
   */
  async createMultipleProducts(productsData) {
    try {
      const products = await Product.insertMany(productsData);
      return products;
    } catch (error) {
      throw new ApiError(500, `Error creating multiple products: ${error.message}`);
    }
  }

  /**
   * Soft delete product
   */
  async softDeleteProduct(productId) {
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { isActive: false },
        { new: true }
      );

      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      return product;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error soft deleting product: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted product
   */
  async restoreProduct(productId) {
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { isActive: true },
        { new: true }
      );

      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      return product;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error restoring product: ${error.message}`);
    }
  }

  /**
   * Get product variants with stock information
   */
  async getProductVariants(productId) {
    try {
      const product = await Product.findById(productId)
        .select('variants title inventory');

      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      return {
        product: product.title,
        generalInventory: product.inventory,
        variants: product.variants
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error fetching product variants: ${error.message}`);
    }
  }

  /**
   * Update product variant stock
   */
  async updateVariantStock(productId, variantId, stock) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      const variant = product.variants.id(variantId);
      if (!variant) {
        throw new ApiError(404, 'Variant not found');
      }

      variant.stock = stock;
      await product.save();

      return { product: product.title, variant };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error updating variant stock: ${error.message}`);
    }
  }

  /**
   * Calculate start date based on period
   */
  calculateStartDate(period) {
    const startDate = new Date();

    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    return startDate;
  }

  /**
   * Check if string is a valid MongoDB ObjectId
   */
  isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Generate product SKU
   */
  generateSKU(productTitle, variant = null) {
    const baseSKU = productTitle
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);

    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    let sku = `${baseSKU}-${random}`;

    if (variant) {
      const variantCode = `${variant.size || ''}${variant.color || ''}`
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 3);

      if (variantCode) {
        sku = `${sku}-${variantCode}`;
      }
    }

    return sku;
  }

  /**
   * Validate product data before creation/update
   */
  validateProductData(productData) {
    const errors = [];

    // Required fields
    if (!productData.title || productData.title.trim().length < 3) {
      errors.push('Product title is required and must be at least 3 characters long');
    }

    if (!productData.description || productData.description.trim().length < 10) {
      errors.push('Product description is required and must be at least 10 characters long');
    }

    if (productData.price === undefined || productData.price < 0) {
      errors.push('Product price is required and must be a positive number');
    }

    if (!productData.category) {
      errors.push('Product category is required');
    }

    // Validate variants if provided
    if (productData.variants && Array.isArray(productData.variants)) {
      productData.variants.forEach((variant, index) => {
        if (variant.size && variant.size.length > 20) {
          errors.push(`Variant ${index + 1}: Size cannot exceed 20 characters`);
        }
        if (variant.color && variant.color.length > 20) {
          errors.push(`Variant ${index + 1}: Color cannot exceed 20 characters`);
        }
        if (variant.stock !== undefined && variant.stock < 0) {
          errors.push(`Variant ${index + 1}: Stock cannot be negative`);
        }
        if (variant.price !== undefined && variant.price < 0) {
          errors.push(`Variant ${index + 1}: Price cannot be negative`);
        }
      });
    }

    // Validate inventory
    if (productData.inventory) {
      if (productData.inventory.quantity !== undefined && productData.inventory.quantity < 0) {
        errors.push('Inventory quantity cannot be negative');
      }
      if (productData.inventory.lowStockAlert !== undefined && productData.inventory.lowStockAlert < 0) {
        errors.push('Low stock alert cannot be negative');
      }
    }

    return errors;
  }
}

export default new ProductService();
