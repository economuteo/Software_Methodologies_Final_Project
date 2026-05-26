import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          ReviewSense
        </Link>
        <div className="d-flex align-items-center gap-3">
          {user ? (
            <>
              <Link className="btn btn-sm btn-outline-light" to="/products/new">
                + Add Product
              </Link>
              <span className="text-light small">Hi, {user.name}</span>
              <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-sm btn-outline-light" to="/login">Login</Link>
              <Link className="btn btn-sm btn-light" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
