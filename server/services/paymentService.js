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

    this.supportedArabCountries = ['AE', 'SA', 'BH', 'QA', 'KW', 'OM', 'EG', 'JO', 'LB', 'MA', 'TN']
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

  // إنشاء جلسة دفع
  async createCheckoutSession({ customerId, lineItems, successUrl, cancelUrl, metadata }) {
    try {
      console.log('Creating checkout session for customer:', customerId)

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_update: {
          address: 'auto',
          shipping: 'auto',
        },
        shipping_address_collection: {
          allowed_countries: this.supportedArabCountries,
        },
        locale: 'auto',
        currency: this.getCurrencyForCountry(metadata.country),
        metadata,
      })

      console.log('Checkout session created:', session.id)
      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw new Error(`فشل في إنشاء جلسة الدفع: ${error.message}`)
    }
  }

  // الحصول على العملة المناسبة للدولة
  getCurrencyForCountry(countryCode) {
    const currencyMap = {
      EG: 'EGP',
      SA: 'SAR',
      AE: 'AED',
      BH: 'BHD',
      QA: 'QAR',
      KW: 'KWD',
      OM: 'OMR',
      JO: 'JOD',
      LB: 'LBP',
      MA: 'MAD',
      TN: 'TND',
    }
    return currencyMap[countryCode] || 'USD'
  }

  // التحقق من توقيع الويب هوك
  constructWebhookEvent(payload, sig) {
    return this.stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET)
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
    constructWebhookEvent: () => {
      throw new Error('Stripe not configured')
    },
  }
}

export default paymentServiceInstance
