import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`);
        setUser(response.data);
      } catch (err) {
        setError('Failed to fetch user details. They might not exist.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (isLoading) return <div className="glass-card"><div className="loading">Loading details...</div></div>;
  if (error) return <div className="glass-card"><div className="error-text">{error}</div><Link to="/users" className="nav-link">Return to users</Link></div>;
  if (!user) return null;

  return (
    <div className="glass-card">
      <h1>{user.name}'s Profile</h1>
      <p className="subtitle">Detailed Information</p>
      
      <div className="profile-grid">
        <div className="profile-field">
          <label>Full Name</label>
          <div className="value">{user.name}</div>
        </div>
        
        <div className="profile-field">
          <label>Phone Number</label>
          <div className="value">{user.phoneNumber}</div>
        </div>
        
        <div className="profile-field">
          <label>Pincode / Zip</label>
          <div className="value">{user.pincode}</div>
        </div>
        
        <div className="profile-field" style={{ gridColumn: '1 / -1' }}>
          <label>Address</label>
          <div className="value">{user.address}</div>
        </div>
      </div>
      
      <Link to="/users" className="btn btn-secondary">
        &larr; Back to User List
      </Link>
    </div>
  );
}

export default UserDetails;
