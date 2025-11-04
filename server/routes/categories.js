// routes/categories.js
import express from 'express'
import {
  getCategories,
  getCategoryTree,
  getCategory,
  getCategoryBySlug,
  getCategoriesByBrand,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  getTopCategories, // ADD THIS
} from '../controllers/categoryController.js'
import { protect, authorize } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// Public routes
router.get('/', getCategories)
router.get('/tree', getCategoryTree)
router.get('/top', getTopCategories) // ADD THIS ROUTE
router.get('/brand/:brandSlug', getCategoriesByBrand)
router.get('/slug/:slug', getCategoryBySlug)
router.get('/:id', getCategory)

// Protected admin routes
router.use(protect)
router.use(authorize('admin'))

router.post('/', createCategory)
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)
router.post('/:id/image', upload.single('image'), uploadCategoryImage)

export default router
