import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaChartLine, FaUsers, FaCog, FaFileAlt, FaUserCog, FaSignOutAlt } from 'react-icons/fa';
import '../styles/AdminNavbar.css';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="admin-top-navbar">
      <div className="navbar-left">
        <Link to="/admin" className="brand">
          <h1>E-Post Office</h1>
          <span>Admin Panel</span>
        </Link>
      </div>

      <div className="navbar-center">
        <ul className="nav-links">
          <li>
            <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>
              <FaChartLine /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/staff" className={isActive('/admin/staff')}>
              <FaUsers /> Staff
            </Link>
          </li>
          <li>
            <Link to="/admin/services" className={isActive('/admin/services')}>
              <FaCog /> Services
            </Link>
          </li>
          <li>
            <Link to="/admin/reports" className={isActive('/admin/reports')}>
              <FaFileAlt /> Reports
            </Link>
          </li>
          <li>
            <Link to="/admin/settings" className={isActive('/admin/settings')}>
              <FaUserCog /> Settings
            </Link>
          </li>
        </ul>
      </div>

      <div className="navbar-right">
        <span className="user-info">
          Welcome, {user?.name || 'Admin'}
        </span>
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
