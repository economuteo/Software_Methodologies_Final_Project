import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const CATEGORIES = ['All', 'Electronics', 'Home', 'Books', 'Clothing', 'Sports', 'Other'];

function Stars({ rating }) {
  if (!rating) return <span className="text-muted small">No ratings</span>;
  return (
    <span>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span className="text-muted small ms-1">{rating}</span>
    </span>
  );
}

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => { setProducts(data); setFiltered(data); })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = products;
    if (category !== 'All') result = result.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [category, search, products]);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  if (error) return <div className="alert alert-danger mt-4">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Products</h2>
        <Link className="btn btn-dark" to="/products/new">+ Add Product</Link>
      </div>

      <div className="row g-2 mb-4">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted">No products found.</p>
      ) : (
        <div className="row g-3">
          {filtered.map((p) => (
            <div className="col-md-4" key={p._id}>
              <div className="card h-100 shadow-sm review-card">
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    className="card-img-top"
                    alt={p.name}
                    style={{ height: 180, objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="card-body">
                  <span className="badge bg-secondary mb-2">{p.category}</span>
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text text-muted small">
                    {p.description.length > 100 ? p.description.slice(0, 100) + '…' : p.description}
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <Stars rating={p.avgRating} />
                    <span className="text-muted small">{p.reviewCount} review{p.reviewCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <Link className="btn btn-sm btn-outline-dark w-100" to={`/products/${p._id}`}>
                    View Reviews
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
