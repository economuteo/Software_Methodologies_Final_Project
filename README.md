# ReviewSense — AI-Powered Product Review Analyzer

A full-stack web application that lets users submit product reviews and automatically analyzes them using AI: detecting sentiment, extracting pros and cons, generating product summaries, and enabling semantic search across all reviews.

---

## Project Description

ReviewSense allows anyone to browse products and read community reviews. Authenticated users can add new products, write reviews, and instantly receive AI-powered analysis. Each review is automatically tagged with a sentiment label (positive/negative/neutral) and broken down into pros and cons by GPT-4o-mini. Product pages offer a one-click AI summary of all reviews and a semantic search bar that finds relevant reviews based on meaning, not just keywords.

---

## Technologies Used

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Node.js, Express                    |
| Database   | MongoDB (Mongoose)                  |
| Frontend   | React (Create React App), Bootstrap 5 |
| AI         | OpenAI GPT-4o-mini (generation), text-embedding-3-small (embeddings) |
| Auth       | JWT (jsonwebtoken), bcryptjs        |
| HTTP       | Axios                               |

---

## Setup Instructions

### Prerequisites
- Node.js >= 18
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI
- An OpenAI API key

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI, JWT_SECRET, OPENAI_API_KEY
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend proxies `/api` requests to `http://localhost:5000`, so no extra config needed.

---

## API Description

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Products
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | — | List all products with avg rating |
| GET | `/api/products/:id` | — | Get one product |
| POST | `/api/products` | ✓ | Create product |
| PUT | `/api/products/:id` | ✓ (owner) | Update product |
| DELETE | `/api/products/:id` | ✓ (owner) | Delete product + its reviews |

### Reviews
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products/:productId/reviews` | — | List reviews for a product |
| POST | `/api/products/:productId/reviews` | ✓ | Submit review (triggers AI analysis) |
| PUT | `/api/reviews/:id` | ✓ (owner) | Update review (re-runs AI) |
| DELETE | `/api/reviews/:id` | ✓ (owner) | Delete review |
| GET | `/api/products/:productId/summary` | — | Get AI-generated review summary |
| POST | `/api/search` | — | Semantic search across reviews |

---

## Database Structure

### `users`
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "passwordHash": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `products`
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "category": "string",
  "imageUrl": "string",
  "createdBy": "ObjectId (ref: User)",
  "createdAt": "Date"
}
```

### `reviews`
```json
{
  "_id": "ObjectId",
  "productId": "ObjectId (ref: Product)",
  "userId": "ObjectId (ref: User)",
  "rating": "number (1-5)",
  "text": "string",
  "sentiment": "positive | negative | neutral",
  "pros": ["string"],
  "cons": ["string"],
  "embedding": "[number] (1536-dim vector)",
  "createdAt": "Date"
}
```

---

## AI Features Explanation

### Feature 1 — Review Analysis (Generation)
When a user submits a review, the backend calls **GPT-4o-mini** with the review text and asks it to return a structured JSON object containing:
- `sentiment`: one of `positive`, `negative`, `neutral`
- `pros`: up to 4 key positives mentioned
- `cons`: up to 4 key negatives mentioned

This happens synchronously before the review is saved, so the UI immediately shows the analysis. The `response_format: json_object` option ensures a parseable response every time.

### Feature 2 — Product Summary (Generation)
On demand, the backend fetches all reviews for a product, formats them with their ratings and sentiments, then sends them to **GPT-4o-mini** asking for a 2-3 sentence balanced summary highlighting overall sentiment, recurring themes, and notable strengths/weaknesses.

---

## Embeddings / Semantic Search

When a review is submitted, the backend also calls **text-embedding-3-small** to generate a 1536-dimensional vector embedding of the review text. This embedding is stored in the `reviews` collection alongside the review data.

At search time:
1. The user's query is embedded using the same `text-embedding-3-small` model.
2. The query vector is compared against every stored review embedding using **cosine similarity**.
3. Results with similarity > 0.30 are returned, ranked by score.

This enables meaning-based search: querying "durability issues" will surface reviews mentioning "broke after a month" or "feels cheap" even without exact word matches.

---

## Limitations and Future Improvements

### Current Limitations
- Embeddings are compared in-application (O(n) scan). For large datasets, a vector database (Pinecone, Weaviate, MongoDB Atlas Vector Search) would be needed.
- No pagination on reviews or product list.
- Users cannot edit reviews (only delete and re-submit).
- No image upload — only URL references.

### Future Improvements
- Add MongoDB Atlas Vector Search index to enable server-side ANN queries.
- Add review voting / helpfulness ranking.
- Add email verification for registration.
- Implement review response by product owners.
- Add keyword extraction and tag cloud visualization.
- Cache AI summaries and invalidate when new reviews arrive.
