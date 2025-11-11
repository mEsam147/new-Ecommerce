// routes/orderRoutes.js
import express from 'express'
import {
  createOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  processRefund,
  getOrderStats,
  getOrderInvoice,
  trackOrder,
  requestReturn,
  updateShippingInfo,
} from '../controllers/orderController.js'
import { protect, authorize } from '../middleware/auth.js'
import {
  validateOrderId,
  validateCreateOrder,
  validateOrderStatus,
  validateCancelOrder,
  validatePagination,
  validateAnalyticsPeriod,
} from '../middleware/validation.js'

const router = express.Router()

// All routes protected
router.use(protect)

// User routes
router.post('/', createOrder)
router.get('/my-orders', validatePagination, getUserOrders)
router.get('/:id', getOrder)
router.get('/:id/invoice', validateOrderId, getOrderInvoice)
router.get('/:id/track', validateOrderId, trackOrder)
router.put('/:id/cancel', validateOrderId, validateCancelOrder, cancelOrder)
router.post('/:id/return', validateOrderId, requestReturn)

// Admin routes
router.use(authorize('admin'))

router.get('/admin/all', validatePagination, getAllOrders)
router.get('/admin/stats', validateAnalyticsPeriod, getOrderStats)
router.put('/admin/:id/status', validateOrderId, validateOrderStatus, updateOrderStatus)
router.put('/admin/:id/shipping', validateOrderId, updateShippingInfo)
router.post('/admin/:id/refund', validateOrderId, processRefund)

export default router
