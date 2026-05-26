const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeReview(text) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a product review analyzer. Always respond with valid JSON only, no markdown.',
      },
      {
        role: 'user',
        content: `Analyze this product review and return a JSON object with exactly these keys:
- "sentiment": one of "positive", "negative", or "neutral"
- "pros": array of up to 4 short strings (key positives mentioned)
- "cons": array of up to 4 short strings (key negatives mentioned)

Review: "${text}"`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  return JSON.parse(response.choices[0].message.content);
}

async function summarizeReviews(reviews) {
  if (reviews.length === 0) return 'No reviews yet.';

  const lines = reviews
    .map((r, i) => `Review ${i + 1} (${r.rating}/5, ${r.sentiment ?? 'unanalyzed'}): ${r.text}`)
    .join('\n\n');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a product review summarizer. Write a concise, balanced 2-3 sentence summary.',
      },
      {
        role: 'user',
        content: `Summarize the following customer reviews. Mention overall sentiment, recurring themes, and notable strengths or weaknesses:\n\n${lines}`,
      },
    ],
    temperature: 0.4,
  });

  return response.choices[0].message.content.trim();
}

async function generateEmbedding(text) {
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

module.exports = { analyzeReview, summarizeReviews, generateEmbedding, cosineSimilarity };
