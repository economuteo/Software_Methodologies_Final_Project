const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';

const DARK   = '1a1a2e';
const ACCENT = '4f8ef7';
const WHITE  = 'ffffff';
const LIGHT  = 'e8f0fe';
const GRAY   = '6b7280';
const GREEN  = '22c55e';
const RED    = 'ef4444';
const YELLOW = 'f59e0b';

function slide(title, fn) {
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: ACCENT } });
  if (title) {
    s.addText(title, { x: 0.5, y: 0.18, w: '90%', h: 0.6, fontSize: 24, bold: true, color: DARK, fontFace: 'Calibri' });
    s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.82, w: 1.2, h: 0.04, fill: { color: ACCENT } });
  }
  fn(s);
}

function bullets(s, items, x = 0.5, y = 1.1, w = '90%', fontSize = 15) {
  s.addText(
    items.map((t, i) => ({ text: t, options: { bullet: { indent: 15 }, fontSize, color: DARK, fontFace: 'Calibri', paraSpaceAfter: i < items.length - 1 ? 10 : 0, breakLine: true } })),
    { x, y, w, h: items.length * 0.48 + 0.1, valign: 'top' }
  );
}

function card(s, x, y, w, h, title, body) {
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: LIGHT }, line: { color: ACCENT, width: 1 }, rectRadius: 0.1 });
  s.addText(title, { x: x + 0.15, y: y + 0.1,  w: w - 0.3, h: 0.35, fontSize: 13, bold: true, color: ACCENT, fontFace: 'Calibri' });
  s.addText(body,  { x: x + 0.15, y: y + 0.48, w: w - 0.3, h: h - 0.6, fontSize: 12, color: DARK, fontFace: 'Calibri', valign: 'top' });
}

// ── Slide 1: Title ────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: DARK };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0,     w: '100%', h: 0.08, fill: { color: ACCENT } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 6.92,  w: '100%', h: 0.08, fill: { color: ACCENT } });

  s.addText('ReviewSense', {
    x: '5%', y: 1.4, w: '90%', h: 1.2,
    fontSize: 56, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center',
  });
  s.addText('AI-Powered Product Review Analyzer', {
    x: '5%', y: 2.7, w: '90%', h: 0.6,
    fontSize: 22, color: ACCENT, fontFace: 'Calibri', align: 'center',
  });
  s.addShape(pptx.ShapeType.rect, { x: 3.5, y: 3.45, w: 6.3, h: 0.03, fill: { color: ACCENT } });
  s.addText('Full-Stack Web Application  ·  Node.js  ·  React  ·  MongoDB  ·  OpenAI', {
    x: '5%', y: 3.6, w: '90%', h: 0.4,
    fontSize: 13, color: GRAY, fontFace: 'Calibri', align: 'center',
  });
  s.addText('Economu Teo-Antonio  ·  Roman Bogdan', {
    x: '5%', y: 5.6, w: '90%', h: 0.45,
    fontSize: 15, color: WHITE, fontFace: 'Calibri', align: 'center', bold: true,
  });
}

// ── Slide 2: Project Goal ─────────────────────────────────────────────────────
slide('Project Goal', (s) => {
  s.addText(
    'Build a platform where users can submit product reviews and instantly receive AI-powered insights — sentiment, pros & cons, summaries, and semantic search.',
    { x: 0.5, y: 1.0, w: '90%', h: 0.8, fontSize: 16, color: DARK, fontFace: 'Calibri', italic: true }
  );

  const goals = [
    'Understand customer sentiment at a glance',
    'Automatically extract pros and cons from free text',
    'Summarize hundreds of reviews into a few sentences',
    'Find relevant reviews by meaning, not just keywords',
  ];
  goals.forEach((text, i) => {
    s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.95 + i * 0.7, w: 0.06, h: 0.4, fill: { color: GREEN } });
    s.addText(text, { x: 0.72, y: 1.95 + i * 0.7, w: '85%', h: 0.4, fontSize: 16, color: DARK, fontFace: 'Calibri', valign: 'middle' });
  });

  s.addText('Target users: shoppers, product managers, e-commerce platforms', {
    x: 0.5, y: 5.1, w: '90%', h: 0.35, fontSize: 13, color: GRAY, fontFace: 'Calibri', italic: true,
  });
});

// ── Slide 3: Architecture ─────────────────────────────────────────────────────
slide('Architecture', (s) => {
  const layers = [
    { label: 'Frontend',  sub: 'React · Bootstrap 5 · Axios', color: '3b82f6', x: 0.4  },
    { label: 'Backend',   sub: 'Node.js · Express · JWT',     color: '8b5cf6', x: 4.05 },
    { label: 'Database',  sub: 'MongoDB Atlas · Mongoose',    color: '10b981', x: 7.7  },
  ];
  layers.forEach(({ label, sub, color, x }) => {
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.1, w: 3.3, h: 1.5, fill: { color }, rectRadius: 0.12 });
    s.addText(label, { x, y: 1.25, w: 3.3, h: 0.5, fontSize: 20, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center' });
    s.addText(sub,   { x, y: 1.8,  w: 3.3, h: 0.6, fontSize: 13, color: WHITE, fontFace: 'Calibri', align: 'center' });
  });
  [3.75, 7.4].forEach((ax) => {
    s.addShape(pptx.ShapeType.rightArrow, { x: ax, y: 1.6, w: 0.25, h: 0.5, fill: { color: ACCENT } });
  });

  s.addShape(pptx.ShapeType.roundRect, { x: 3.85, y: 3.1, w: 3.6, h: 1.3, fill: { color: YELLOW }, rectRadius: 0.12 });
  s.addText('OpenAI API', { x: 3.85, y: 3.2, w: 3.6, h: 0.4, fontSize: 18, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center' });
  s.addText('GPT-4o-mini · text-embedding-3-small', { x: 3.85, y: 3.6, w: 3.6, h: 0.55, fontSize: 12, color: WHITE, fontFace: 'Calibri', align: 'center' });
  s.addShape(pptx.ShapeType.downArrow, { x: 5.45, y: 2.62, w: 0.4, h: 0.48, fill: { color: YELLOW } });

  s.addText('REST API  ·  /api/auth  ·  /api/products  ·  /api/reviews  ·  /api/search', {
    x: 0.5, y: 4.7, w: '90%', h: 0.35, fontSize: 12, color: GRAY, fontFace: 'Calibri', align: 'center',
  });
});

// ── Slide 4: Main Features ────────────────────────────────────────────────────
slide('Main Features', (s) => {
  [
    { title: 'Authentication',        body: 'Register & login with JWT.\nSessions stored client-side.',              x: 0.4, y: 1.1 },
    { title: 'Product Management',    body: 'Add, edit, delete products.\nCategory filter & text search.',           x: 4.1, y: 1.1 },
    { title: 'Review Submission',     body: 'Star rating + free text.\nInstant AI analysis on submit.',              x: 7.8, y: 1.1 },
    { title: 'Sentiment & Pros/Cons', body: 'Each review tagged positive /\nnegative / neutral with bullet points.', x: 0.4, y: 3.1 },
    { title: 'AI Product Summary',    body: 'On-demand GPT summary of\nall reviews for a product.',                  x: 4.1, y: 3.1 },
    { title: 'Semantic Search',       body: 'Find reviews by meaning.\nEmbedding similarity score shown.',           x: 7.8, y: 3.1 },
  ].forEach(({ title, body, x, y }) => card(s, x, y, 3.5, 1.75, title, body));
});

// ── Slide 5: AI Feature 1 ─────────────────────────────────────────────────────
slide('AI Feature 1 — Review Analysis', (s) => {
  s.addText('When a review is submitted, GPT-4o-mini reads the full text and returns structured data:', {
    x: 0.5, y: 1.0, w: '90%', h: 0.4, fontSize: 15, color: DARK, fontFace: 'Calibri',
  });

  s.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 1.5, w: 5.6, h: 2.5, fill: { color: '1e1e2e' }, rectRadius: 0.1 });
  s.addText(
`{
  "sentiment": "negative",
  "pros": [
    "Good initial comfort"
  ],
  "cons": [
    "Sole separated after 6 weeks",
    "Cushioning flattened quickly"
  ]
}`,
    { x: 0.7, y: 1.6, w: 5.2, h: 2.3, fontSize: 12, color: '7dd3fc', fontFace: 'Courier New', valign: 'top' }
  );

  const steps = [
    'User submits review text',
    'Backend sends text to GPT-4o-mini',
    'Response parsed from JSON',
    'Saved to MongoDB with the review',
    'Shown instantly on the review card',
  ];
  steps.forEach((text, i) => {
    const y = 1.5 + i * 0.52;
    s.addShape(pptx.ShapeType.ellipse, { x: 6.5, y, w: 0.34, h: 0.34, fill: { color: ACCENT } });
    s.addText(String(i + 1), { x: 6.5, y, w: 0.34, h: 0.34, fontSize: 11, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' });
    s.addText(text, { x: 6.95, y: y + 0.02, w: 4.2, h: 0.34, fontSize: 13, color: DARK, fontFace: 'Calibri', valign: 'middle' });
  });
});

// ── Slide 6: AI Feature 2 ─────────────────────────────────────────────────────
slide('AI Feature 2 — Product Summary', (s) => {
  s.addText('On demand, GPT-4o-mini reads all reviews for a product and generates a balanced overview:', {
    x: 0.5, y: 1.0, w: '90%', h: 0.4, fontSize: 15, color: DARK, fontFace: 'Calibri',
  });

  s.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 1.55, w: 10.3, h: 1.5, fill: { color: LIGHT }, line: { color: ACCENT, width: 1 }, rectRadius: 0.1 });
  s.addText('AI Summary', { x: 0.7, y: 1.65, w: 4, h: 0.35, fontSize: 13, bold: true, color: ACCENT, fontFace: 'Calibri' });
  s.addText(
    '"Customer feedback on the Sony WH-1000XM5 is mixed. While many praise the exceptional noise cancellation and sound quality, several users report durability issues and a buggy companion app. Overall sentiment leans positive but long-term reliability is a recurring concern."',
    { x: 0.7, y: 2.0, w: 9.9, h: 0.9, fontSize: 13, color: DARK, fontFace: 'Calibri', italic: true }
  );

  bullets(s, [
    'All reviews for the product are fetched from MongoDB',
    'Formatted with their rating and sentiment, then sent to GPT-4o-mini',
    'Model returns a 2–3 sentence balanced summary',
    'Result shown when the user clicks "Generate Summary" on the product page',
  ], 0.5, 3.3);
});

// ── Slide 7: Embeddings & Semantic Search ─────────────────────────────────────
slide('Embeddings & Semantic Search', (s) => {
  const rows = [
    ['On review submit',  'text-embedding-3-small converts the review text into a vector of 1536 numbers stored in MongoDB.'],
    ['On search query',   'The same model converts the search query into a vector.'],
    ['Comparison',        'Cosine similarity is computed between the query vector and every stored review vector.'],
    ['Results',           'Reviews with similarity > 0.30 are returned, ranked by score.'],
  ];
  rows.forEach(([title, body], i) => {
    const y = 1.1 + i * 0.98;
    s.addShape(pptx.ShapeType.roundRect, { x: 0.5, y, w: 10.3, h: 0.8, fill: { color: LIGHT }, line: { color: ACCENT, width: 1 }, rectRadius: 0.08 });
    s.addText(title, { x: 0.7,  y: y + 0.12, w: 2.2, h: 0.55, fontSize: 13, bold: true, color: ACCENT, fontFace: 'Calibri', valign: 'middle' });
    s.addText(body,  { x: 3.1,  y: y + 0.12, w: 7.5, h: 0.55, fontSize: 13, color: DARK,  fontFace: 'Calibri', valign: 'middle' });
  });

  s.addText('Key insight: finds reviews that mean the same thing even without matching words.', {
    x: 0.5, y: 5.2, w: '90%', h: 0.35, fontSize: 14, color: ACCENT, fontFace: 'Calibri', bold: true,
  });
});

// ── Slide 8: AI Pipeline ──────────────────────────────────────────────────────
slide('AI Pipeline', (s) => {
  s.addText('Review submission flow:', { x: 0.4, y: 1.0, w: 5, h: 0.35, fontSize: 15, bold: true, color: DARK, fontFace: 'Calibri' });
  const top = [
    { label: 'User submits\nreview',   color: '3b82f6', x: 0.3  },
    { label: 'GPT-4o-mini\nanalysis',  color: '8b5cf6', x: 2.55 },
    { label: 'Embedding\ngeneration',  color: YELLOW,   x: 4.8  },
    { label: 'Save to\nMongoDB',       color: '10b981', x: 7.05 },
    { label: 'Display\non UI',         color: '3b82f6', x: 9.3  },
  ];
  top.forEach(({ label, color, x }) => {
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.45, w: 2.0, h: 1.1, fill: { color }, rectRadius: 0.12 });
    s.addText(label, { x, y: 1.45, w: 2.0, h: 1.1, fontSize: 12, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' });
  });
  for (let i = 0; i < top.length - 1; i++) {
    s.addShape(pptx.ShapeType.rightArrow, { x: top[i].x + 2.03, y: 1.82, w: 0.3, h: 0.38, fill: { color: GRAY } });
  }

  s.addText('Semantic search flow:', { x: 0.4, y: 2.85, w: 5, h: 0.35, fontSize: 15, bold: true, color: DARK, fontFace: 'Calibri' });
  const bot = [
    { label: 'User types\nquery',              color: '3b82f6', x: 0.4  },
    { label: 'Embed\nquery',                   color: YELLOW,   x: 2.9  },
    { label: 'Cosine similarity\nvs all reviews', color: '8b5cf6', x: 5.4 },
    { label: 'Ranked\nresults',                color: '10b981', x: 8.2  },
  ];
  bot.forEach(({ label, color, x }) => {
    s.addShape(pptx.ShapeType.roundRect, { x, y: 3.3, w: 2.3, h: 1.1, fill: { color }, rectRadius: 0.12 });
    s.addText(label, { x, y: 3.3, w: 2.3, h: 1.1, fontSize: 12, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' });
  });
  for (let i = 0; i < bot.length - 1; i++) {
    s.addShape(pptx.ShapeType.rightArrow, { x: bot[i].x + 2.33, y: 3.68, w: 0.3, h: 0.38, fill: { color: GRAY } });
  }
});

// ── Slide 9: Technologies Used ────────────────────────────────────────────────
slide('Technologies Used', (s) => {
  [
    { layer: 'Frontend',  tech: 'React (CRA), Bootstrap 5, Axios, React Router',                              color: '3b82f6' },
    { layer: 'Backend',   tech: 'Node.js, Express, JWT (jsonwebtoken), bcryptjs, express-validator',          color: '8b5cf6' },
    { layer: 'Database',  tech: 'MongoDB Atlas, Mongoose ODM',                                                color: '10b981' },
    { layer: 'AI',        tech: 'OpenAI GPT-4o-mini (generation), text-embedding-3-small (vector search)',    color: YELLOW   },
  ].forEach(({ layer, tech, color }, i) => {
    const y = 1.1 + i * 1.1;
    s.addShape(pptx.ShapeType.roundRect, { x: 0.5, y, w: 10.3, h: 0.85, fill: { color: LIGHT }, line: { color, width: 2 }, rectRadius: 0.1 });
    s.addShape(pptx.ShapeType.rect, { x: 0.5, y, w: 0.12, h: 0.85, fill: { color } });
    s.addText(layer, { x: 0.8,  y: y + 0.08, w: 1.8, h: 0.65, fontSize: 15, bold: true, color,  fontFace: 'Calibri', valign: 'middle' });
    s.addText(tech,  { x: 2.75, y: y + 0.08, w: 7.9, h: 0.65, fontSize: 14, color: DARK, fontFace: 'Calibri', valign: 'middle' });
  });
});

// ── Slide 10: Limitations & Future Work ──────────────────────────────────────
slide('Limitations & Future Improvements', (s) => {
  s.addText('Current Limitations', { x: 0.5, y: 1.0, w: 5, h: 0.4, fontSize: 17, bold: true, color: RED, fontFace: 'Calibri' });
  bullets(s, [
    'Similarity computed in-app — does not scale to very large datasets',
    'No pagination on product or review lists',
    'Users cannot edit a review after submission',
    'No image upload — only URL references',
  ], 0.5, 1.45, 5.2, 14);

  s.addShape(pptx.ShapeType.rect, { x: 5.65, y: 1.0, w: 0.03, h: 4.2, fill: { color: ACCENT } });

  s.addText('Future Improvements', { x: 5.8, y: 1.0, w: 5.2, h: 0.4, fontSize: 17, bold: true, color: GREEN, fontFace: 'Calibri' });
  bullets(s, [
    'MongoDB Atlas Vector Search for scalable queries',
    'Review helpfulness voting & ranking',
    'Email verification on registration',
    'AI-generated response by product owners',
    'Keyword tag cloud visualization',
  ], 5.8, 1.45, 5.2, 14);
});

// ── Write file ────────────────────────────────────────────────────────────────
pptx.writeFile({ fileName: 'ReviewSense-Presentation.pptx' })
  .then(() => console.log('Done: ReviewSense-Presentation.pptx'))
  .catch(console.error);
