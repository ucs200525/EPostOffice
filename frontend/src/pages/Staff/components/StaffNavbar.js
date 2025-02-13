import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const StaffNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return JSON.parse(localStorage.getItem('staffNavbarCollapsed')) || false;
  });

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('staffNavbarCollapsed', JSON.stringify(newState));
  };

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className={`staff-navbar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="nav-brand">
        <h2>E-Post Office</h2>
        <button className="nav-toggle" onClick={handleToggle}>
          <i className={`fas fa-${isCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
        </button>
      </div>
      <ul className="nav-links">
        <li className={isActive('/staff')}>
          <Link to="/staff">
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li className={isActive('/staff/orders')}>
          <Link to="/staff/orders">
            <i className="fas fa-box"></i>
            <span>Orders</span>
          </Link>
        </li>
        <li className={isActive('/staff/deliveries')}>
          <Link to="/staff/deliveries">
            <i className="fas fa-truck"></i>
            <span>Deliveries</span>
          </Link>
        </li>
        <li className={isActive('/staff/customers')}>
          <Link to="/staff/customers">
            <i className="fas fa-users"></i>
            <span>Customers</span>
          </Link>
        </li>
        <li className={isActive('/staff/profile')}>
          <Link to="/staff/profile">
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </Link>
        </li>
      </ul>
      <div className="nav-user">
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default StaffNavbar;
