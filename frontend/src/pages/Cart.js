import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8888/cart', { withCredentials: true })
      .then(res => {
        setCart(res.data.cart);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const removeFromCart = (product_id) => {
    axios.delete(`http://localhost:8888/cart/${product_id}`, { withCredentials: true })
      .then(() => {
        setCart(cart.filter(item => item.product_id !== parseInt(product_id)));
      })
      .catch(err => {
        if (err.response && err.response.status === 401) {
          alert('Please login to manage your cart.');
        } else {
          alert('Error removing item. Please try again.');
        }
      });
  };

  const placeOrder = () => {
    if (!phone || !address) return alert('Please fill phone and address.');
    alert('Order placed successfully! Thank you for shopping.');
    setShowOrderModal(false);
    setCart([]);  // Clear cart UI
    setPhone('');
    setAddress('');
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) return <div className="text-center">Loading cart...</div>;

  return (
    <div>
      <h2>Shopping Cart</h2>
      {cart.length === 0 ? (
        <div className="alert alert-info text-center">
          Your cart is empty. <a href="/products">Start shopping</a> or login to view saved items.
        </div>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} className="row align-items-center mb-3 p-3 border rounded">
              <div className="col-md-6">
                <h5>{item.name}</h5>
                <p className="text-muted">{item.description}</p>
              </div>
              <div className="col-md-2">
                <strong>Qty: {item.quantity}</strong>
              </div>
              <div className="col-md-2">
                <strong>${(item.price * item.quantity).toFixed(2)}</strong>
              </div>
              <div className="col-md-2">
                <button className="btn btn-outline-danger" onClick={() => removeFromCart(item.product_id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <hr />
          <div className="row">
            <div className="col-md-8"></div>
            <div className="col-md-4">
              <h4>Total: <span className="text-success">${total.toFixed(2)}</span></h4>
              <button className="btn btn-success w-100" onClick={() => setShowOrderModal(true)}>
                Place Order
              </button>
            </div>
          </div>
        </>
      )}

      {/* Order Modal for Users */}
      {showOrderModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Order</h5>
                <button type="button" className="btn-close" onClick={() => setShowOrderModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="e.g., +1 123-456-7890"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Delivery Address</label>
                  <textarea 
                    className="form-control" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    rows="3"
                    placeholder="e.g., 123 Main St, City, State 12345"
                  />
                </div>
                <p className="text-end"><strong>Total: ${total.toFixed(2)}</strong></p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={placeOrder}>Confirm Order</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;