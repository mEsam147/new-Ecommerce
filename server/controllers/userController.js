// controllers/userController.js
import User from '../models/User.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiFeatures from '../utils/apiFeatures.js';

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query.select('-password');
  const total = await User.countDocuments(features.filterQuery);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: features.page,
      limit: features.limit,
      total,
      pages: Math.ceil(total / features.limit)
    }
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('addresses')
    .populate({
      path: 'wishlist',
      populate: {
        path: 'items.product',
        select: 'title images price'
      }
    });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user,
    message: 'User updated successfully'
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if user has orders
  const orderCount = await Order.countDocuments({ user: user._id });
  if (orderCount > 0) {
    throw new ApiError(400, 'Cannot delete user with existing orders');
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Toggle user status
// @route   PATCH /api/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    data: user,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
  });
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const [orderStats, reviewStats, totalSpent] = await Promise.all([
    Order.aggregate([
      {
        $match: { user: mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.totalPrice' }
        }
      }
    ]),
    Review.aggregate([
      {
        $match: { user: mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]),
    Order.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.totalPrice' }
        }
      }
    ])
  ]);

  const stats = {
    orderStats,
    reviewStats: reviewStats[0] || { totalReviews: 0, averageRating: 0 },
    totalSpent: totalSpent[0]?.total || 0
  };

  res.json({
    success: true,
    data: stats
  });
});

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload an image');
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      avatar: {
        public_id: req.file.public_id,
        url: req.file.path
      }
    },
    { new: true }
  ).select('-password');

  res.json({
    success: true,
    data: user,
    message: 'Avatar uploaded successfully'
  });
});
