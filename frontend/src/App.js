import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';  // Added import for logout
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Auth from './pages/Auth';

function App() {
  const handleLogout = () => {
    // Clear cookies client-side
    document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Call backend logout for completeness
    axios.post('http://localhost:8888/logout', {}, { withCredentials: true }).catch(console.error);
    window.location.href = '/auth';
  };

  // Safe cookie parsing with optional chaining
  const role = document.cookie.split('; ').find(row => row.startsWith('role='))?.split('=')[1] || 'guest';

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/">E-Shop Pro</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/products">Products</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/cart">Cart</a>
              </li>
              {role !== 'guest' ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link text-warning">{role.toUpperCase()} Mode</span>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link btn btn-link p-0" onClick={handleLogout}>Logout</button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <a className="nav-link" href="/auth">Login/Register</a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;