import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const CATEGORIES = ['Electronics', 'Home', 'Books', 'Clothing', 'Sports', 'Other'];

export default function AddProduct() {
  const [form, setForm] = useState({ name: '', description: '', category: 'Electronics', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/products', form);
      navigate(`/products/${data._id}`);
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? msgs[0].msg : err.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3 className="mb-4">Add Product</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Product Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Image URL <span className="text-muted">(optional)</span></label>
                <input
                  className="form-control"
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>
              <button className="btn btn-dark w-100" disabled={loading}>
                {loading ? 'Creating…' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
