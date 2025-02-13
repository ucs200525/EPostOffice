import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // First call logout to clear the auth state
    navigate('/admin/login'); // Then redirect to admin login
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || 'Admin'}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <main className="dashboard-content">
        <h2>Admin Controls</h2>
        <div className="dashboard-grid">
          {/* Add your admin dashboard content here */}
          <p>Welcome to the admin dashboard. More features coming soon.</p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
