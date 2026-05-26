require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Review = require('./models/Review');
const { analyzeReview, generateEmbedding } = require('./services/openai');

const users = [
  { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123' },
  { name: 'Bob Smith',     email: 'bob@example.com',   password: 'password123' },
  { name: 'Carol White',   email: 'carol@example.com', password: 'password123' },
];

const products = [
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise cancelling wireless headphones with 30-hour battery life.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
  },
  {
    name: 'Kindle Paperwhite',
    description: 'Waterproof e-reader with a glare-free display and weeks of battery life.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Multi-use pressure cooker, slow cooker, rice cooker, steamer and more.',
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',
  },
  {
    name: 'Nike Air Zoom Pegasus 40',
    description: 'Versatile running shoe with responsive cushioning for daily training.',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  },
];

// Reviews written to produce varied AI sentiments when analyzed
const reviewsData = [
  // Sony — positive
  { productIndex: 0, userIndex: 0, rating: 5, text: 'Absolutely incredible noise cancellation. I wore these on a 10-hour flight and it felt like sitting in a quiet library. The sound quality is rich and detailed, battery lasted the entire trip, and they are very comfortable for long periods.' },
  // Sony — neutral
  { productIndex: 0, userIndex: 1, rating: 3, text: 'The sound and noise cancellation are good, but the carrying case feels cheap and the headband started creaking after a month. The companion app also crashes frequently on Android. Mixed feelings overall.' },
  // Sony — negative
  { productIndex: 0, userIndex: 2, rating: 1, text: 'Terrible experience. These broke after just two months of normal use. The right ear cup stopped working and customer support refused to help. Extremely disappointed for the price paid. Would not recommend.' },

  // Kindle — positive
  { productIndex: 1, userIndex: 1, rating: 5, text: 'The best e-reader I have ever owned. The warm light is a game changer for reading at night with zero eye strain. Waterproof design means I can read by the pool. Battery lasts weeks on a single charge.' },
  // Kindle — neutral
  { productIndex: 1, userIndex: 2, rating: 3, text: 'Display is sharp and glare-free which is great. However I wish it had more storage since 8GB fills up fast with audiobooks. Also requires an Amazon account which feels restrictive. Decent but not perfect.' },
  // Kindle — negative
  { productIndex: 1, userIndex: 0, rating: 2, text: 'Screen developed a dead pixel after two weeks of light use. Customer support was completely unhelpful and refused a replacement. For a premium priced product this is unacceptable quality control.' },

  // Instant Pot — positive
  { productIndex: 2, userIndex: 0, rating: 5, text: 'This completely changed how I cook. A whole chicken in 25 minutes, perfect rice every time, and amazing yogurt overnight. The build quality is solid, it is easy to clean, and it replaced four appliances in my kitchen.' },
  // Instant Pot — neutral
  { productIndex: 2, userIndex: 1, rating: 3, text: 'Works well for soups and beans but the learning curve is steeper than expected. The manual is confusing and it takes a long time to reach pressure which cancels out some of the time savings. Decent once you figure it out.' },

  // Nike — positive
  { productIndex: 3, userIndex: 2, rating: 5, text: 'Running in these for 3 months and they are exceptional. Cushioning is responsive without feeling mushy, handles both short sprints and long runs equally well. True to size, breathable, and my feet never hurt.' },
  // Nike — negative
  { productIndex: 3, userIndex: 0, rating: 1, text: 'These fell apart after only 6 weeks of regular use. The sole started separating from the upper and the cushioning completely flattened. For this price I expected them to last at least a year. Absolute waste of money.' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([User.deleteMany(), Product.deleteMany(), Review.deleteMany()]);
  console.log('Cleared existing data');

  const createdUsers = await Promise.all(
    users.map(async (u) => {
      const passwordHash = await bcrypt.hash(u.password, 10);
      return User.create({ name: u.name, email: u.email, passwordHash });
    })
  );
  console.log(`Created ${createdUsers.length} users`);

  const createdProducts = await Promise.all(
    products.map((p) => Product.create({ ...p, createdBy: createdUsers[0]._id }))
  );
  console.log(`Created ${createdProducts.length} products`);

  console.log('Analyzing reviews with AI (this takes a moment)...');
  for (let i = 0; i < reviewsData.length; i++) {
    const r = reviewsData[i];
    const [analysis, embedding] = await Promise.all([
      analyzeReview(r.text),
      generateEmbedding(r.text),
    ]);
    await Review.create({
      productId: createdProducts[r.productIndex]._id,
      userId: createdUsers[r.userIndex]._id,
      rating: r.rating,
      text: r.text,
      sentiment: analysis.sentiment,
      pros: analysis.pros || [],
      cons: analysis.cons || [],
      embedding,
    });
    console.log(`  Review ${i + 1}/${reviewsData.length} — ${analysis.sentiment}`);
  }
  console.log(`Created ${reviewsData.length} reviews`);

  console.log('\nSeed complete!');
  console.log('Test accounts: alice@example.com / bob@example.com / carol@example.com');
  console.log('Password for all: password123');
  mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  mongoose.disconnect();
  process.exit(1);
});
