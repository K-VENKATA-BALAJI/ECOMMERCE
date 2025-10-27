import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8888/products/${id}`, { withCredentials: true })
      .then(res => {
        setProduct(res.data.product);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const addToCart = () => {
    axios.post('http://localhost:8888/cart', { product_id: parseInt(id) }, { withCredentials: true })
      .then(() => alert('Added to cart successfully!'))
      .catch(err => {
        if (err.response && err.response.status === 401) {
          alert('Please login first to add to cart.');
        } else {
          alert('Error adding to cart. Please try again.');
        }
      });
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (!product) return <div className="text-center">Product not found.</div>;

  return (
    <div className="row">
      <div className="col-md-6">
        <img src={`http://localhost:8888/${product.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}`} alt={product.name} className="img-fluid mb-3" />
      </div>
      <div className="col-md-6">
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <h4 className="text-success">${product.price}</h4>
        <button className="btn btn-success btn-lg w-100" onClick={addToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;