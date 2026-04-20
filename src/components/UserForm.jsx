import React, { useState } from 'react';
import axios from 'axios';

function UserForm({ onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    pincode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await axios.post('http://localhost:5000/api/users', formData);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to save user details. Please ensure the backend is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Create User</h2>
      <p className="subtitle" style={{ marginBottom: '1.5rem' }}>Enter user details below.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="User name"
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Phone Number</label>
          <input 
            type="tel" 
            name="phoneNumber" 
            value={formData.phoneNumber} 
            onChange={handleChange} 
            placeholder="+91 0000000000"
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Address</label>
          <textarea 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            placeholder="User address"
            rows="3"
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Pincode / Zip</label>
          <input 
            type="text" 
            name="pincode" 
            value={formData.pincode} 
            onChange={handleChange} 
            placeholder="Pin"
            required 
          />
        </div>

        {error && <div className="error-text">{error}</div>}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn" disabled={isLoading} style={{ flex: 1 }}>
            {isLoading ? 'Saving...' : 'Create User'}
          </button>
          
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading} style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;
