const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true, trim: true },
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], default: null },
  pros: [{ type: String }],
  cons: [{ type: String }],
  embedding: { type: [Number], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
