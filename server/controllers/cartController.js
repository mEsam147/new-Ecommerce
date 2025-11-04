// controllers/cartController.js
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'

// @desc    Add item to cart
// @route   POST /api/carts/items
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size = '', color = '' } = req.body

  console.log('🛒 ===== ADD TO CART =====')
  console.log('🛒 User ID:', req.user.id)
  console.log('🛒 Product ID:', productId)
  console.log('🛒 Quantity:', quantity)
  console.log('🛒 Size:', size)
  console.log('🛒 Color:', color)

  const product = await Product.findById(productId)
  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  let cart = await Cart.findOne({ user: req.user.id })
  console.log('🛒 Found cart:', cart ? cart._id : 'No cart found')

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] })
    console.log('🛒 Created new cart:', cart._id)
  }

  // FIX: Check for existing item with same product, size, and color
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.variant.size === size &&
      item.variant.color === color
  )

  console.log('🛒 Existing item index:', existingItemIndex)

  if (existingItemIndex > -1) {
    // FIX: Update quantity for existing item instead of adding duplicate
    console.log('🛒 Item already exists, updating quantity')
    cart.items[existingItemIndex].quantity += quantity

    // Validate stock
    const availableStock = await getAvailableStock(product, size, color)
    if (cart.items[existingItemIndex].quantity > availableStock) {
      throw new ApiError(400, `Only ${availableStock} items available in stock`)
    }
  } else {
    // FIX: Only add new item if it doesn't exist
    console.log('🛒 Adding new item to cart')

    // Validate stock before adding
    const availableStock = await getAvailableStock(product, size, color)
    if (quantity > availableStock) {
      throw new ApiError(400, `Only ${availableStock} items available in stock`)
    }

    cart.items.push({
      product: productId,
      variant: { size, color },
      quantity,
      price: product.price,
    })
  }

  await cart.save()
  console.log('🛒 Cart after save - Items count:', cart.items.length)

  // Populate product details
  await cart.populate('items.product', 'title images price variants inventory')

  res.json({
    success: true,
    data: cart,
    message: existingItemIndex > -1 ? 'Cart item quantity updated' : 'Item added to cart',
  })
})

// Helper function to get available stock
const getAvailableStock = async (product, size, color) => {
  if (size && color) {
    const variant = product.variants.find((v) => v.size === size && v.color === color)
    return variant ? variant.stock : 0
  }
  return product.inventory.quantity
}

// @desc    Get user's cart
// @route   GET /api/carts
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  console.log('🛒 ===== GET CART =====')
  console.log('🛒 User ID:', req.user.id)

  let cart = await Cart.findOne({ user: req.user.id }).populate(
    'items.product',
    'title images price variants inventory isActive'
  )
  console.log('🛒 Found cart:', cart ? cart._id : 'No cart found')

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] })
    console.log('🛒 Created new cart:', cart._id)
  }

  // Filter out inactive products
  cart.items = cart.items.filter((item) => item.product && item.product.isActive)

  await cart.save()

  console.log('🛒 Cart items count:', cart.items.length)
  console.log(
    '🛒 Cart items:',
    cart.items.map((item) => ({
      product: item.product.title,
      quantity: item.quantity,
      size: item.variant.size,
      color: item.variant.color,
    }))
  )

  res.json({
    success: true,
    data: cart,
  })
})

// @desc    Update cart item quantity
// @route   PUT /api/carts/items/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body

  if (quantity < 0) {
    throw new ApiError(400, 'Quantity must be positive')
  }

  const cart = await Cart.findOne({ user: req.user.id })
  if (!cart) {
    throw new ApiError(404, 'Cart not found')
  }

  const itemIndex = cart.items.findIndex((item) => item._id.toString() === req.params.itemId)

  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart')
  }

  const item = cart.items[itemIndex]
  const product = await Product.findById(item.product)

  if (!product || !product.isActive) {
    throw new ApiError(400, 'Product is no longer available')
  }

  // Check stock
  const availableStock = await getAvailableStock(product, item.variant.size, item.variant.color)

  if (quantity > availableStock) {
    throw new ApiError(400, `Only ${availableStock} items available in stock`)
  }

  if (quantity === 0) {
    cart.items.splice(itemIndex, 1)
  } else {
    cart.items[itemIndex].quantity = quantity
  }

  await cart.save()
  await cart.populate('items.product', 'title images price variants inventory')

  res.json({
    success: true,
    data: cart,
    message: 'Cart updated successfully',
  })
})

// @desc    Remove item from cart
// @route   DELETE /api/carts/items/:itemId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
  if (!cart) {
    throw new ApiError(404, 'Cart not found')
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId)

  await cart.save()
  await cart.populate('items.product', 'title images price variants inventory')

  res.json({
    success: true,
    data: cart,
    message: 'Item removed from cart successfully',
  })
})

// @desc    Clear cart
// @route   DELETE /api/carts/clear
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
  if (!cart) {
    throw new ApiError(404, 'Cart not found')
  }

  cart.items = []
  await cart.save()

  res.json({
    success: true,
    data: cart,
    message: 'Cart cleared successfully',
  })
})

// @desc    Get cart count
// @route   GET /api/carts/count
// @access  Private
export const getCartCount = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
  const count = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0

  res.json({
    success: true,
    data: { count },
  })
})
