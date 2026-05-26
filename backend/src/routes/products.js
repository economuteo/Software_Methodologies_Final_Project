const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// GET /api/products — list all with avg rating
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();

    const productIds = products.map((p) => p._id);
    const stats = await Review.aggregate([
      { $match: { productId: { $in: productIds } } },
      {
        $group: {
          _id: '$productId',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
          sentiments: { $push: '$sentiment' },
        },
      },
    ]);

    const statsMap = Object.fromEntries(stats.map((s) => [s._id.toString(), s]));
    const result = products.map((p) => {
      const s = statsMap[p._id.toString()] || {};
      return {
        ...p,
        avgRating: s.avgRating ? +s.avgRating.toFixed(1) : null,
        reviewCount: s.reviewCount || 0,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: 'Product not found' });
  }
});

// POST /api/products
router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, description, category, imageUrl } = req.body;
      const product = await Product.create({
        name,
        description,
        category,
        imageUrl: imageUrl || '',
        createdBy: req.user.id,
      });
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// PUT /api/products/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.createdBy.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });

    const { name, description, category, imageUrl } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.createdBy.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });

    await product.deleteOne();
    await Review.deleteMany({ productId: req.params.id });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
