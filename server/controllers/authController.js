// // controllers/authController.js
// import crypto from 'crypto' // <-- ADD THIS
// import User from '../models/User.js'
// import asyncHandler from '../utils/asyncHandler.js'
// import ApiError from '../utils/ApiError.js'
// import generateToken from '../utils/generateToken.js'
// import emailService from '../services/emailService.js'

// // Helper: Set JWT in httpOnly cookie + send response
// const sendTokenResponse = (user, statusCode, res) => {
//   const token = generateToken(user._id)

//   const cookieOptions = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'strict',
//     maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//   }

//   res.cookie('jwt', token, cookieOptions)

//   // Remove password
//   user.password = undefined

//   res.status(statusCode).json({
//     success: true,
//     data: {
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         avatar: user.avatar,
//       },
//       token, // Keep for API clients
//     },
//     message: statusCode === 201 ? 'User registered successfully' : 'Login successful',
//   })
// }

// /* -------------------------------------------------------------------------- */
// /*                               REGISTER USER                                */
// /* -------------------------------------------------------------------------- */
// export const register = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body

//   const userExists = await User.findOne({ email })
//   if (userExists) throw new ApiError(400, 'User already exists with this email')

//   const user = await User.create({ name, email, password })

//   // Fire-and-forget welcome email
//   emailService.sendWelcomeEmail(user.email, user.name).catch((err) => {
//     console.error('Welcome email failed:', err.message)
//   })

//   sendTokenResponse(user, 201, res) // Only one response
// })

// /* -------------------------------------------------------------------------- */
// /*                                 LOGIN USER                                 */
// /* -------------------------------------------------------------------------- */
// export const login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body

//   if (!email || !password) throw new ApiError(400, 'Please provide email and password')

//   const user = await User.findOne({ email }).select('+password')
//   if (!user || !(await user.correctPassword(password, user.password))) {
//     throw new ApiError(401, 'Invalid email or password')
//   }

//   if (!user.isActive) {
//     throw new ApiError(401, 'Your account has been deactivated. Please contact support.')
//   }

//   user.lastLogin = new Date()
//   await user.save({ validateBeforeSave: false })

//   sendTokenResponse(user, 200, res) // Only one response
// })

// /* -------------------------------------------------------------------------- */
// /*                              CURRENT USER (ME)                              */
// /* -------------------------------------------------------------------------- */
// export const getMe = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id).populate('addresses').populate('wishlist')

//   if (!user) {
//     throw new ApiError(404, 'User not found')
//   }

//   // Send the response in the same format as login/register
//   res.json({
//     success: true,
//     data: {
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         avatar: user.avatar,
//         // Include any other fields you need
//         addresses: user.addresses,
//         wishlist: user.wishlist,
//         lastLogin: user.lastLogin,
//         isActive: user.isActive,
//       },
//     },
//     message: 'User retrieved successfully',
//   })
// })

// /* -------------------------------------------------------------------------- */
// /*                              UPDATE PROFILE                                 */
// /* -------------------------------------------------------------------------- */
// export const updateProfile = asyncHandler(async (req, res) => {
//   const { name, email, phone } = req.body

//   const user = await User.findByIdAndUpdate(
//     req.user.id,
//     { name, email, phone },
//     { new: true, runValidators: true }
//   ).select('-password')

//   res.json({
//     success: true,
//     data: user,
//     message: 'Profile updated successfully',
//   })
// })

// /* -------------------------------------------------------------------------- */
// /*                              CHANGE PASSWORD                                */
// /* -------------------------------------------------------------------------- */
// export const changePassword = asyncHandler(async (req, res) => {
//   const { currentPassword, newPassword } = req.body

//   const user = await User.findById(req.user.id).select('+password')

//   if (!(await user.correctPassword(currentPassword, user.password))) {
//     throw new ApiError(401, 'Current password is incorrect')
//   }

//   user.password = newPassword
//   await user.save()

//   await emailService.sendPasswordChangeNotification(user.email, user.name)

//   res.json({ success: true, message: 'Password changed successfully' })
// })

// /* -------------------------------------------------------------------------- */
// /*                              FORGOT PASSWORD                                */
// /* -------------------------------------------------------------------------- */
// export const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body
//   const user = await User.findOne({ email })

//   if (!user) throw new ApiError(404, 'No user found with this email address')

//   const resetToken = user.createPasswordResetToken()
//   await user.save({ validateBeforeSave: false })

//   const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

//   try {
//     await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl)
//     res.json({ success: true, message: 'Password reset email sent successfully' })
//   } catch (error) {
//     user.passwordResetToken = undefined
//     user.passwordResetExpires = undefined
//     await user.save({ validateBeforeSave: false })
//     throw new ApiError(500, 'There was an error sending the email. Try again later.')
//   }
// })

// /* -------------------------------------------------------------------------- */
// /*                              RESET PASSWORD                                 */
// /* -------------------------------------------------------------------------- */
// export const resetPassword = asyncHandler(async (req, res) => {
//   const { token } = req.params
//   const { password } = req.body

//   const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   })

//   if (!user) throw new ApiError(400, 'Token is invalid or has expired')

//   user.password = password
//   user.passwordResetToken = undefined
//   user.passwordResetExpires = undefined
//   await user.save()

//   await emailService.sendPasswordResetConfirmation(user.email, user.name)

//   // Log user in after reset
//   sendTokenResponse(user, 200, res)
// })

// /* -------------------------------------------------------------------------- */
// /*                                  LOGOUT                                    */
// /* -------------------------------------------------------------------------- */
// export const logout = asyncHandler(async (req, res) => {
//   res.cookie('jwt', '', {
//     httpOnly: true,
//     expires: new Date(0),
//   })

//   res.json({ success: true, message: 'Logged out successfully' })
// })

import crypto from 'crypto'
import fs from 'fs'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import generateToken from '../utils/generateToken.js'
import emailService from '../services/emailService.js'
import cloudinary from '../utils/cloudinary.js' // تأكد من وجود الملف ده لرفع الصور

/* -------------------------------------------------------------------------- */
/*                           HELPER: SEND TOKEN RESPONSE                      */
/* -------------------------------------------------------------------------- */
// const sendTokenResponse = (user, statusCode, res) => {
//   const token = generateToken(user._id)

//   const cookieOptions = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'strict',
//     maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//   }

//   res.cookie('jwt', token, cookieOptions)
//   user.password = undefined

//   res.status(statusCode).json({
//     success: true,
//     data: {
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         avatar: user.avatar,
//       },
//       token,
//     },
//     message: statusCode === 201 ? 'User registered successfully' : 'Login successful',
//   })
// }
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id)

  const isProduction = process.env.NODE_ENV === 'production'

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // 🔒 لازم HTTPS في الإنتاج
    sameSite: isProduction ? 'none' : 'lax', // ✅ مهم للتوافق
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  }

  res.cookie('jwt', token, cookieOptions)
  user.password = undefined

  res.status(statusCode).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    },
    message: statusCode === 201 ? 'User registered successfully' : 'Login successful',
  })
}

/* -------------------------------------------------------------------------- */
/*                               REGISTER USER                                */
/* -------------------------------------------------------------------------- */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const userExists = await User.findOne({ email })
  if (userExists) throw new ApiError(400, 'User already exists with this email')

  const user = await User.create({ name, email, password })

  // Send welcome email
  emailService.sendWelcomeEmail(user.email, user.name).catch((err) => {
    console.error('Welcome email failed:', err.message)
  })

  sendTokenResponse(user, 201, res)
})

/* -------------------------------------------------------------------------- */
/*                                 LOGIN USER                                 */
/* -------------------------------------------------------------------------- */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) throw new ApiError(400, 'Please provide email and password')

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Your account has been deactivated. Please contact support.')
  }

  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  sendTokenResponse(user, 200, res)
})

/* -------------------------------------------------------------------------- */
/*                                 GET ME                                     */
/* -------------------------------------------------------------------------- */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('addresses').populate('wishlist')

  if (!user) throw new ApiError(404, 'User not found')

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        wishlist: user.wishlist,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
      },
    },
    message: 'User retrieved successfully',
  })
})

/* -------------------------------------------------------------------------- */
/*                              UPDATE PROFILE                                 */
/* -------------------------------------------------------------------------- */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email, phone },
    { new: true, runValidators: true }
  ).select('-password')

  res.json({
    success: true,
    data: { user },
    message: 'Profile updated successfully',
  })
})

/* -------------------------------------------------------------------------- */
/*                              CHANGE PASSWORD                                */
/* -------------------------------------------------------------------------- */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user.id).select('+password')

  if (!(await user.correctPassword(currentPassword, user.password))) {
    throw new ApiError(401, 'Current password is incorrect')
  }

  user.password = newPassword
  await user.save()
  await emailService.sendPasswordChangeNotification(user.email, user.name)

  res.json({ success: true, message: 'Password changed successfully' })
})

/* -------------------------------------------------------------------------- */
/*                              FORGOT PASSWORD                                */
/* -------------------------------------------------------------------------- */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) throw new ApiError(404, 'No user found with this email')

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

  try {
    await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl)
    res.json({ success: true, message: 'Password reset email sent successfully' })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    throw new ApiError(500, 'There was an error sending the email. Try again later.')
  }
})

/* -------------------------------------------------------------------------- */
/*                              RESET PASSWORD                                 */
/* -------------------------------------------------------------------------- */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  if (!user) throw new ApiError(400, 'Token is invalid or has expired')

  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  await emailService.sendPasswordResetConfirmation(user.email, user.name)
  sendTokenResponse(user, 200, res)
})

/* -------------------------------------------------------------------------- */
/*                                  LOGOUT                                    */
/* -------------------------------------------------------------------------- */
export const logout = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  })
  res.json({ success: true, message: 'Logged out successfully' })
})

/* -------------------------------------------------------------------------- */
/*                              UPDATE AVATAR                                 */
/* -------------------------------------------------------------------------- */
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please upload an image')

  const user = await User.findById(req.user.id)
  if (!user) throw new ApiError(404, 'User not found')

  // حذف الصورة القديمة من Cloudinary
  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id)
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'avatars',
    width: 300,
    crop: 'scale',
  })

  fs.unlinkSync(req.file.path) // حذف الصورة المؤقتة

  user.avatar = {
    public_id: result.public_id,
    url: result.secure_url,
  }
  await user.save()

  res.json({
    success: true,
    data: {
      user,
      avatar: user.avatar,
    },
    message: 'Avatar updated successfully',
  })
})

/* -------------------------------------------------------------------------- */
/*                              DELETE AVATAR                                 */
/* -------------------------------------------------------------------------- */
export const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) throw new ApiError(404, 'User not found')

  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id)
  }

  user.avatar = { public_id: '', url: '' }
  await user.save()

  res.json({
    success: true,
    data: { user },
    message: 'Avatar deleted successfully',
  })
})
