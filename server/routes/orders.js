// routes/orders.js
import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  validateOrderId,
  validateCreateOrder,
  validateOrderStatus,
  validateCancelOrder,
  validatePagination,
  validateAnalyticsPeriod
} from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(validateCreateOrder, createOrder)
  .get(validatePagination, getUserOrders);

router.get('/admin/all', authorize('admin'), validatePagination, getAllOrders);
router.get('/stats', authorize('admin'), validateAnalyticsPeriod, getOrderStats);
router.get('/:id', validateOrderId, getOrder);
router.put('/:id/status', authorize('admin'), validateOrderId, validateOrderStatus, updateOrderStatus);
router.put('/:id/cancel', validateOrderId, validateCancelOrder, cancelOrder);

export default router;
