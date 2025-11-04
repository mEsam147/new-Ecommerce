// routes/wishlists.js
import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
  getWishlistCount,
  checkInWishlist
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';
import {
  validateProductIdParam,
  validateAddToWishlist,
  validateMoveToCart
} from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWishlist)
  .delete(clearWishlist);

router.get('/count', getWishlistCount);
router.get('/check/:productId', validateProductIdParam, checkInWishlist);
router.post('/items', validateAddToWishlist, addToWishlist);
router.delete('/items/:productId', validateProductIdParam, removeFromWishlist);
router.post('/items/:productId/move-to-cart', validateProductIdParam, validateMoveToCart, moveToCart);

export default router;
