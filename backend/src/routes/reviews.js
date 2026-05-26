const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { analyzeReview, summarizeReviews, generateEmbedding, cosineSimilarity } = require('../services/openai');

// GET /api/products/:productId/reviews
router.get('/products/:productId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .select('-embedding')
      .lean();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/products/:productId/reviews — submit review, trigger AI analysis
router.post(
  '/products/:productId/reviews',
  auth,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('text').trim().isLength({ min: 10 }).withMessage('Review must be at least 10 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const product = await Product.findById(req.params.productId);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const { rating, text } = req.body;

      // Run AI analysis and embedding generation in parallel
      const [analysis, embedding] = await Promise.all([
        analyzeReview(text),
        generateEmbedding(text),
      ]);

      const review = await Review.create({
        productId: req.params.productId,
        userId: req.user.id,
        rating,
        text,
        sentiment: analysis.sentiment,
        pros: analysis.pros || [],
        cons: analysis.cons || [],
        embedding,
      });

      const populated = await review.populate('userId', 'name');
      const { embedding: _emb, ...reviewData } = populated.toObject();
      res.status(201).json(reviewData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// PUT /api/reviews/:id
router.put('/reviews/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.userId.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });

    const { rating, text } = req.body;
    if (rating) review.rating = rating;
    if (text) {
      review.text = text;
      const [analysis, embedding] = await Promise.all([
        analyzeReview(text),
        generateEmbedding(text),
      ]);
      review.sentiment = analysis.sentiment;
      review.pros = analysis.pros || [];
      review.cons = analysis.cons || [];
      review.embedding = embedding;
    }

    await review.save();
    const { embedding: _emb, ...reviewData } = review.toObject();
    res.json(reviewData);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/reviews/:id
router.delete('/reviews/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.userId.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });

    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:productId/summary — AI-generated summary of all reviews
router.get('/products/:productId/summary', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .select('rating text sentiment')
      .lean();

    if (reviews.length === 0)
      return res.json({ summary: 'No reviews yet for this product.' });

    const summary = await summarizeReviews(reviews);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/search — semantic search across reviews
router.post('/search', async (req, res) => {
  try {
    const { query, productId } = req.body;
    if (!query || query.trim().length < 3)
      return res.status(400).json({ error: 'Query must be at least 3 characters' });

    const queryEmbedding = await generateEmbedding(query);

    const filter = productId ? { productId, embedding: { $exists: true, $ne: [] } } : { embedding: { $exists: true, $ne: [] } };
    const reviews = await Review.find(filter)
      .populate('userId', 'name')
      .populate('productId', 'name')
      .lean();

    const scored = reviews
      .map((r) => ({
        ...r,
        embedding: undefined,
        score: cosineSimilarity(queryEmbedding, r.embedding),
      }))
      .filter((r) => r.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json(scored);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
