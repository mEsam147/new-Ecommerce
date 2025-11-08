// routes/paymentRoutes.js
import express from 'express'
import {
  createStripeCheckoutSession,
  handleStripeWebhook,
  getSessionStatus,
  getSupportedCountries,
  decrementInventoryDirectly,
} from '../controllers/paymentController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Webhook must be before protect middleware and use raw body
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)

// All other routes are protected
router.use(protect)

router.post('/create-checkout-session', createStripeCheckoutSession)
router.get('/session/:sessionId', getSessionStatus)
router.get('/supported-countries', getSupportedCountries)
router.post('/decrement-inventory', decrementInventoryDirectly)

export default router
