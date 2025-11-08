// Search Router
import express from 'express'
import {
  searchAll,
  searchProducts,
  getSearchSuggestions,
  getPopularSearches,
  searchByType,
  getSearchAnalytics,
} from '../controllers/searchController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', searchAll)
router.get('/products', searchProducts)
router.get('/suggestions', getSearchSuggestions)
router.get('/popular', getPopularSearches)
router.get('/:type', searchByType)

// Admin routes
router.get('/analytics/popular', protect, authorize('admin'), getSearchAnalytics)

export default router
