// controllers/wishlistController.js
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id })
    .populate('items.product', 'title images price rating inventory isActive');

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, items: [] });
  }

  // Filter out unavailable products
  wishlist.items = wishlist.items.filter(item =>
    item.product && item.product.isActive
  );

  await wishlist.save();

  res.json({
    success: true,
    data: wishlist
  });
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist/items
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found or unavailable');
  }

  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, items: [] });
  }

  // Check if product already in wishlist
  const existingItem = wishlist.items.find(item =>
    item.product.toString() === productId
  );

  if (existingItem) {
    throw new ApiError(400, 'Product already in wishlist');
  }

  // Add to wishlist
  wishlist.items.push({
    product: productId,
    addedAt: new Date()
  });

  await wishlist.save();
  await wishlist.populate('items.product', 'title images price rating');

  res.json({
    success: true,
    data: wishlist,
    message: 'Product added to wishlist'
  });
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/items/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    throw new ApiError(404, 'Wishlist not found');
  }

  const initialLength = wishlist.items.length;
  wishlist.items = wishlist.items.filter(item =>
    item.product.toString() !== productId
  );

  if (wishlist.items.length === initialLength) {
    throw new ApiError(404, 'Product not found in wishlist');
  }

  await wishlist.save();
  await wishlist.populate('items.product', 'title images price rating');

  res.json({
    success: true,
    data: wishlist,
    message: 'Product removed from wishlist'
  });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
export const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    throw new ApiError(404, 'Wishlist not found');
  }

  wishlist.items = [];
  await wishlist.save();

  res.json({
    success: true,
    data: wishlist,
    message: 'Wishlist cleared successfully'
  });
});

// @desc    Move wishlist item to cart
// @route   POST /api/wishlist/items/:productId/move-to-cart
// @access  Private
export const moveToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { size, color, quantity = 1 } = req.body;

  // This would integrate with the cart controller
  // For now, return success and let frontend handle the cart addition

  // Remove from wishlist
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (wishlist) {
    wishlist.items = wishlist.items.filter(item =>
      item.product.toString() !== productId
    );
    await wishlist.save();
  }

  res.json({
    success: true,
    message: 'Product moved to cart successfully'
  });
});

// @desc    Get wishlist count
// @route   GET /api/wishlist/count
// @access  Private
export const getWishlistCount = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  const count = wishlist ? wishlist.items.length : 0;

  res.json({
    success: true,
    data: { count }
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkInWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({
    user: req.user.id,
    'items.product': productId
  });

  res.json({
    success: true,
    data: { inWishlist: !!wishlist }
  });
});
