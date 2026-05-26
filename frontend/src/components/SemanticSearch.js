import React, { useState } from 'react';
import api from '../api/client';

const SENTIMENT_COLORS = { positive: 'success', negative: 'danger', neutral: 'secondary' };

export default function SemanticSearch({ productId }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setError('');
    setLoading(true);
    setSearched(false);
    try {
      const { data } = await api.post('/search', { query, productId });
      setResults(data);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title mb-1">Semantic Search</h5>
        <p className="text-muted small mb-3">
          Search reviews by meaning — try "battery life", "easy to use", "poor quality", etc.
        </p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
          <input
            className="form-control"
            placeholder="Describe what you're looking for…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-dark" disabled={loading} style={{ minWidth: 80 }}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'Search'}
          </button>
        </form>

        {searched && results.length === 0 && (
          <p className="text-muted small">No matching reviews found.</p>
        )}

        {results.map((r) => (
          <div key={r._id} className="border rounded p-3 mb-2">
            <div className="d-flex justify-content-between mb-1">
              <div>
                <strong>{r.userId?.name || 'User'}</strong>
                {r.productId?.name && (
                  <span className="text-muted small ms-2">on {r.productId.name}</span>
                )}
              </div>
              <div className="d-flex gap-2 align-items-center">
                {r.sentiment && (
                  <span className={`badge bg-${SENTIMENT_COLORS[r.sentiment]}`}>
                    {r.sentiment}
                  </span>
                )}
                <span className="search-result-score">
                  {(r.score * 100).toFixed(0)}% match
                </span>
              </div>
            </div>
            <p className="mb-0 small">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
