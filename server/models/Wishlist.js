// models/Wishlist.js
import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound index to ensure one wishlist per user
wishlistSchema.index({ user: 1 }, { unique: true });

// Index for product lookup
wishlistSchema.index({ 'items.product': 1 });

export default mongoose.model('Wishlist', wishlistSchema);
