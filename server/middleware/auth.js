// middleware/auth.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  let token

  // Check Authorization header first
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  // Then check cookies
  else if (req.cookies?.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return next(new ApiError(401, 'Not authorized, user not found'))
    }

    if (!user.isActive) {
      return next(new ApiError(401, 'Not authorized, account is deactivated'))
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new ApiError(401, 'User recently changed password. Please log in again.'))
    }

    req.user = user
    next()
  } catch (error) {
    return next(new ApiError(401, 'Not authorized, token failed'))
  }
})

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `User role ${req.user.role} is not authorized to access this route`)
      )
    }
    next()
  }
}
