import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Get initial state from localStorage
    return JSON.parse(localStorage.getItem('navbarCollapsed')) || false;
  });

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Save state to localStorage
    localStorage.setItem('navbarCollapsed', JSON.stringify(newState));
    const content = document.querySelector('.dashboard-content');
    if (content) {
      content.style.transition = 'all 0.3s ease';
    }
  };

  // On mount, apply the saved state
  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem('navbarCollapsed'));
    if (savedState !== null) {
      setIsCollapsed(savedState);
    }
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className={`admin-navbar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="nav-brand">
        <h2>E-Post Office</h2>
        <button className="nav-toggle" onClick={handleToggle}>
          <i className={`fas fa-${isCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
        </button>
      </div>
      <ul className="nav-links">
        <li className={isActive('/admin')}>
          <Link to="/admin">
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li className={isActive('/admin/staff')}>
          <Link to="/admin/staff">
            <i className="fas fa-users"></i>
            <span>Staff Management</span>
          </Link>
        </li>
        <li className={isActive('/admin/services')}>
          <Link to="/admin/services">
            <i className="fas fa-cog"></i>
            <span>Services</span>
          </Link>
        </li>
        <li className={isActive('/admin/reports')}>
          <Link to="/admin/reports">
            <i className="fas fa-file-alt"></i>
            <span>Reports</span>
          </Link>
        </li>
        <li className={isActive('/admin/settings')}>
          <Link to="/admin/settings">
            <i className="fas fa-cogs"></i>
            <span>Settings</span>
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

export default AdminNavbar;
