import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaBars, FaTimes, FaUser, FaUsers, FaBox, 
         FaTruck, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import styles from '../styles/StaffNavbar.module.css';

const StaffNavbar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navLinks = [
    { to: '/staff/dashboard', icon: <FaUser />, text: 'Dashboard' },
    { to: '/staff/customers', icon: <FaUsers />, text: 'Customers' },
    { to: '/staff/orders', icon: <FaBox />, text: 'Orders' },
    // { to: '/staff/deliveries', icon: <FaTruck />, text: 'Deliveries' },
    { to: '/staff/reports', icon: <FaChartBar />, text: 'Reports' },
  ];

  return (
    <nav className={`${styles.navbar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.navHeader}>
        <h2 className={styles.navTitle}>
          {!isCollapsed && 'Staff Panel'}
        </h2>
        <button className={styles.toggleBtn} onClick={toggleNavbar}>
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <div className={styles.navLinks}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`${styles.navLink} ${
              location.pathname === link.to ? styles.active : ''
            }`}
          >
            <span className={styles.icon}>{link.icon}</span>
            {!isCollapsed && <span className={styles.linkText}>{link.text}</span>}
          </Link>
        ))}
      </div>

      <button 
        onClick={logout} 
        className={styles.logoutBtn}
      >
        <FaSignOutAlt />
        {!isCollapsed && <span>Logout</span>}
      </button>
    </nav>
  );
};

export default StaffNavbar;
