// routes/paymentRoutes.js
import express from 'express'
import {
  createStripeCheckoutSession,
  handleStripeWebhook,
  getSessionStatus,
  processManualPayment,
  getPaymentDetails,
  getUserPayments,
  processRefund,
  getSupportedCountries,
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from '../controllers/paymentController.js'
import { protect, authorize } from '../middleware/auth.js'
// import {
//   validateProcessPayment,
//   validateRefund,
//   validatePagination,
//   validateCreatePaymentIntent,
//   validateConfirmPayment,
//   validateAddPaymentMethod,
//   validateUpdatePaymentMethod,
// } from '../middleware/validation.js'

const router = express.Router()

// Webhook must be before protect middleware and use raw body
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)

// All other routes are protected
router.use(protect)

// Checkout and session management
router.post('/create-checkout-session', createStripeCheckoutSession)
router.get('/session/:sessionId', getSessionStatus)
router.get('/supported-countries', getSupportedCountries)
router.post('/create-payment-intent', createPaymentIntent)

// Payment processing
router.post('/confirm-payment', confirmPayment)
router.post('/process-payment', processManualPayment)

// Payment methods management
router.get('/payment-methods', getPaymentMethods)
router.post('/payment-methods', addPaymentMethod)
router.put('/payment-methods/:methodId', updatePaymentMethod)
router.delete('/payment-methods/:methodId', deletePaymentMethod)
router.patch('/payment-methods/:methodId/default', setDefaultPaymentMethod)

// User payment history
router.get('/', getUserPayments)
router.get('/:paymentId', getPaymentDetails)

// Admin routes
router.use(authorize('admin'))

router.post('/:paymentId/refund', processRefund)

export default router
