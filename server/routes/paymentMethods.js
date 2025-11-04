// server/routes/paymentMethods.js
import express from 'express'
import {
  getPaymentMethods,
  createSetupIntent,
  addPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  updatePaymentMethod,
  getPaymentMethodById,
  verifyPaymentMethod,
} from '../controllers/paymentMethodsController.js'
import { protect } from '../middleware/auth.js'
import {
  validateAddPaymentMethod,
  validateUpdatePaymentMethod,
  validatePaymentMethodId,
} from '../middleware/validation/paymentValidation.js'
import { handleValidationErrors } from '../middleware/validation/index.js'

const router = express.Router()

router.use(protect)

router.get('/', getPaymentMethods)
router.get('/:id', validatePaymentMethodId, handleValidationErrors, getPaymentMethodById)
router.post('/setup-intent', createSetupIntent)
router.post('/', validateAddPaymentMethod, handleValidationErrors, addPaymentMethod)
router.patch(
  '/:id/default',
  validatePaymentMethodId,
  handleValidationErrors,
  setDefaultPaymentMethod
)
router.put(
  '/:id',
  validatePaymentMethodId,
  validateUpdatePaymentMethod,
  handleValidationErrors,
  updatePaymentMethod
)
router.delete('/:id', validatePaymentMethodId, handleValidationErrors, deletePaymentMethod)
router.post('/:id/verify', validatePaymentMethodId, handleValidationErrors, verifyPaymentMethod)

export default router
