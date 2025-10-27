import React, { useState } from 'react';
import axios from 'axios';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const data = isLogin ? { username, password } : { username, email, password, role };
    const url = isLogin ? 'http://localhost:8888/login' : 'http://localhost:8888/register';
    
    axios.post(url, data, { withCredentials: true })
      .then(res => {
        if (res.data.status === 'success') {
          const message = isLogin ? 'Login successful!' : 'Registration successful! Welcome!';
          const roleMessage = res.data.role === 'admin' ? ' (Admin Mode)' : '';
          alert(message + roleMessage);
          window.location.href = '/';
        } else {
          alert(res.data.message);
        }
      })
      .catch(err => {
        console.error('Auth error:', err.response?.data || err);
        alert(`Error: ${err.response?.data?.message || err.response?.data?.error || 'Unknown error'}`);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">
              {isLogin ? 'Login' : 'Register'}
            </h2>
            
            <button 
              className="btn btn-link mb-3" 
              onClick={() => setIsLogin(!isLogin)}
            >
              Switch to {isLogin ? 'Register' : 'Login'}
            </button>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                />
              </div>
              {!isLogin && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Account Type</label>
                    <select 
                      className="form-control" 
                      value={role} 
                      onChange={e => setRole(e.target.value)}
                    >
                      <option value="user">Regular User</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <small className="form-text text-muted">
                      Admin accounts can manage products and have full access to the system.
                    </small>
                  </div>
                </>
              )}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={loading}
              >
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;