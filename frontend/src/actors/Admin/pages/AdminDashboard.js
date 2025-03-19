import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import dashboardService from '../../../services/dashboardService';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    dashboardService.initializeSocket();
    // ... rest of your useEffect ...
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Welcome to Admin Dashboard</h1>
      {/* ... rest of your component ... */}
    </div>
  );
};

export default AdminDashboard;