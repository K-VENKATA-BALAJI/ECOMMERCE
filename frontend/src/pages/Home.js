import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="display-4">Welcome to E-Shop Pro</h1>
      <p className="lead">Your professional online shopping destination. Discover premium products today.</p>
      <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
    </div>
  );
};

export default Home;