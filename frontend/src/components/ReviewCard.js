import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const SENTIMENT_COLORS = {
  positive: 'success',
  negative: 'danger',
  neutral: 'secondary',
};

function Stars({ rating }) {
  return (
    <span className="text-warning">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function ReviewCard({ review, onDeleted }) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const isOwner = user?.id === (review.userId?._id || review.userId);

  const handleDelete = async () => {
    if (!window.confirm('Delete this review?')) return;
    setDeleting(true);
    try {
      await api.delete(`/reviews/${review._id}`);
      onDeleted(review._id);
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
      setDeleting(false);
    }
  };

  return (
    <div className="card mb-3 review-card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <strong>{review.userId?.name || 'User'}</strong>
            <span className="ms-2">
              <Stars rating={review.rating} />
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            {review.sentiment && (
              <span className={`badge bg-${SENTIMENT_COLORS[review.sentiment]}`}>
                {review.sentiment}
              </span>
            )}
            <span className="text-muted small">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <p className="mb-2">{review.text}</p>

        {(review.pros?.length > 0 || review.cons?.length > 0) && (
          <div className="row g-2 mt-1">
            {review.pros?.length > 0 && (
              <div className="col-md-6">
                <div className="p-2 rounded" style={{ background: '#f0fdf4' }}>
                  <strong className="text-success small">Pros</strong>
                  <ul className="mb-0 ps-3 mt-1">
                    {review.pros.map((p, i) => (
                      <li key={i} className="small">{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {review.cons?.length > 0 && (
              <div className="col-md-6">
                <div className="p-2 rounded" style={{ background: '#fef2f2' }}>
                  <strong className="text-danger small">Cons</strong>
                  <ul className="mb-0 ps-3 mt-1">
                    {review.cons.map((c, i) => (
                      <li key={i} className="small">{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {isOwner && (
          <div className="mt-2 text-end">
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
