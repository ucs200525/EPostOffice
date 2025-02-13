import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaMapMarkerAlt, FaPhone, FaClock, FaCalendarAlt } from 'react-icons/fa';
import StaffNavbar from '../components/StaffNavbar';
import '../styles/StaffDashboard.css';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [staffStats, setStaffStats] = useState({
    deliveriesCompleted: 0,
    pendingDeliveries: 0,
    customerRating: 0,
    todaysTasks: []
  });

  useEffect(() => {
    fetchStaffStats();
  }, []);

  const fetchStaffStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/staff/stats/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStaffStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching staff stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  return (
    <div className="staff-dashboard">
      <StaffNavbar />
      <header className="dashboard-header">
        <h1>Staff Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || 'Staff'}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <div className="dashboard-content">
        <div className="staff-profile-section">
          <div className="staff-details">
            <div className="staff-avatar">
              <FaUserCircle size={80} />
            </div>
            <div className="staff-info">
              <h2>{user?.name}</h2>
              <p className="staff-id">ID: {user?.staffId}</p>
              <div className="info-row">
                <FaMapMarkerAlt />
                <span>{user?.address}</span>
              </div>
              <div className="info-row">
                <FaPhone />
                <span>{user?.phone}</span>
              </div>
              <div className="info-row">
                <FaClock />
                <span>Shift: {user?.shift || 'Regular'}</span>
              </div>
              <div className="info-row">
                <FaCalendarAlt />
                <span>Joined: {new Date(user?.joinedDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Deliveries Completed</h3>
            <p className="stat-number">{staffStats.deliveriesCompleted}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Deliveries</h3>
            <p className="stat-number">{staffStats.pendingDeliveries}</p>
          </div>
          <div className="stat-card">
            <h3>Customer Rating</h3>
            <p className="stat-number">{staffStats.customerRating.toFixed(1)}/5.0</p>
          </div>
        </div>

        <div className="tasks-section">
          <h3>Today's Tasks</h3>
          <div className="tasks-list">
            {staffStats.todaysTasks.map((task, index) => (
              <div key={index} className="task-card">
                <div className="task-header">
                  <h4>{task.type}</h4>
                  <span className={`status ${task.status.toLowerCase()}`}>
                    {task.status}
                  </span>
                </div>
                <div className="task-details">
                  <p><strong>Time:</strong> {task.scheduledTime}</p>
                  <p><strong>Location:</strong> {task.location}</p>
                  <p><strong>Details:</strong> {task.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
