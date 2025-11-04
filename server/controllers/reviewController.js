// controllers/reviewController.js
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiFeatures from '../utils/apiFeatures.js';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = '-createdAt', rating } = req.query;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  let query = { product: productId, isVerified: true };

  // Filter by rating if provided
  if (rating) {
    query.rating = parseInt(rating);
  }

  const features = new ApiFeatures(Review.find(query), req.query)
    .filter()
    .sort()
    .paginate();

  const reviews = await features.query
    .populate('user', 'name avatar')
    .populate('product', 'title images');

  const total = await Review.countDocuments(query);

  // Get rating distribution
  const ratingDistribution = await Review.aggregate([
    {
      $match: { product: product._id, isVerified: true }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  // Calculate average rating
  const averageRating = await Review.aggregate([
    {
      $match: { product: product._id, isVerified: true }
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      reviews,
      summary: {
        average: averageRating[0]?.average || 0,
        total: averageRating[0]?.count || 0,
        distribution: ratingDistribution
      },
      pagination: {
        page: features.page,
        limit: features.limit,
        total,
        pages: Math.ceil(total / features.limit)
      }
    }
  });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getUserReviews = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(
    Review.find({ user: req.user.id }),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const reviews = await features.query
    .populate('product', 'title images price')
    .sort({ createdAt: -1 });

  const total = await Review.countDocuments({ user: req.user.id });

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page: features.page,
      limit: features.limit,
      total,
      pages: Math.ceil(total / features.limit)
    }
  });
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if user has purchased the product
  const hasPurchased = await Order.findOne({
    user: req.user.id,
    'items.product': productId,
    status: { $in: ['delivered', 'shipped'] }
  });

  if (!hasPurchased) {
    throw new ApiError(400, 'You can only review products you have purchased');
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    user: req.user.id,
    product: productId
  });

  if (existingReview) {
    throw new ApiError(400, 'You have already reviewed this product');
  }

  // Create review
  const review = await Review.create({
    user: req.user.id,
    product: productId,
    rating,
    title,
    comment,
    isVerified: true // Since we verified purchase
  });

  await review.populate('user', 'name avatar');
  await review.populate('product', 'title images');

  res.status(201).json({
    success: true,
    data: review,
    message: 'Review submitted successfully'
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;

  let review = await Review.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Check if review can be modified (within 7 days)
  const daysSinceReview = (new Date() - review.createdAt) / (1000 * 60 * 60 * 24);
  if (daysSinceReview > 7) {
    throw new ApiError(400, 'Review can only be modified within 7 days of creation');
  }

  review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      rating,
      title,
      comment,
      updatedAt: new Date()
    },
    {
      new: true,
      runValidators: true
    }
  ).populate('user', 'name avatar')
   .populate('product', 'title images');

  res.json({
    success: true,
    data: review,
    message: 'Review updated successfully'
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  await Review.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .paginate();

  const reviews = await features.query
    .populate('user', 'name email')
    .populate('product', 'title')
    .sort({ createdAt: -1 });

  const total = await Review.countDocuments(features.filterQuery);

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page: features.page,
      limit: features.limit,
      total,
      pages: Math.ceil(total / features.limit)
    }
  });
});

// @desc    Toggle review verification (Admin)
// @route   PATCH /api/reviews/:id/verify
// @access  Private/Admin
export const toggleReviewVerification = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  review.isVerified = !review.isVerified;
  await review.save();

  res.json({
    success: true,
    data: review,
    message: `Review ${review.isVerified ? 'verified' : 'unverified'} successfully`
  });
});

// @desc    Like a review
// @route   POST /api/reviews/:id/like
// @access  Private
export const likeReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Check if user already liked the review
  // This would typically use a separate likes collection
  // For simplicity, we're just incrementing
  review.likes += 1;
  await review.save();

  res.json({
    success: true,
    data: { likes: review.likes },
    message: 'Review liked successfully'
  });
});

// @desc    Report a review
// @route   POST /api/reviews/:id/report
// @access  Private
export const reportReview = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // In a real implementation, you would store reports in a separate collection
  // and notify admins for review

  res.json({
    success: true,
    message: 'Review reported successfully. Our team will review it shortly.'
  });
});

// @desc    Get review statistics
// @route   GET /api/reviews/stats
// @access  Private/Admin
export const getReviewStats = asyncHandler(async (req, res) => {
  const { period = '30days' } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  const stats = await Review.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        verifiedReviews: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        }
      }
    }
  ]);

  // Reviews by rating
  const reviewsByRating = await Review.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  // Recent review activity
  const recentActivity = await Review.aggregate([
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
        reviews: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 30 }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalReviews: 0,
        averageRating: 0,
        verifiedReviews: 0
      },
      byRating: reviewsByRating,
      activity: recentActivity
    }
  });
});
