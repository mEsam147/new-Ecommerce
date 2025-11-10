// // services/paymentService.js
// import Stripe from 'stripe'
// import dotenv from 'dotenv'
// dotenv.config()

// class PaymentService {
//   constructor() {
//     // التحقق من وجود مفتاح Stripe
//     if (!process.env.STRIPE_SECRET_KEY) {
//       throw new Error('مفتاح Stripe السري غير مضبوط في متغيرات البيئة')
//     }

//     this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//       apiVersion: '2023-10-16',
//     })

//     this.supportedCountries = ['US', 'GB', 'CA', 'AU', 'AE', 'SA', 'EG', 'FR', 'DE'] // Added more countries
//   }

//   // إنشاء عميل في Stripe
//   async createCustomer(email, name, metadata = {}) {
//     try {
//       console.log('Creating Stripe customer for:', email)

//       const customer = await this.stripe.customers.create({
//         email,
//         name,
//         metadata,
//       })

//       console.log('Stripe customer created:', customer.id)
//       return customer
//     } catch (error) {
//       console.error('Error creating Stripe customer:', error)
//       throw new Error(`فشل في إنشاء العميل: ${error.message}`)
//     }
//   }

//   // إنشاء جلسة دفع - FIXED VERSION
//   async createCheckoutSession({
//     customerId,
//     lineItems,
//     successUrl,
//     cancelUrl,
//     metadata,
//     shippingAddressCollection,
//     shippingOptions,
//     customerEmail,
//     mode = 'payment',
//     allowPromotionCodes = true,
//   }) {
//     try {
//       console.log('Creating checkout session with params:', {
//         customerId,
//         customerEmail,
//         lineItemsCount: lineItems.length,
//         metadata,
//       })

//       const sessionParams = {
//         payment_method_types: ['card'],
//         line_items: lineItems,
//         mode: mode,
//         success_url: successUrl,
//         cancel_url: cancelUrl,
//         customer_update: {
//           address: 'auto',
//           shipping: 'auto',
//         },
//         locale: 'auto',
//         metadata,
//         allow_promotion_codes: allowPromotionCodes,
//       }

//       // Use customer ID if available, otherwise use customer email (BUT NOT BOTH)
//       if (customerId) {
//         sessionParams.customer = customerId
//         console.log('Using existing customer:', customerId)
//       } else if (customerEmail) {
//         sessionParams.customer_email = customerEmail
//         console.log('Using customer email:', customerEmail)
//       }

//       // Add optional parameters if provided
//       if (shippingAddressCollection) {
//         sessionParams.shipping_address_collection = shippingAddressCollection
//       } else {
//         // Default shipping address collection
//         sessionParams.shipping_address_collection = {
//           allowed_countries: this.supportedCountries,
//         }
//       }

//       if (shippingOptions && shippingOptions.length > 0) {
//         sessionParams.shipping_options = shippingOptions
//       }

//       console.log('Final session params:', JSON.stringify(sessionParams, null, 2))

//       const session = await this.stripe.checkout.sessions.create(sessionParams)

//       console.log('✅ Checkout session created:', session.id)
//       console.log('🔗 Checkout URL:', session.url)
//       return session
//     } catch (error) {
//       console.error('❌ Error creating checkout session:', error)
//       throw new Error(`فشل في إنشاء جلسة الدفع: ${error.message}`)
//     }
//   }

//   // services/paymentService.js - FIXED retrieveCheckoutSession method
//   async retrieveCheckoutSession(sessionId) {
//     try {
//       console.log('🔍 Retrieving checkout session:', sessionId)
//       console.log('📏 Session ID length:', sessionId?.length)

//       // Enhanced validation
//       if (!sessionId || typeof sessionId !== 'string') {
//         throw new Error('Session ID is required and must be a string')
//       }

//       const cleanedSessionId = sessionId.trim()

//       if (cleanedSessionId.length < 10) {
//         throw new Error(`Session ID is too short: ${cleanedSessionId.length} characters`)
//       }

//       if (!cleanedSessionId.startsWith('cs_')) {
//         throw new Error(
//           `Session ID must start with 'cs_'. Got: ${cleanedSessionId.substring(0, 10)}`
//         )
//       }

//       console.log('🎯 Cleaned session ID for Stripe API:', cleanedSessionId)

//       // Retrieve the session with minimal expansion to avoid API issues
//       const session = await this.stripe.checkout.sessions.retrieve(cleanedSessionId, {
//         expand: ['line_items', 'customer', 'payment_intent'],
//       })

//       console.log('✅ Session retrieved successfully:', {
//         id: session.id,
//         status: session.status,
//         paymentStatus: session.payment_status,
//         customer: session.customer,
//         amountTotal: session.amount_total,
//       })

//       return session
//     } catch (error) {
//       console.error('❌ Stripe API error details:', {
//         message: error.message,
//         type: error.type,
//         code: error.code,
//         statusCode: error.statusCode,
//       })

//       // Handle specific Stripe errors
//       if (error.type === 'StripeInvalidRequestError') {
//         if (error.code === 'resource_missing') {
//           throw new Error(`Session not found: ${sessionId.substring(0, 20)}...`)
//         }
//         throw new Error(`Invalid session request: ${error.message}`)
//       }

//       throw new Error(`Failed to retrieve session: ${error.message}`)
//     }
//   }

//   async createRefund(paymentIntentId, amount, reason = '') {
//     try {
//       const refund = await this.stripe.refunds.create({
//         payment_intent: paymentIntentId,
//         amount: Math.round(amount * 100), // Convert to cents
//         reason: reason || 'requested_by_customer',
//       })

//       console.log('Refund created:', refund.id)
//       return refund
//     } catch (error) {
//       console.error('Error creating refund:', error)
//       throw new Error(`فشل في إنشاء الاسترداد: ${error.message}`)
//     }
//   }

//   // التحقق من توقيع الويب هوك
//   constructWebhookEvent(payload, sig) {
//     if (!process.env.STRIPE_WEBHOOK_SECRET) {
//       throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
//     }

//     return this.stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET)
//   }

//   // الحصول على العملة المناسبة للدولة
//   getCurrencyForCountry(countryCode) {
//     const currencyMap = {
//       US: 'USD',
//       GB: 'GBP',
//       CA: 'CAD',
//       AU: 'AUD',
//       AE: 'AED',
//       SA: 'SAR',
//       EG: 'EGP',
//       FR: 'EUR',
//       DE: 'EUR',
//     }
//     return currencyMap[countryCode] || 'USD'
//   }
// }

// // إنشاء نسخة من الخدمة مع التحقق من المفتاح
// let paymentServiceInstance

// try {
//   paymentServiceInstance = new PaymentService()
//   console.log('✅ Stripe payment service initialized successfully')
// } catch (error) {
//   console.error('❌ Failed to initialize Stripe payment service:', error.message)
//   // نسخة بديلة لل development
//   paymentServiceInstance = {
//     createCustomer: () => {
//       throw new Error('Stripe not configured')
//     },
//     createCheckoutSession: () => {
//       throw new Error('Stripe not configured')
//     },
//     retrieveCheckoutSession: () => {
//       throw new Error('Stripe not configured')
//     },
//     createRefund: () => {
//       throw new Error('Stripe not configured')
//     },
//     constructWebhookEvent: () => {
//       throw new Error('Stripe not configured')
//     },
//   }
// }

// export default paymentServiceInstance

// services/paymentService.js
import Stripe from 'stripe'
import dotenv from 'dotenv'
dotenv.config()

class PaymentService {
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      timeout: 10000,
      maxNetworkRetries: 2,
    })

    this.supportedCountries = ['US', 'GB', 'CA', 'AU', 'AE', 'SA', 'EG', 'FR', 'DE']
    this.supportedCurrencies = ['usd', 'gbp', 'cad', 'aud', 'eur', 'aed', 'sar', 'egp']
  }

  // Create customer
  async createCustomer(email, name, metadata = {}) {
    try {
      console.log('Creating Stripe customer for:', email)

      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      })

      console.log('Stripe customer created:', customer.id)
      return customer
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
      throw new Error(`Failed to create customer: ${error.message}`)
    }
  }

  // Create payment intent
  async createPaymentIntent({
    amount,
    currency = 'usd',
    customer,
    paymentMethod,
    metadata = {},
    description = '',
    receiptEmail,
    setupFutureUsage,
    captureMethod = 'automatic',
  }) {
    try {
      console.log('Creating payment intent for amount:', amount)

      const params = {
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
        metadata,
        description,
        capture_method: captureMethod,
        confirm: false,
      }

      if (customer) params.customer = customer
      if (paymentMethod) params.payment_method = paymentMethod
      if (receiptEmail) params.receipt_email = receiptEmail
      if (setupFutureUsage) params.setup_future_usage = setupFutureUsage

      const paymentIntent = await this.stripe.paymentIntents.create(params)

      console.log('Payment intent created:', paymentIntent.id)
      return paymentIntent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw new Error(`Failed to create payment intent: ${error.message}`)
    }
  }

  // Create checkout session
  async createCheckoutSession({
    customerId,
    customerEmail,
    lineItems,
    successUrl,
    cancelUrl,
    metadata,
    shippingAddressCollection,
    shippingOptions,
    mode = 'payment',
    allowPromotionCodes = true,
    customerUpdate = {
      address: 'auto',
      shipping: 'auto',
    },
    locale = 'auto',
    submitType = 'pay',
  }) {
    try {
      console.log('Creating checkout session with params:', {
        customerId,
        lineItemsCount: lineItems.length,
        mode,
      })

      const sessionParams = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_update: customerUpdate,
        locale,
        metadata,
        allow_promotion_codes: allowPromotionCodes,
        submit_type: submitType,
      }

      if (customerId) {
        sessionParams.customer = customerId
      } else if (customerEmail) {
        sessionParams.customer_email = customerEmail
      }

      if (shippingAddressCollection) {
        sessionParams.shipping_address_collection = shippingAddressCollection
      } else {
        sessionParams.shipping_address_collection = {
          allowed_countries: this.supportedCountries,
        }
      }

      if (shippingOptions && shippingOptions.length > 0) {
        sessionParams.shipping_options = shippingOptions
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams)

      console.log('✅ Checkout session created:', session.id)
      return session
    } catch (error) {
      console.error('❌ Error creating checkout session:', error)
      throw new Error(`Failed to create checkout session: ${error.message}`)
    }
  }

  // Retrieve checkout session
  async retrieveCheckoutSession(sessionId) {
    try {
      console.log('🔍 Retrieving checkout session:', sessionId)

      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('Session ID is required and must be a string')
      }

      const cleanedSessionId = sessionId.trim()

      if (!cleanedSessionId.startsWith('cs_')) {
        throw new Error(
          `Session ID must start with 'cs_'. Got: ${cleanedSessionId.substring(0, 10)}`
        )
      }

      const session = await this.stripe.checkout.sessions.retrieve(cleanedSessionId, {
        expand: ['line_items', 'customer', 'payment_intent'],
      })

      console.log('✅ Session retrieved successfully:', {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
      })

      return session
    } catch (error) {
      console.error('❌ Stripe API error:', {
        message: error.message,
        type: error.type,
        code: error.code,
      })

      if (error.type === 'StripeInvalidRequestError') {
        if (error.code === 'resource_missing') {
          throw new Error(`Session not found: ${sessionId}`)
        }
        throw new Error(`Invalid session request: ${error.message}`)
      }

      throw new Error(`Failed to retrieve session: ${error.message}`)
    }
  }

  // Create refund
  async createRefund(paymentIntentId, amount, reason = 'requested_by_customer') {
    try {
      console.log('Creating refund for payment intent:', paymentIntentId)

      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100),
        currency: curreny.toLowerCase(),
        reason,
      })

      console.log('Refund created:', refund.id)
      return refund
    } catch (error) {
      console.error('Error creating refund:', error)
      throw new Error(`Failed to create refund: ${error.message}`)
    }
  }

  // Retrieve payment intent
  async retrievePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Error retrieving payment intent:', error)
      throw new Error(`Failed to retrieve payment intent: ${error.message}`)
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      })
      return paymentIntent
    } catch (error) {
      console.error('Error confirming payment intent:', error)
      throw new Error(`Failed to confirm payment intent: ${error.message}`)
    }
  }

  // Capture payment intent
  async capturePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.capture(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Error capturing payment intent:', error)
      throw new Error(`Failed to capture payment intent: ${error.message}`)
    }
  }

  // Cancel payment intent
  async cancelPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Error canceling payment intent:', error)
      throw new Error(`Failed to cancel payment intent: ${error.message}`)
    }
  }

  // Update payment intent
  async updatePaymentIntent(paymentIntentId, updates) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.update(paymentIntentId, updates)
      return paymentIntent
    } catch (error) {
      console.error('Error updating payment intent:', error)
      throw new Error(`Failed to update payment intent: ${error.message}`)
    }
  }

  // List payment methods for customer
  async listCustomerPaymentMethods(customerId, type = 'card') {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type,
      })
      return paymentMethods
    } catch (error) {
      console.error('Error listing payment methods:', error)
      throw new Error(`Failed to list payment methods: ${error.message}`)
    }
  }

  // Attach payment method to customer
  async attachPaymentMethod(paymentMethodId, customerId) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      })
      return paymentMethod
    } catch (error) {
      console.error('Error attaching payment method:', error)
      throw new Error(`Failed to attach payment method: ${error.message}`)
    }
  }

  // Detach payment method from customer
  async detachPaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.detach(paymentMethodId)
      return paymentMethod
    } catch (error) {
      console.error('Error detaching payment method:', error)
      throw new Error(`Failed to detach payment method: ${error.message}`)
    }
  }

  // Create setup intent for saving payment methods
  async createSetupIntent(customerId, usage = 'off_session') {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        usage,
      })
      return setupIntent
    } catch (error) {
      console.error('Error creating setup intent:', error)
      throw new Error(`Failed to create setup intent: ${error.message}`)
    }
  }

  // Construct webhook event
  constructWebhookEvent(payload, sig) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    }

    return this.stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET)
  }

  // Get currency for country
  getCurrencyForCountry(countryCode) {
    const currencyMap = {
      US: 'usd',
      GB: 'gbp',
      CA: 'cad',
      AU: 'aud',
      AE: 'aed',
      SA: 'sar',
      EG: 'egp',
      FR: 'eur',
      DE: 'eur',
    }
    return currencyMap[countryCode] || 'usd'
  }

  // Validate currency
  validateCurrency(currency) {
    return this.supportedCurrencies.includes(currency.toLowerCase())
  }

  // Format amount for display
  formatAmount(amount, currency = 'usd') {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    })
    return formatter.format(amount / 100)
  }
}

// Create service instance with error handling
let paymentServiceInstance

try {
  paymentServiceInstance = new PaymentService()
  console.log('✅ Stripe payment service initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize Stripe payment service:', error.message)
  // Fallback service for development
  paymentServiceInstance = {
    createCustomer: () => Promise.reject(new Error('Stripe not configured')),
    createPaymentIntent: () => Promise.reject(new Error('Stripe not configured')),
    createCheckoutSession: () => Promise.reject(new Error('Stripe not configured')),
    retrieveCheckoutSession: () => Promise.reject(new Error('Stripe not configured')),
    createRefund: () => Promise.reject(new Error('Stripe not configured')),
    constructWebhookEvent: () => Promise.reject(new Error('Stripe not configured')),
  }
}

export default paymentServiceInstance
