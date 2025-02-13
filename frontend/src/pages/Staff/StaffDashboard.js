import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Staff Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || 'Staff Member'}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <main className="dashboard-content">
        <h2>Staff Controls</h2>
        <div className="dashboard-grid">
          {/* Add your staff dashboard content here */}
          <p>Welcome to the staff dashboard. More features coming soon.</p>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
