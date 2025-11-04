// middleware/validation/paymentValidation.js
import { body, param } from 'express-validator'
import PaymentMethod from '../../models/PaymentMethod.js'

export const validateAddPaymentMethod = [
  body('paymentMethodId')
    .notEmpty()
    .withMessage('Payment method ID is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Payment method ID must be between 1 and 100 characters'),

  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),

  body('type')
    .optional()
    .isIn(['card', 'paypal', 'apple_pay', 'google_pay'])
    .withMessage('Invalid payment method type'),

  body('metadata.createdVia')
    .optional()
    .isIn(['checkout', 'wallet', 'manual'])
    .withMessage('Invalid creation method'),
]

export const validateUpdatePaymentMethod = [
  param('id').isMongoId().withMessage('Invalid payment method ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('billing_details.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('billing_details.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Billing name must be between 1 and 100 characters'),
]

export const validatePaymentMethodId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid payment method ID')
    .custom(async (id, { req }) => {
      const paymentMethod = await PaymentMethod.findOne({
        _id: id,
        user: req.user.id,
        isActive: true,
      })

      if (!paymentMethod) {
        throw new Error('Payment method not found')
      }

      return true
    }),
]

export const validatePaymentAmount = [
  body('amount')
    .isFloat({ min: 0.5 })
    .withMessage('Amount must be at least $0.50')
    .custom((value) => {
      const decimalPlaces = value.toString().split('.')[1]?.length || 0
      if (decimalPlaces > 2) {
        throw new Error('Amount cannot have more than 2 decimal places')
      }
      return true
    }),

  body('currency')
    .optional()
    .isIn(['usd', 'eur', 'gbp', 'cad', 'aud'])
    .withMessage('Unsupported currency'),
]
