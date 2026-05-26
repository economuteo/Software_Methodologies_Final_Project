import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard';
import AddReviewForm from '../components/AddReviewForm';
import SemanticSearch from '../components/SemanticSearch';

const SENTIMENT_COLORS = { positive: 'success', negative: 'danger', neutral: 'secondary' };

function SentimentBar({ reviews }) {
  const total = reviews.length;
  if (total === 0) return null;
  const counts = reviews.reduce(
    (acc, r) => { if (r.sentiment) acc[r.sentiment]++; return acc; },
    { positive: 0, negative: 0, neutral: 0 }
  );
  return (
    <div className="mb-3">
      <div className="d-flex gap-2 mb-1">
        {Object.entries(counts).map(([s, n]) =>
          n > 0 ? (
            <span key={s} className={`badge bg-${SENTIMENT_COLORS[s]}`}>
              {n} {s}
            </span>
          ) : null
        )}
      </div>
      <div className="progress" style={{ height: 8 }}>
        {Object.entries(counts).map(([s, n]) =>
          n > 0 ? (
            <div
              key={s}
              className={`progress-bar bg-${SENTIMENT_COLORS[s]}`}
              style={{ width: `${(n / total) * 100}%` }}
            />
          ) : null
        )}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [{ data: prod }, { data: revs }] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/products/${id}/reviews`),
      ]);
      setProduct(prod);
      setReviews(revs);
    } catch {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleReviewAdded = (review) => setReviews((prev) => [review, ...prev]);
  const handleReviewDeleted = (reviewId) =>
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const { data } = await api.get(`/products/${id}/summary`);
      setSummary(data.summary);
    } catch {
      setSummary('Failed to generate summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('Delete this product and all its reviews?')) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  if (error) return <div className="alert alert-danger mt-4">{error}</div>;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const isOwner = user?.id === product.createdBy;

  return (
    <div>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Products</Link></li>
          <li className="breadcrumb-item active">{product.name}</li>
        </ol>
      </nav>

      <div className="card shadow-sm mb-4">
        <div className="row g-0">
          {product.imageUrl && (
            <div className="col-md-3">
              <img
                src={product.imageUrl}
                className="img-fluid rounded-start"
                alt={product.name}
                style={{ maxHeight: 200, width: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
          <div className={product.imageUrl ? 'col-md-9' : 'col-12'}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="badge bg-secondary mb-2">{product.category}</span>
                  <h3 className="card-title">{product.name}</h3>
                  <p className="text-muted">{product.description}</p>
                  {avgRating && (
                    <div>
                      <span className="text-warning fs-5">
                        {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
                      </span>
                      <span className="ms-2 text-muted">{avgRating} / 5 ({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
                {isOwner && (
                  <div className="d-flex gap-2">
                    <Link className="btn btn-sm btn-outline-secondary" to={`/products/${id}/edit`}>
                      Edit
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleDeleteProduct}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">AI Summary</h5>
            <button
              className="btn btn-sm btn-outline-dark"
              onClick={loadSummary}
              disabled={summaryLoading || reviews.length === 0}
            >
              {summaryLoading ? (
                <><span className="spinner-border spinner-border-sm me-1" />Generating…</>
              ) : 'Generate Summary'}
            </button>
          </div>
          {summary ? (
            <p className="mb-0">{summary}</p>
          ) : (
            <p className="text-muted small mb-0">
              Click "Generate Summary" to get an AI-powered overview of all reviews.
            </p>
          )}
        </div>
      </div>

      {/* Semantic Search */}
      <SemanticSearch productId={id} />

      {/* Reviews */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{reviews.length} Review{reviews.length !== 1 ? 's' : ''}</h5>
      </div>

      <SentimentBar reviews={reviews} />

      {user && <AddReviewForm productId={id} onAdded={handleReviewAdded} />}
      {!user && (
        <div className="alert alert-info mb-4">
          <Link to="/login">Sign in</Link> to leave a review.
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-muted">No reviews yet. Be the first!</p>
      ) : (
        reviews.map((r) => (
          <ReviewCard key={r._id} review={r} onDeleted={handleReviewDeleted} />
        ))
      )}
    </div>
  );
}
