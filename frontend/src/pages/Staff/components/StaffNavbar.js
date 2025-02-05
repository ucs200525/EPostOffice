import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const StaffNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return JSON.parse(localStorage.getItem('staffNavCollapsed')) || false;
  });

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('staffNavCollapsed', JSON.stringify(newState));
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className={`staff-navbar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="nav-brand">
        <div className="brand-content">
          <i className="fas fa-mail-bulk"></i>
          <h2>E-Post Office</h2>
        </div>
        <button className="nav-toggle" onClick={handleToggle}>
          <i className={`fas fa-${isCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
        </button>
      </div>

      <ul className="nav-links">
        <li className={isActive('/staff')}>
          <Link to="/staff">
            <div className="nav-link-content">
              <i className="fas fa-chart-line"></i>
              <span className="nav-text">Dashboard</span>
            </div>
          </Link>
        </li>
        <li className={isActive('/staff/customers')}>
          <Link to="/staff/customers">
            <div className="nav-link-content">
              <i className="fas fa-users"></i>
              <span className="nav-text">Customers</span>
            </div>
          </Link>
        </li>
        <li className={isActive('/staff/orders')}>
          <Link to="/staff/orders">
            <div className="nav-link-content">
              <i className="fas fa-box"></i>
              <span className="nav-text">Orders</span>
            </div>
          </Link>
        </li>
        <li className={isActive('/staff/deliveries')}>
          <Link to="/staff/deliveries">
            <div className="nav-link-content">
              <i className="fas fa-truck"></i>
              <span className="nav-text">Deliveries</span>
            </div>
          </Link>
        </li>
        <li className={isActive('/staff/reports')}>
          <Link to="/staff/reports">
            <div className="nav-link-content">
              <i className="fas fa-file-alt"></i>
              <span className="nav-text">Reports</span>
            </div>
          </Link>
        </li>
        <li className={isActive('/staff/profile')}>
          <Link to="/staff/profile">
            <div className="nav-link-content">
              <i className="fas fa-user"></i>
              <span className="nav-text">Profile</span>
            </div>
          </Link>
        </li>
      </ul>

      <div className="nav-footer">
        <div className="staff-info">
          <i className="fas fa-id-badge"></i>
          <span>John Doe</span>
        </div>
        <button className="logout-btn" onClick={() => navigate('/')}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default StaffNavbar;
