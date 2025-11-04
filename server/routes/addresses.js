// routes/addresses.js
import express from 'express';
import {
  getUserAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress
} from '../controllers/addressController.js';
import { protect } from '../middleware/auth.js';
import {
  validateAddressId,
  validateCreateAddress,
  validateUpdateAddress
} from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUserAddresses)
  .post(validateCreateAddress, createAddress);

router.get('/default', getDefaultAddress);
router.route('/:id')
  .get(validateAddressId, getAddress)
  .put(validateAddressId, validateUpdateAddress, updateAddress)
  .delete(validateAddressId, deleteAddress);

router.patch('/:id/set-default', validateAddressId, setDefaultAddress);

export default router;
