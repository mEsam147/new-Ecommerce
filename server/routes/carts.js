// routes/carts.js
import express from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartCount,
} from '../controllers/cartController.js'
import { protect } from '../middleware/auth.js'
import {
  validateAddToCart,
  validateUpdateCartItem,
  validateCartItemId,
} from '../middleware/validation.js'

const router = express.Router()

router.use(protect)

router.route('/').get(getCart).delete(clearCart)

router.get('/count', getCartCount)
router.post('/items', addToCart)
router
  .route('/items/:itemId')
  .put(validateCartItemId, validateUpdateCartItem, updateCartItem)
  .delete(validateCartItemId, removeCartItem)

export default router
