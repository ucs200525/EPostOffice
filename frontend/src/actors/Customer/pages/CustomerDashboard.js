import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');  // Changed from '/login' to '/'
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Customer Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || 'Customer'}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <main className="dashboard-content">
        <h2>Your Services</h2>
        <div className="dashboard-grid">
          {/* Add your customer dashboard content here */}
          <p>Welcome to your dashboard. More features coming soon.</p>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
