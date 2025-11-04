// routes/analytics.js
import express from 'express';
import {
  getDashboardOverview,
  getSalesAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  exportAnalytics
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  validateAnalyticsPeriod,
  validateExportAnalytics
} from '../middleware/validation.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', validateAnalyticsPeriod, getDashboardOverview);
router.get('/sales', validateAnalyticsPeriod, getSalesAnalytics);
router.get('/products', validateAnalyticsPeriod, getProductAnalytics);
router.get('/customers', validateAnalyticsPeriod, getCustomerAnalytics);
router.get('/export', validateExportAnalytics, exportAnalytics);

export default router;
