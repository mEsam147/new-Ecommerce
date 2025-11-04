// controllers/analyticsController.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

// @desc    Get dashboard overview
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const { period = '30days' } = req.query;

  // Calculate date range
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

  // Get all analytics data in parallel
  const [
    revenueStats,
    orderStats,
    userStats,
    productStats,
    topProducts,
    recentOrders,
    couponStats
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
          averageOrderValue: { $avg: '$pricing.totalPrice' }
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
          newUsers: { $sum: 1 },
          totalUsers: { $sum: 1 }
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
                { $lt: ['$inventory.quantity', '$inventory.lowStockAlert'] },
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
    Order.aggregate([
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
      { $limit: 10 },
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
    ]),

    // Recent orders
    Order.find({ createdAt: { $gte: startDate, $lte: endDate } })
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
    ])
  ]);

  // Revenue trend (last 30 days)
  const revenueTrend = await Order.aggregate([
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

  // Sales by category
  const salesByCategory = await Order.aggregate([
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

  res.json({
    success: true,
    data: {
      overview: {
        revenue: revenueStats[0]?.totalRevenue || 0,
        orders: revenueStats[0]?.totalOrders || 0,
        averageOrderValue: revenueStats[0]?.averageOrderValue || 0,
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
      revenueTrend,
      salesByCategory,
      period: {
        start: startDate,
        end: endDate
      }
    }
  });
});

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private/Admin
export const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  let dateFormat = '%Y-%m-%d';
  if (groupBy === 'month') {
    dateFormat = '%Y-%m';
  } else if (groupBy === 'year') {
    dateFormat = '%Y';
  }

  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const salesData = await Order.aggregate([
    {
      $match: {
        ...matchStage,
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
        averageOrderValue: { $avg: '$pricing.totalPrice' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Customer analytics
  const customerData = await Order.aggregate([
    {
      $match: {
        ...matchStage,
        status: { $in: ['delivered', 'shipped'] }
      }
    },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$pricing.totalPrice' },
        orderCount: { $sum: 1 }
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
        }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      salesData,
      customerData: customerData[0] || {
        totalCustomers: 0,
        averageCustomerValue: 0,
        repeatCustomers: 0
      }
    }
  });
});

// @desc    Get product analytics
// @route   GET /api/analytics/products
// @access  Private/Admin
export const getProductAnalytics = asyncHandler(async (req, res) => {
  const { period = '30days' } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  const productAnalytics = await Order.aggregate([
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
        averageRating: { $avg: '$items.product.rating' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 20 },
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
        name: '$product.title',
        price: '$product.price',
        images: '$product.images',
        category: '$product.category',
        totalSold: 1,
        totalRevenue: 1,
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

  // Stock analytics
  const stockAnalytics = await Product.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStock: { $sum: '$inventory.quantity' },
        lowStock: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$inventory.quantity', '$inventory.lowStockAlert'] },
                  { $gt: ['$inventory.quantity', 0] }
                ]
              },
              1,
              0
            ]
          }
        },
        outOfStock: {
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

  res.json({
    success: true,
    data: {
      topProducts: productAnalytics,
      stock: stockAnalytics[0] || {
        totalProducts: 0,
        totalStock: 0,
        lowStock: 0,
        outOfStock: 0
      }
    }
  });
});

// @desc    Get customer analytics
// @route   GET /api/analytics/customers
// @access  Private/Admin
export const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const { period = '90days' } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  // Customer acquisition
  const customerAcquisition = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
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

  // Customer lifetime value
  const customerLifetimeValue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['delivered', 'shipped'] }
      }
    },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$pricing.totalPrice' },
        orderCount: { $sum: 1 },
        firstOrder: { $min: '$createdAt' },
        lastOrder: { $max: '$createdAt' }
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
        name: '$user.name',
        email: '$user.email',
        totalSpent: 1,
        orderCount: 1,
        averageOrderValue: { $divide: ['$totalSpent', '$orderCount'] },
        customerSince: '$firstOrder'
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 50 }
  ]);

  // Repeat customer rate
  const repeatCustomerStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['delivered', 'shipped'] }
      }
    },
    {
      $group: {
        _id: '$user',
        orderCount: { $sum: 1 }
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
        }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      customerAcquisition,
      topCustomers: customerLifetimeValue,
      repeatCustomerStats: repeatCustomerStats[0] || {
        totalCustomers: 0,
        repeatCustomers: 0,
        oneTimeCustomers: 0
      }
    }
  });
});

// @desc    Export analytics data
// @route   GET /api/analytics/export
// @access  Private/Admin
export const exportAnalytics = asyncHandler(async (req, res) => {
  const { type, startDate, endDate } = req.query;

  // This would typically generate CSV/Excel files
  // For now, return JSON data that can be converted

  const analyticsData = {
    type,
    generatedAt: new Date(),
    data: {} // Would contain the exported data
  };

  res.json({
    success: true,
    data: analyticsData,
    message: 'Analytics data exported successfully'
  });
});
