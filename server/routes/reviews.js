// routes/reviews.js
import express from 'express';
import {
  getProductReviews,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  toggleReviewVerification,
  likeReview,
  reportReview,
  getReviewStats
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  validateReviewId,
  validateCreateReview,
  validateUpdateReview,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', validatePagination, getProductReviews);

// Protected routes
router.use(protect);

router.get('/my-reviews', validatePagination, getUserReviews);
router.route('/')
  .post(validateCreateReview, createReview);

router.route('/:id')
  .put(validateReviewId, validateUpdateReview, updateReview)
  .delete(validateReviewId, deleteReview);

router.post('/:id/like', validateReviewId, likeReview);
router.post('/:id/report', validateReviewId, reportReview);

// Admin routes
router.use(authorize('admin'));

router.get('/', validatePagination, getAllReviews);
router.get('/stats', getReviewStats);
router.patch('/:id/verify', validateReviewId, toggleReviewVerification);

export default router;
