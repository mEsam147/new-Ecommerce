// routes/paymentRoutes.js
import express from 'express'
import {
  createStripeCheckoutSession,
  createPaymentIntent,
  handleStripeWebhook,
  verifyPayment,
  getSupportedCountries,
} from '../controllers/paymentController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Webhook يجب أن يكون بدون authentication
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)

// Routes الأخرى تحتاج authentication
router.use(protect)

router.post('/create-checkout-session', createStripeCheckoutSession)
router.post('/create-payment-intent', createPaymentIntent)
router.post('/verify-payment', verifyPayment)
router.get('/supported-countries', getSupportedCountries)

export default router
