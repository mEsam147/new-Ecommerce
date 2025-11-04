// services/analyticsService.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';

class AnalyticsService {
  /**
   * Calculate date range based on period
   */
  calculateDateRange(period) {
    const endDate = new Date();
    let startDate = new Date();

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

    return { startDate, endDate };
  }

  /**
   * Get comprehensive dashboard overview
   */
  async getDashboardOverview(period = '30days') {
    try {
      const { startDate, endDate } = this.calculateDateRange(period);

      // Execute all analytics queries in parallel
      const [
        revenueStats,
        orderStats,
        userStats,
        productStats,
        topProducts,
        recentOrders,
        couponStats,
        salesByCategory
      ] = await Promise.all([
        // Revenue statistics
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              status: { $in: ['delivered', 'shipped', 'processing'] }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$pricing.totalPrice' },
              totalOrders: { $sum: 1 },
              averageOrderValue: { $avg: '$pricing.totalPrice' },
              totalItemsSold: { $sum: { $size: '$items' } }
            }
          }
        ]),

        // Order statistics by status
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$pricing.totalPrice' }
            }
          }
        ]),

        // User statistics
        User.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              newUsers: { $sum: 1 }
            }
          }
        ]),

        // Product statistics
        Product.aggregate([
          {
            $match: {
              isActive: true
            }
          },
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              lowStockProducts: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gt: ['$inventory.quantity', 0] },
                        { $lte: ['$inventory.quantity', '$inventory.lowStockAlert'] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              },
              outOfStockProducts: {
                $sum: {
                  $cond: [
                    { $eq: ['$inventory.quantity', 0] },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]),

        // Top selling products
        this.getTopSellingProducts(startDate, endDate, 10),

        // Recent orders
        Order.find({
          createdAt: { $gte: startDate, $lte: endDate }
        })
          .populate('user', 'name email')
          .sort({ createdAt: -1 })
          .limit(10)
          .select('orderNumber user pricing.totalPrice status createdAt'),

        // Coupon statistics
        Coupon.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              totalCoupons: { $sum: 1 },
              totalUsed: { $sum: '$usedCount' },
              totalDiscount: { $sum: { $multiply: ['$discountValue', '$usedCount'] } }
            }
          }
        ]),

        // Sales by category
        this.getSalesByCategory(startDate, endDate)
      ]);

      // Revenue trend (last 30 days)
      const revenueTrend = await this.getRevenueTrend(startDate, endDate);

      // Customer acquisition trend
      const customerTrend = await this.getCustomerAcquisitionTrend(startDate, endDate);

      return {
        overview: {
          revenue: revenueStats[0]?.totalRevenue || 0,
          orders: revenueStats[0]?.totalOrders || 0,
          averageOrderValue: revenueStats[0]?.averageOrderValue || 0,
          itemsSold: revenueStats[0]?.totalItemsSold || 0,
          newUsers: userStats[0]?.newUsers || 0,
          totalUsers: await User.countDocuments(),
          totalProducts: productStats[0]?.totalProducts || 0,
          lowStockProducts: productStats[0]?.lowStockProducts || 0,
          outOfStockProducts: productStats[0]?.outOfStockProducts || 0
        },
        orderStats,
        topProducts,
        recentOrders,
        couponStats: couponStats[0] || { totalCoupons: 0, totalUsed: 0, totalDiscount: 0 },
        salesByCategory,
        revenueTrend,
        customerTrend,
        period: {
          start: startDate,
          end: endDate,
          label: period
        }
      };
    } catch (error) {
      throw new ApiError(500, `Error generating dashboard overview: ${error.message}`);
    }
  }

  /**
   * Get sales analytics with detailed breakdown
   */
  async getSalesAnalytics(startDate, endDate, groupBy = 'day') {
    try {
      let dateFormat = '%Y-%m-%d';
      if (groupBy === 'month') {
        dateFormat = '%Y-%m';
      } else if (groupBy === 'year') {
        dateFormat = '%Y';
      }

      const salesData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['delivered', 'shipped', 'processing'] }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: '$createdAt'
              }
            },
            revenue: { $sum: '$pricing.totalPrice' },
            orders: { $sum: 1 },
            itemsSold: { $sum: { $size: '$items' } },
            averageOrderValue: { $avg: '$pricing.totalPrice' },
            shippingRevenue: { $sum: '$pricing.shippingPrice' },
            taxRevenue: { $sum: '$pricing.taxPrice' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Customer analytics
      const customerData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['delivered', 'shipped'] }
          }
        },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: '$pricing.totalPrice' },
            orderCount: { $sum: 1 },
            firstOrderDate: { $min: '$createdAt' },
            lastOrderDate: { $max: '$createdAt' }
          }
        },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            averageCustomerValue: { $avg: '$totalSpent' },
            repeatCustomers: {
              $sum: {
                $cond: [{ $gt: ['$orderCount', 1] }, 1, 0]
              }
            },
            averageOrdersPerCustomer: { $avg: '$orderCount' }
          }
        }
      ]);

      // Payment method distribution
      const paymentMethods = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            totalAmount: { $sum: '$pricing.totalPrice' }
          }
        }
      ]);

      return {
        salesData,
        customerData: customerData[0] || {
          totalCustomers: 0,
          averageCustomerValue: 0,
          repeatCustomers: 0,
          averageOrdersPerCustomer: 0
        },
        paymentMethods,
        summary: {
          totalRevenue: salesData.reduce((sum, day) => sum + day.revenue, 0),
          totalOrders: salesData.reduce((sum, day) => sum + day.orders, 0),
          totalItemsSold: salesData.reduce((sum, day) => sum + day.itemsSold, 0)
        }
      };
    } catch (error) {
      throw new ApiError(500, `Error generating sales analytics: ${error.message}`);
    }
  }

  /**
   * Get product performance analytics
   */
  async getProductAnalytics(startDate, endDate) {
    try {
      const productPerformance = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['delivered', 'shipped'] }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' },
            averageSalePrice: { $avg: '$items.price' },
            orderCount: { $sum: 1 }
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
          $lookup: {
            from: 'categories',
            localField: 'product.category',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $project: {
            productId: '$_id',
            title: '$product.title',
            category: '$category.name',
            price: '$product.price',
            costPrice: '$product.costPrice',
            stock: '$product.inventory.quantity',
            totalSold: 1,
            totalRevenue: 1,
            averageSalePrice: 1,
            orderCount: 1,
            profitMargin: {
              $subtract: [
                '$averageSalePrice',
                { $ifNull: ['$product.costPrice', 0] }
              ]
            },
            profit: {
              $multiply: [
                {
                  $subtract: [
                    '$averageSalePrice',
                    { $ifNull: ['$product.costPrice', 0] }
                  ]
                },
                '$totalSold'
              ]
            },
            sellThroughRate: {
              $multiply: [
                {
                  $divide: [
                    '$totalSold',
                    { $add: ['$product.inventory.quantity', '$totalSold'] }
                  ]
                },
                100
              ]
            }
          }
        }
      ]);

      // Category performance
      const categoryPerformance = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['delivered', 'shipped'] }
          }
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $lookup: {
            from: 'categories',
            localField: 'product.category',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $group: {
            _id: '$category._id',
            categoryName: { $first: '$category.name' },
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' },
            productCount: { $addToSet: '$items.product' }
          }
        },
        {
          $project: {
            categoryName: 1,
            totalSold: 1,
            totalRevenue: 1,
            uniqueProducts: { $size: '$productCount' }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]);

      // Stock analytics
      const stockAnalytics = await Product.aggregate([
        {
          $match: { isActive: true }
        },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStockValue: {
              $sum: {
                $multiply: ['$price', '$inventory.quantity']
              }
            },
            lowStockCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$inventory.quantity', 0] },
                      { $lte: ['$inventory.quantity', '$inventory.lowStockAlert'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            outOfStockCount: {
              $sum: {
                $cond: [
                  { $eq: ['$inventory.quantity', 0] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      return {
        productPerformance,
        categoryPerformance,
        stockAnalytics: stockAnalytics[0] || {
          totalProducts: 0,
          totalStockValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0
        },
        summary: {
          totalProducts: productPerformance.length,
          totalRevenue: productPerformance.reduce((sum, product) => sum + product.totalRevenue, 0),
          totalProfit: productPerformance.reduce((sum, product) => sum + (product.profit || 0), 0),
          averageProfitMargin: productPerformance.length > 0 ?
            productPerformance.reduce((sum, product) => sum + product.profitMargin, 0) / productPerformance.length : 0
        }
      };
    } catch (error) {
      throw new ApiError(500, `Error generating product analytics: ${error.message}`);
    }
  }

  /**
   * Get customer analytics and behavior
   */
  async getCustomerAnalytics(startDate, endDate) {
    try {
      // Customer acquisition
      const customerAcquisition = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            newCustomers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Customer lifetime value analysis
      const customerLifetimeValue = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['delivered', 'shipped'] }
          }
        },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: '$pricing.totalPrice' },
            orderCount: { $sum: 1 },
            firstOrderDate: { $min: '$createdAt' },
            lastOrderDate: { $max: '$createdAt' },
            averageOrderValue: { $avg: '$pricing.totalPrice' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            customerId: '$_id',
            name: '$user.name',
            email: '$user.email',
            totalSpent: 1,
            orderCount: 1,
            averageOrderValue: 1,
            customerSince: '$firstOrderDate',
            daysSinceFirstOrder: {
              $divide: [
                { $subtract: [new Date(), '$firstOrderDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $addFields: {
            lifetimeValue: '$totalSpent',
            valuePerDay: {
              $cond: [
                { $gt: ['$daysSinceFirstOrder', 0] },
                { $divide: ['$totalSpent', '$daysSinceFirstOrder'] },
                0
              ]
            }
          }
        },
        { $sort: { lifetimeValue: -1 } },
        { $limit: 50 }
      ]);

      // Repeat customer analysis
      const repeatCustomerStats = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['delivered', 'shipped'] }
          }
        },
        {
          $group: {
            _id: '$user',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$pricing.totalPrice' }
          }
        },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            repeatCustomers: {
              $sum: {
                $cond: [{ $gt: ['$orderCount', 1] }, 1, 0]
              }
            },
            oneTimeCustomers: {
              $sum: {
                $cond: [{ $eq: ['$orderCount', 1] }, 1, 0]
              }
            },
            averageOrdersPerCustomer: { $avg: '$orderCount' },
            repeatCustomerRate: {
              $multiply: [
                {
                  $divide: [
                    {
                      $sum: {
                        $cond: [{ $gt: ['$orderCount', 1] }, 1, 0]
                      }
                    },
                    { $sum: 1 }
                  ]
                },
                100
              ]
            }
          }
        }
      ]);

      // Customer segmentation by spending
      const customerSegmentation = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['delivered', 'shipped'] }
          }
        },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: '$pricing.totalPrice' }
          }
        },
        {
          $bucket: {
            groupBy: '$totalSpent',
            boundaries: [0, 50, 100, 200, 500, 1000, Infinity],
            default: '1000+',
            output: {
              count: { $sum: 1 },
              totalSpent: { $sum: '$totalSpent' }
            }
          }
        }
      ]);

      return {
        customerAcquisition,
        topCustomers: customerLifetimeValue,
        repeatCustomerStats: repeatCustomerStats[0] || {
          totalCustomers: 0,
          repeatCustomers: 0,
          oneTimeCustomers: 0,
          averageOrdersPerCustomer: 0,
          repeatCustomerRate: 0
        },
        customerSegmentation,
        summary: {
          totalCustomers: await User.countDocuments(),
          newCustomers: customerAcquisition.reduce((sum, day) => sum + day.newCustomers, 0),
          averageLifetimeValue: customerLifetimeValue.length > 0 ?
            customerLifetimeValue.reduce((sum, customer) => sum + customer.lifetimeValue, 0) / customerLifetimeValue.length : 0
        }
      };
    } catch (error) {
      throw new ApiError(500, `Error generating customer analytics: ${error.message}`);
    }
  }

  /**
   * Get revenue trend data
   */
  async getRevenueTrend(startDate, endDate) {
    return await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['delivered', 'shipped', 'processing'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          revenue: { $sum: '$pricing.totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  /**
   * Get customer acquisition trend
   */
  async getCustomerAcquisitionTrend(startDate, endDate) {
    return await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  /**
   * Get top selling products
   */
  async getTopSellingProducts(startDate, endDate, limit = 10) {
    return await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalSold: -1 } },
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
          'product.title': 1,
          'product.images': 1,
          'product.price': 1,
          totalSold: 1,
          totalRevenue: 1
        }
      }
    ]);
  }

  /**
   * Get sales by category
   */
  async getSalesByCategory(startDate, endDate) {
    return await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          totalSales: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(type, startDate, endDate) {
    try {
      let data;

      switch (type) {
        case 'sales':
          data = await this.getSalesAnalytics(startDate, endDate);
          break;
        case 'products':
          data = await this.getProductAnalytics(startDate, endDate);
          break;
        case 'customers':
          data = await this.getCustomerAnalytics(startDate, endDate);
          break;
        case 'all':
          const [sales, products, customers] = await Promise.all([
            this.getSalesAnalytics(startDate, endDate),
            this.getProductAnalytics(startDate, endDate),
            this.getCustomerAnalytics(startDate, endDate)
          ]);
          data = { sales, products, customers };
          break;
        default:
          throw new ApiError(400, 'Invalid export type');
      }

      return {
        type,
        data,
        exportedAt: new Date(),
        dateRange: { startDate, endDate },
        format: 'json'
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error exporting analytics data: ${error.message}`);
    }
  }

  /**
   * Get real-time analytics (last 24 hours)
   */
  async getRealTimeAnalytics() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [
        todayOrders,
        todayRevenue,
        todayUsers,
        lowStockCount
      ] = await Promise.all([
        Order.countDocuments({
          createdAt: { $gte: twentyFourHoursAgo }
        }),
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: twentyFourHoursAgo },
              status: { $in: ['delivered', 'shipped', 'processing'] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$pricing.totalPrice' }
            }
          }
        ]),
        User.countDocuments({
          createdAt: { $gte: twentyFourHoursAgo }
        }),
        Product.countDocuments({
          isActive: true,
          $or: [
            { 'inventory.quantity': { $lte: 5 } },
            {
              'variants.stock': { $lte: 5 },
              'variants.0': { $exists: true }
            }
          ]
        })
      ]);

      // Get hourly revenue for the last 24 hours
      const hourlyRevenue = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: twentyFourHoursAgo },
            status: { $in: ['delivered', 'shipped', 'processing'] }
          }
        },
        {
          $group: {
            _id: {
              $hour: '$createdAt'
            },
            revenue: { $sum: '$pricing.totalPrice' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        today: {
          orders: todayOrders,
          revenue: todayRevenue[0]?.total || 0,
          newUsers: todayUsers,
          lowStockProducts: lowStockCount
        },
        hourlyRevenue,
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new ApiError(500, `Error generating real-time analytics: ${error.message}`);
    }
  }
}

export default new AnalyticsService();
