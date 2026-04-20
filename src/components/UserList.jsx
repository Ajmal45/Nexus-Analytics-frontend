import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserForm from './UserForm';

function UserList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users. Is the backend running?');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCreated = () => {
    setIsModalOpen(false);
    fetchUsers();
  };

  return (
    <div className="glass-card glass-card-wide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Registered Users</h1>
        <button className="btn" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => setIsModalOpen(true)}>
          + Create User
        </button>
      </div>
      
      <p className="subtitle" style={{ textAlign: 'left' }}>Tap on a user to view full details</p>
      
      {isLoading ? (
        <div className="loading">Loading heroes...</div>
      ) : error ? (
        <div className="error-text">{error}</div>
      ) : users.length === 0 ? (
        <p className="subtitle" style={{marginTop: '2rem'}}>No users registered yet.</p>
      ) : (
        <ul className="user-list">
          {users.map(user => (
            <li 
              key={user._id} 
              className="user-list-item"
              onClick={() => navigate(`/users/${user._id}`)}
            >
              <div>
                <h3>{user.name}</h3>
                <p>Phone: {user.phoneNumber}</p>
              </div>
              <div style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
                &rarr;
              </div>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/dashboard" className="btn btn-secondary">
          &larr; Back to Dashboard
        </Link>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <UserForm onSuccess={handleUserCreated} onClose={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
