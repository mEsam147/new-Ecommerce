// controllers/addressController.js
import Address from '../models/Address.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
export const getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 })

  res.json({
    success: true,
    data: addresses,
  })
})

// @desc    Get single address
// @route   GET /api/addresses/:id
// @access  Private
export const getAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user.id,
  })

  if (!address) {
    throw new ApiError(404, 'Address not found')
  }

  res.json({
    success: true,
    data: address,
  })
})

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
export const createAddress = asyncHandler(async (req, res) => {
  const {
    type,
    name,
    street,
    apartment,
    city,
    state,
    zipCode,
    country,
    phone,
    isDefault,
    instructions,
  } = req.body

  const address = await Address.create({
    user: req.user.id,
    type,
    name,
    street,
    apartment,
    city,
    state,
    zipCode,
    country,
    phone,
    isDefault: isDefault || false,
    instructions,
  })

  res.status(201).json({
    success: true,
    data: address,
    message: 'Address created successfully',
  })
})

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = asyncHandler(async (req, res) => {
  let address = await Address.findOne({
    _id: req.params.id,
    user: req.user.id,
  })

  if (!address) {
    throw new ApiError(404, 'Address not found')
  }

  address = await Address.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.json({
    success: true,
    data: address,
    message: 'Address updated successfully',
  })
})

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user.id,
  })

  if (!address) {
    throw new ApiError(404, 'Address not found')
  }

  await Address.findByIdAndDelete(req.params.id)

  res.json({
    success: true,
    message: 'Address deleted successfully',
  })
})

// @desc    Set default address
// @route   PATCH /api/addresses/:id/set-default
// @access  Private
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user.id,
  })

  if (!address) {
    throw new ApiError(404, 'Address not found')
  }

  address.isDefault = true
  await address.save()

  res.json({
    success: true,
    data: address,
    message: 'Default address set successfully',
  })
})

// @desc    Get default address
// @route   GET /api/addresses/default
// @access  Private
export const getDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    user: req.user.id,
    isDefault: true,
  })

  res.json({
    success: true,
    data: address,
  })
})
