// routes/auth.js
import express from 'express'
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
} from '../middleware/validation.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', validateLogin, login)
router.post('/forgot-password', validateForgotPassword, forgotPassword)
router.put('/reset-password/:token', validateResetPassword, resetPassword)

router.use(protect)

router.get('/me', getMe)
router.put('/profile', validateUpdateProfile, updateProfile)
router.put('/change-password', validateChangePassword, changePassword)
router.post('/logout', logout)

export default router
