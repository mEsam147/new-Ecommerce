// controllers/paymentController.js
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import paymentService from '../services/paymentService.js'

// @desc    إنشاء جلسة دفع Stripe
// @route   POST /api/payments/create-checkout-session
// @access  Private
export const createStripeCheckoutSession = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id
    const { successUrl, cancelUrl, shippingAddress } = req.body

    console.log('Creating checkout session for user:', userId)

    // الحصول على عربة التسوق
    const cart = await Cart.findOne({ user: userId }).populate(
      'items.product',
      'title images price inventory isActive'
    )

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'عربة التسوق فارغة')
    }

    // التحقق من العناصر وحساب المجموع
    let totalAmount = 0
    const lineItems = []
    const outOfStockItems = []

    for (const cartItem of cart.items) {
      const product = cartItem.product

      if (!product || !product.isActive) {
        outOfStockItems.push(product?.title || 'منتج غير معروف')
        continue
      }

      const availableStock = product.inventory.quantity
      if (availableStock < cartItem.quantity) {
        outOfStockItems.push(product.title)
        continue
      }

      const itemTotal = cartItem.price * cartItem.quantity
      totalAmount += itemTotal

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            images: [product.images[0]?.url],
            metadata: {
              productId: product._id.toString(),
            },
          },
          unit_amount: Math.round(cartItem.price * 100),
        },
        quantity: cartItem.quantity,
      })
    }

    if (outOfStockItems.length > 0) {
      throw new ApiError(400, `بعض العناصر غير متوفرة: ${outOfStockItems.join(', ')}`)
    }

    if (lineItems.length === 0) {
      throw new ApiError(400, 'لا توجد عناصر صالحة في عربة التسوق')
    }

    // إضافة الشحن والضريبة
    const shippingCost = totalAmount > 100 ? 0 : 10
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'رسوم الشحن',
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      })
      totalAmount += shippingCost
    }

    const taxAmount = totalAmount * 0.08
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'الضريبة',
        },
        unit_amount: Math.round(taxAmount * 100),
      },
      quantity: 1,
    })
    totalAmount += taxAmount

    // الحصول على أو إنشاء عميل Stripe
    let user = await User.findById(userId).select('+stripeCustomerId')
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      console.log('Creating new Stripe customer for user:', user.email)
      const customer = await paymentService.createCustomer(user.email, user.name, {
        userId: user._id.toString(),
      })
      stripeCustomerId = customer.id
      user.stripeCustomerId = stripeCustomerId
      await user.save({ validateBeforeSave: false })
      console.log('Stripe customer created:', stripeCustomerId)
    }

    // إنشاء جلسة الدفع
    console.log('Creating Stripe checkout session...')
    const session = await paymentService.createCheckoutSession({
      customerId: stripeCustomerId,
      lineItems,
      successUrl,
      cancelUrl,
      metadata: {
        userId: userId,
        cartId: cart._id.toString(),
        country: shippingAddress?.country || 'EG',
      },
    })

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        amount: totalAmount,
      },
      message: 'تم إنشاء جلسة الدفع بنجاح',
    })
  } catch (error) {
    console.error('Error in createStripeCheckoutSession:', error)

    // إرسال رسالة خطأ مناسبة للمستخدم
    if (error.message.includes('API key')) {
      throw new ApiError(500, 'خطأ في إعداد نظام الدفع. يرجى المحاولة لاحقاً.')
    }

    throw error
  }
})

// @desc    معالجة Stripe Webhook
// @route   POST /api/payments/webhook
// @access  Public
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = paymentService.constructWebhookEvent(req.body, sig)
  } catch (err) {
    console.error('فشل التحقق من توقيع Webhook:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // معالجة حدث اكتمال الدفع
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    try {
      await createOrderFromSession(session)
      console.log('تم إنشاء الطلب بنجاح من Stripe')
    } catch (error) {
      console.error('خطأ في إنشاء الطلب من الجلسة:', error)
    }
  }

  res.json({ received: true })
})

// @desc    الحصول على الدول المدعومة
// @route   GET /api/payments/supported-countries
// @access  Public
export const getSupportedCountries = asyncHandler(async (req, res) => {
  const countries = [
    { code: 'EG', name: 'مصر', currency: 'EGP', symbol: 'ج.م' },
    { code: 'SA', name: 'السعودية', currency: 'SAR', symbol: 'ر.س' },
    { code: 'AE', name: 'الإمارات', currency: 'AED', symbol: 'د.إ' },
    { code: 'BH', name: 'البحرين', currency: 'BHD', symbol: 'د.ب' },
    { code: 'QA', name: 'قطر', currency: 'QAR', symbol: 'ر.ق' },
    { code: 'KW', name: 'الكويت', currency: 'KWD', symbol: 'د.ك' },
    { code: 'OM', name: 'عمان', currency: 'OMR', symbol: 'ر.ع' },
    { code: 'JO', name: 'الأردن', currency: 'JOD', symbol: 'د.أ' },
    { code: 'LB', name: 'لبنان', currency: 'LBP', symbol: 'ل.ل' },
    { code: 'MA', name: 'المغرب', currency: 'MAD', symbol: 'د.م' },
    { code: 'TN', name: 'تونس', currency: 'TND', symbol: 'د.ت' },
  ]

  res.json({
    success: true,
    data: countries,
  })
})

// دالة مساعدة لإنشاء طلب من جلسة Stripe
const createOrderFromSession = async (session) => {
  const userId = session.metadata.userId
  const cartId = session.metadata.cartId

  // هنا تضيف منطق إنشاء الطلب كما في orderController
  // ... كود إنشاء الطلب

  // تنظيف عربة التسوق بعد الطلب الناجح
  await Cart.findByIdAndUpdate(cartId, { items: [] })
}

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'USD' } = req.body

  const paymentIntent = await paymentService.createPaymentIntent(
    amount,
    currency,
    req.user.stripeCustomerId,
    { userId: req.user.id }
  )

  res.json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    },
  })
})

export const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body

  const paymentIntent = await paymentService.verifyPayment(paymentIntentId)

  res.json({
    success: true,
    data: {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
    },
  })
})
