import React, { useState } from 'react';
import api from '../api/client';

export default function AddReviewForm({ productId, onAdded }) {
  const [form, setForm] = useState({ rating: 5, text: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(`/products/${productId}/reviews`, form);
      onAdded(data);
      setForm({ rating: 5, text: '' });
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? msgs[0].msg : err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">Write a Review</h5>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  onClick={() => setForm({ ...form, rating: n })}
                  style={{ color: n <= form.rating ? '#ffc107' : '#ccc', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Your Review</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Share your experience with this product…"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              minLength={10}
              required
            />
          </div>
          <button className="btn btn-dark" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Analyzing…
              </>
            ) : 'Submit Review'}
          </button>
          {loading && (
            <p className="text-muted small mt-2">
              AI is analyzing sentiment and extracting pros/cons…
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
