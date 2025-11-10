// services/inventoryService.js
import Product from '../models/Product.js'
import ApiError from '../utils/ApiError.js'

class InventoryService {
  // Validate cart items and check inventory
  async validateCartItems(cartItems) {
    const errors = []
    const validItems = []
    const outOfStockItems = []
    const lowStockItems = []

    for (const cartItem of cartItems) {
      const product = cartItem.product

      if (!product) {
        errors.push(`Product not found for item: ${cartItem._id}`)
        continue
      }

      if (!product.isActive) {
        errors.push(`Product "${product.title}" is not active`)
        continue
      }

      let availableStock = product.inventory.quantity
      let variantStock = null
      let variantInfo = null

      // Check variant stock if variant is selected
      if (cartItem.variant && (cartItem.variant.size || cartItem.variant.color)) {
        const variant = product.variants.find(
          (v) => v.size === cartItem.variant.size && v.color === cartItem.variant.color
        )

        if (!variant) {
          errors.push(
            `Variant not found for "${product.title}" - Size: ${cartItem.variant.size}, Color: ${cartItem.variant.color}`
          )
          continue
        }

        variantStock = variant.stock
        availableStock = variantStock
        variantInfo = variant
      }

      // Check stock availability
      if (availableStock < cartItem.quantity) {
        outOfStockItems.push({
          product: product.title,
          variant: cartItem.variant,
          available: availableStock,
          requested: cartItem.quantity,
        })
        continue
      }

      // Check low stock warning
      const lowStockThreshold = product.inventory.lowStockAlert || 5
      if (availableStock - cartItem.quantity <= lowStockThreshold) {
        lowStockItems.push({
          product: product.title,
          variant: cartItem.variant,
          remaining: availableStock - cartItem.quantity,
        })
      }

      // Check if price has changed
      const currentPrice = variantInfo && variantInfo.price ? variantInfo.price : product.price
      if (currentPrice !== cartItem.price) {
        console.warn(
          `Price changed for "${product.title}": Was ${cartItem.price}, Now ${currentPrice}`
        )
        cartItem.price = currentPrice
      }

      validItems.push({
        ...(cartItem.toObject ? cartItem.toObject() : cartItem),
        product,
        variant: variantInfo || cartItem.variant,
      })
    }

    if (outOfStockItems.length > 0) {
      errors.push(
        `Insufficient stock: ${outOfStockItems
          .map(
            (item) => `${item.product} (Available: ${item.available}, Requested: ${item.requested})`
          )
          .join('; ')}`
      )
    }

    return {
      isValid: errors.length === 0,
      errors,
      validItems,
      outOfStockItems,
      lowStockItems,
    }
  }

  // Reserve inventory (mark as reserved but not yet deducted)
  async reserveInventory(items, session = null) {
    const operations = []

    for (const item of items) {
      const productId = item.product._id || item.product
      const quantity = item.quantity

      // Update variant stock if applicable
      if (item.variant && (item.variant.size || item.variant.color)) {
        operations.push(
          Product.updateOne(
            {
              _id: productId,
              'variants.size': item.variant.size,
              'variants.color': item.variant.color,
            },
            {
              $inc: { 'variants.$.reserved': quantity },
              $set: { 'variants.$.lastReserved': new Date() },
            }
          ).session(session)
        )
      }

      // Update general inventory
      operations.push(
        Product.findByIdAndUpdate(productId, {
          $inc: { 'inventory.reserved': quantity },
          $set: { 'inventory.lastReserved': new Date() },
        }).session(session)
      )
    }

    await Promise.all(operations)
    console.log(`✅ Reserved inventory for ${items.length} items`)
  }

  // Fulfill inventory (deduct from actual stock)
  async fulfillInventory(items, session = null) {
    const operations = []

    for (const item of items) {
      const productId = item.product._id || item.product
      const quantity = item.quantity

      // Update variant stock if applicable
      if (item.variant && (item.variant.size || item.variant.color)) {
        operations.push(
          Product.updateOne(
            {
              _id: productId,
              'variants.size': item.variant.size,
              'variants.color': item.variant.color,
            },
            {
              $inc: {
                'variants.$.stock': -quantity,
                'variants.$.reserved': -quantity,
              },
              $set: { 'variants.$.lastSold': new Date() },
            }
          ).session(session)
        )
      }

      // Update general inventory
      operations.push(
        Product.findByIdAndUpdate(productId, {
          $inc: {
            'inventory.quantity': -quantity,
            'inventory.reserved': -quantity,
            salesCount: quantity,
          },
          $set: { 'inventory.lastSold': new Date() },
        }).session(session)
      )
    }

    await Promise.all(operations)
    console.log(`✅ Fulfilled inventory for ${items.length} items`)
  }

  // Release reserved inventory (when order is cancelled)
  async releaseInventory(items, session = null) {
    const operations = []

    for (const item of items) {
      const productId = item.product._id || item.product
      const quantity = item.quantity

      // Release variant reserved stock
      if (item.variant && (item.variant.size || item.variant.color)) {
        operations.push(
          Product.updateOne(
            {
              _id: productId,
              'variants.size': item.variant.size,
              'variants.color': item.variant.color,
            },
            {
              $inc: { 'variants.$.reserved': -quantity },
            }
          ).session(session)
        )
      }

      // Release general reserved inventory
      operations.push(
        Product.findByIdAndUpdate(productId, {
          $inc: { 'inventory.reserved': -quantity },
        }).session(session)
      )
    }

    await Promise.all(operations)
    console.log(`✅ Released reserved inventory for ${items.length} items`)
  }

  // Check product availability
  async checkProductAvailability(productId, variant = null, quantity = 1) {
    const product = await Product.findById(productId)

    if (!product || !product.isActive) {
      return { available: false, reason: 'Product not found or inactive' }
    }

    let availableStock = product.inventory.quantity

    if (variant && (variant.size || variant.color)) {
      const variantInfo = product.variants.find(
        (v) => v.size === variant.size && v.color === variant.color
      )

      if (!variantInfo) {
        return { available: false, reason: 'Variant not found' }
      }

      availableStock = variantInfo.stock
    }

    const isAvailable = availableStock >= quantity
    const availableQuantity = Math.min(availableStock, quantity)

    return {
      available: isAvailable,
      availableQuantity,
      totalAvailable: availableStock,
      product: product.title,
      variant,
    }
  }

  // Get low stock alerts
  async getLowStockAlerts(threshold = 5) {
    const lowStockProducts = await Product.find({
      $or: [
        { 'inventory.quantity': { $lte: threshold } },
        { 'variants.stock': { $lte: threshold } },
      ],
      isActive: true,
    }).select('title inventory variants')

    const alerts = []

    lowStockProducts.forEach((product) => {
      if (product.inventory.quantity <= threshold) {
        alerts.push({
          product: product.title,
          type: 'general',
          currentStock: product.inventory.quantity,
          threshold,
        })
      }

      product.variants.forEach((variant) => {
        if (variant.stock <= threshold) {
          alerts.push({
            product: product.title,
            type: 'variant',
            variant: `${variant.size}/${variant.color}`,
            currentStock: variant.stock,
            threshold,
          })
        }
      })
    })

    return alerts
  }

  // Update inventory levels
  async updateInventory(productId, updates, session = null) {
    const product = await Product.findById(productId).session(session)

    if (!product) {
      throw new ApiError(404, 'Product not found')
    }

    if (updates.quantity !== undefined) {
      product.inventory.quantity = updates.quantity
    }

    if (updates.lowStockAlert !== undefined) {
      product.inventory.lowStockAlert = updates.lowStockAlert
    }

    if (updates.trackQuantity !== undefined) {
      product.inventory.trackQuantity = updates.trackQuantity
    }

    if (updates.variants) {
      updates.variants.forEach((update) => {
        const variant = product.variants.find(
          (v) => v.size === update.size && v.color === update.color
        )
        if (variant && update.stock !== undefined) {
          variant.stock = update.stock
        }
      })
    }

    await product.save({ session })
    return product
  }
}

export default new InventoryService()
