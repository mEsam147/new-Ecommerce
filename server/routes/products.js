// routes/products.js
import express from 'express'
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  updateInventory,
  getFeaturedProducts,
  getProductsByCategory,
  getPopularProducts,
  getProductBySlug,
  getNewArrivals,
  getTopSelling,
  getTrendingProducts,
} from '../controllers/productController.js'
import { protect, authorize } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import {
  validateProductId,
  validateCreateProduct,
  validateUpdateProduct,
  validateInventoryUpdate,
  validatePagination,
  validateProductFilters,
  validateMultipleFileUpload,
} from '../middleware/validation.js'

const router = express.Router()

// Public routes
router.get('/', validatePagination, validateProductFilters, getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/new-arrivals', getNewArrivals)
router.get('/top-selling', getTopSelling)
router.get('/trending', getTrendingProducts)
router.get('/popular', getPopularProducts)
router.get('/category/:categorySlug', validatePagination, getProductsByCategory)
router.get('/:id', validateProductId, getProduct)
router.get('/slug/:slug', getProductBySlug)

// Protected admin routes
router.use(protect)
router.use(authorize('admin'))

router.post('/', validateCreateProduct, createProduct)
router.put('/:id', validateProductId, validateUpdateProduct, updateProduct)
router.delete('/:id', validateProductId, deleteProduct)
router.post(
  '/:id/images',
  validateProductId,
  upload.array('images', 5),
  validateMultipleFileUpload,
  uploadProductImages
)
router.patch('/:id/inventory', validateProductId, validateInventoryUpdate, updateInventory)

export default router
