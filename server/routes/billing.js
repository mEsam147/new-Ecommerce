// routes/billing.js
import express from 'express'
import {
  getPaymentHistory,
  getBillingStats,
  getPaymentMethods,
  requestRefund,
  downloadInvoice,
} from '../controllers/billingController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// All routes are protected
router.use(protect)

router.get('/payments', getPaymentHistory)
router.get('/stats', getBillingStats)
router.get('/payment-methods', getPaymentMethods)
router.post('/payments/:id/refund', requestRefund)
router.post('/payments/:id/invoice', downloadInvoice)

export default router
