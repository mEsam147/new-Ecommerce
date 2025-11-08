// services/paymentService.js
import Stripe from 'stripe'
import dotenv from 'dotenv'
dotenv.config()

class PaymentService {
  constructor() {
    // التحقق من وجود مفتاح Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('مفتاح Stripe السري غير مضبوط في متغيرات البيئة')
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })

    this.supportedCountries = ['US', 'GB', 'CA', 'AU', 'AE', 'SA', 'EG', 'FR', 'DE'] // Added more countries
  }

  // إنشاء عميل في Stripe
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
      throw new Error(`فشل في إنشاء العميل: ${error.message}`)
    }
  }

  // إنشاء جلسة دفع - FIXED VERSION
  async createCheckoutSession({
    customerId,
    lineItems,
    successUrl,
    cancelUrl,
    metadata,
    shippingAddressCollection,
    shippingOptions,
    customerEmail,
    mode = 'payment',
    allowPromotionCodes = true,
  }) {
    try {
      console.log('Creating checkout session with params:', {
        customerId,
        customerEmail,
        lineItemsCount: lineItems.length,
        metadata,
      })

      const sessionParams = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_update: {
          address: 'auto',
          shipping: 'auto',
        },
        locale: 'auto',
        metadata,
        allow_promotion_codes: allowPromotionCodes,
      }

      // Use customer ID if available, otherwise use customer email (BUT NOT BOTH)
      if (customerId) {
        sessionParams.customer = customerId
        console.log('Using existing customer:', customerId)
      } else if (customerEmail) {
        sessionParams.customer_email = customerEmail
        console.log('Using customer email:', customerEmail)
      }

      // Add optional parameters if provided
      if (shippingAddressCollection) {
        sessionParams.shipping_address_collection = shippingAddressCollection
      } else {
        // Default shipping address collection
        sessionParams.shipping_address_collection = {
          allowed_countries: this.supportedCountries,
        }
      }

      if (shippingOptions && shippingOptions.length > 0) {
        sessionParams.shipping_options = shippingOptions
      }

      console.log('Final session params:', JSON.stringify(sessionParams, null, 2))

      const session = await this.stripe.checkout.sessions.create(sessionParams)

      console.log('✅ Checkout session created:', session.id)
      console.log('🔗 Checkout URL:', session.url)
      return session
    } catch (error) {
      console.error('❌ Error creating checkout session:', error)
      throw new Error(`فشل في إنشاء جلسة الدفع: ${error.message}`)
    }
  }

  // services/paymentService.js - FIXED retrieveCheckoutSession method
  async retrieveCheckoutSession(sessionId) {
    try {
      console.log('🔍 Retrieving checkout session:', sessionId)
      console.log('📏 Session ID length:', sessionId?.length)

      // Enhanced validation
      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('Session ID is required and must be a string')
      }

      const cleanedSessionId = sessionId.trim()

      if (cleanedSessionId.length < 10) {
        throw new Error(`Session ID is too short: ${cleanedSessionId.length} characters`)
      }

      if (!cleanedSessionId.startsWith('cs_')) {
        throw new Error(
          `Session ID must start with 'cs_'. Got: ${cleanedSessionId.substring(0, 10)}`
        )
      }

      console.log('🎯 Cleaned session ID for Stripe API:', cleanedSessionId)

      // Retrieve the session with minimal expansion to avoid API issues
      const session = await this.stripe.checkout.sessions.retrieve(cleanedSessionId, {
        expand: ['line_items', 'customer', 'payment_intent'],
      })

      console.log('✅ Session retrieved successfully:', {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        customer: session.customer,
        amountTotal: session.amount_total,
      })

      return session
    } catch (error) {
      console.error('❌ Stripe API error details:', {
        message: error.message,
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
      })

      // Handle specific Stripe errors
      if (error.type === 'StripeInvalidRequestError') {
        if (error.code === 'resource_missing') {
          throw new Error(`Session not found: ${sessionId.substring(0, 20)}...`)
        }
        throw new Error(`Invalid session request: ${error.message}`)
      }

      throw new Error(`Failed to retrieve session: ${error.message}`)
    }
  }

  async createRefund(paymentIntentId, amount, reason = '') {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
        reason: reason || 'requested_by_customer',
      })

      console.log('Refund created:', refund.id)
      return refund
    } catch (error) {
      console.error('Error creating refund:', error)
      throw new Error(`فشل في إنشاء الاسترداد: ${error.message}`)
    }
  }

  // التحقق من توقيع الويب هوك
  constructWebhookEvent(payload, sig) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    }

    return this.stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET)
  }

  // الحصول على العملة المناسبة للدولة
  getCurrencyForCountry(countryCode) {
    const currencyMap = {
      US: 'USD',
      GB: 'GBP',
      CA: 'CAD',
      AU: 'AUD',
      AE: 'AED',
      SA: 'SAR',
      EG: 'EGP',
      FR: 'EUR',
      DE: 'EUR',
    }
    return currencyMap[countryCode] || 'USD'
  }
}

// إنشاء نسخة من الخدمة مع التحقق من المفتاح
let paymentServiceInstance

try {
  paymentServiceInstance = new PaymentService()
  console.log('✅ Stripe payment service initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize Stripe payment service:', error.message)
  // نسخة بديلة لل development
  paymentServiceInstance = {
    createCustomer: () => {
      throw new Error('Stripe not configured')
    },
    createCheckoutSession: () => {
      throw new Error('Stripe not configured')
    },
    retrieveCheckoutSession: () => {
      throw new Error('Stripe not configured')
    },
    createRefund: () => {
      throw new Error('Stripe not configured')
    },
    constructWebhookEvent: () => {
      throw new Error('Stripe not configured')
    },
  }
}

export default paymentServiceInstance
