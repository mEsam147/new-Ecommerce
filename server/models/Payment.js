// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'paypal', 'stripe']
  },
  paymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'usd'
  },
  status: {
    type: String,
    enum: [
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
      'processing',
      'requires_capture',
      'canceled',
      'succeeded',
      'failed'
    ],
    required: true
  },
  captureMethod: {
    type: String,
    enum: ['automatic', 'manual'],
    default: 'automatic'
  },
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    type: Map,
    of: String
  },
  error: {
    code: String,
    message: String,
    decline_code: String
  },
  receiptUrl: String,
  billingDetails: {
    name: String,
    email: String,
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: String
    }
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ paymentIntentId: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ status: 1 });

// Method to process refund
paymentSchema.methods.processRefund = async function(amount, reason = '') {
  if (this.status !== 'succeeded') {
    throw new Error('Cannot refund payment that is not succeeded');
  }

  if (amount > this.amount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }

  // Calculate total already refunded
  const totalRefunded = this.refunds.reduce((total, refund) => total + refund.amount, 0);

  if (amount > (this.amount - totalRefunded)) {
    throw new Error('Refund amount exceeds available amount');
  }

  // In a real implementation, this would call Stripe API
  const refund = {
    refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    reason,
    status: 'pending',
    createdAt: new Date()
  };

  this.refunds.push(refund);
  await this.save();

  // Simulate refund processing
  setTimeout(() => {
    refund.status = 'succeeded';
    this.save();
  }, 2000);

  return refund;
};

export default mongoose.model('Payment', paymentSchema);
