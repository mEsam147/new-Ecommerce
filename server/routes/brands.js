// routes/brands.js
import express from 'express'
import {
  getBrands,
  getBrand,
  getBrandBySlug,
  getBrandProductsBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandLogo,
  uploadBrandBanner,
  getBrandProducts,
  getFeaturedBrands,
  followBrand,
  unfollowBrand,
  getFollowedBrands,
  getBrandCategories,
} from '../controllers/brandController.js'
import { protect, authorize } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// Public routes
router.get('/', getBrands)
router.get('/featured', getFeaturedBrands)
router.get('/slug/:slug', getBrandBySlug)
router.get('/slug/:slug/products', getBrandProductsBySlug) // Add this route
router.get('/:slug/categories', getBrandCategories) // Add this route
router.get('/:id', getBrand)
router.get('/:id/products', getBrandProducts)

// Protected routes
router.use(protect)
router.get('/user/followed', getFollowedBrands)
router.post('/:id/follow', followBrand)
router.delete('/:id/unfollow', unfollowBrand)

// Admin routes
router.use(authorize('admin'))
router.post('/', createBrand)
router.put('/:id', updateBrand)
router.delete('/:id', deleteBrand)
router.post('/:id/logo', upload.single('image'), uploadBrandLogo)
router.post('/:id/banner', upload.single('image'), uploadBrandBanner)

export default router
