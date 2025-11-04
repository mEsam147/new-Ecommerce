// routes/users.js
import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  uploadAvatar
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  validateUserId,
  validateUserUpdate,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(validatePagination, getUsers);

router.route('/:id')
  .get(validateUserId, getUser)
  .put(validateUserId, validateUserUpdate, updateUser)
  .delete(validateUserId, deleteUser);

router.patch('/:id/toggle-status', validateUserId, toggleUserStatus);
router.get('/:id/stats', validateUserId, getUserStats);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

export default router;
