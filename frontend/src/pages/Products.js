import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('user');
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState(null);  // For image upload

  useEffect(() => {
    const roleCookie = document.cookie.split('; ').find(row => row.startsWith('role='))?.split('=')[1] || 'user';
    setRole(roleCookie);

    axios.get('http://localhost:8888/products', { withCredentials: true })
      .then(res => {
        setProducts(res.data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Products load error:', err);
        setLoading(false);
      });
  }, []);

  const deleteProduct = (id) => {
    if (window.confirm('Delete this product?')) {
      axios.delete(`http://localhost:8888/products/${id}`, { withCredentials: true })
        .then(() => {
          setProducts(products.filter(p => p.id !== id));
        })
        .catch(err => alert('Error deleting product'));
    }
  };

  const updatePrice = (id) => {
    const newPriceValue = parseFloat(editPrice);
    if (isNaN(newPriceValue)) return alert('Invalid price');
    axios.put(`http://localhost:8888/products/${id}`, { price: newPriceValue }, { withCredentials: true })
      .then(() => {
        setProducts(products.map(p => p.id === id ? { ...p, price: newPriceValue } : p));
        setEditingId(null);
        setEditPrice('');
      })
      .catch(err => alert('Error updating price'));
  };

  const addProduct = () => {
    if (!newName || isNaN(parseFloat(newPrice)) || !newDescription) return alert('Fill all fields.');
    const formData = new FormData();  // For multipart (text + file)
    formData.append('name', newName);
    formData.append('price', newPrice);
    formData.append('description', newDescription);
    if (newImage) formData.append('image', newImage);  // Append file
    axios.post('http://localhost:8888/products', formData, { 
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' }  // Required for files
    })
    .then(() => {
      setShowAddModal(false);
      setNewName('');
      setNewPrice('');
      setNewDescription('');
      setNewImage(null);
      window.location.reload();  // Refresh to show new product
    })
    .catch(err => {
      console.error('Add error:', err);
      alert(`Error adding product: ${err.response?.data?.error || err.message}`);
    });
  };

  if (loading) return <div className="text-center">Loading products...</div>;

  return (
    <div>
      <h2 className="mb-4">Our Products {role === 'admin' && '(Admin Mode)'}</h2>
      {role === 'admin' && (
        <button className="btn btn-primary mb-3" onClick={() => setShowAddModal(true)}>
          Add Product
        </button>
      )}
      <div className="row">
        {products.map(product => (
          <div key={product.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              {/* Product Image - Fix 1: Shows in list */}
              <img 
                src={`http://localhost:8888/${product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}`} 
                alt={product.name} 
                className="card-img-top" 
                style={{ height: '200px', objectFit: 'cover' }} 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">{product.description}</p>
                {editingId === product.id ? (
                  <div className="mb-2">
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={editPrice}
                      onChange={e => setEditPrice(e.target.value)}
                      placeholder="New price"
                    />
                    <button className="btn btn-success btn-sm mt-1 me-1" onClick={() => updatePrice(product.id)}>Save</button>
                    <button className="btn btn-secondary btn-sm mt-1" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <p className="card-text fw-bold text-success">${product.price}</p>
                )}
                <Link to={`/products/${product.id}`} className="btn btn-primary me-2">View Details</Link>
                {role === 'admin' && (
                  <>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => { setEditingId(product.id); setEditPrice(product.price); }}>Edit Price</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(product.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal with Image Upload - Fix 2: Image option added */}
      {showAddModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Product</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Price</label>
                  <input type="number" step="0.01" className="form-control" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" value={newDescription} onChange={e => setNewDescription(e.target.value)} rows="3"></textarea>
                </div>
                {/* Image Upload Field */}
                <div className="mb-3">
                  <label className="form-label">Image (optional)</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    onChange={e => setNewImage(e.target.files[0])} 
                    accept="image/*" 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={addProduct}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;