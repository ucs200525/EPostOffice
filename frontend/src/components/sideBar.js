import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBox, FaMoneyBill, FaMapMarkerAlt, 
  FaChevronRight, FaChevronLeft 
} from 'react-icons/fa';
import './SideBar.css';
import { useAuth } from '../context/AuthContext';

const SideBar = ({ isOpen, setIsOpen }) => {
  const [showServices, setShowServices] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const handleClose = () => {
    setIsOpen(false);
    setShowServices(false);
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={handleClose}></div>}
    <div className={`sidebar ${isOpen ? 'active' : ''}`}>
      <div className={`sidebar-main ${showServices ? 'slide-left' : ''}`}>
        <ul className="sidebar-items">
          <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
          {isAuthenticated && (
            <>
              <li><Link to="/track" onClick={() => setIsOpen(false)}>Track & Trace</Link></li>
              <li><Link to="/calculator" onClick={() => setIsOpen(false)}>Price Calculator</Link></li>
              <li><Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link></li>
              <li><Link to="/shipments" onClick={() => setIsOpen(false)}>My Shipments</Link></li>
              <li><Link to="/payment" onClick={() => setIsOpen(false)}>Payments</Link></li>
              <li><Link to="/settings" onClick={() => setIsOpen(false)}>Settings</Link></li>
            </>
          )}
          <li>
            <button 
              className="service-btn" 
              onClick={() => setShowServices(true)}
            >
              Services <FaChevronRight />
            </button>
          </li>
        </ul>
        
        <div className="sidebar-footer">
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setIsOpen(false)}>My Profile</Link>
              <button className="logout" onClick={() => {
                logout();
                setIsOpen(false);
              }}>Logout</button>
            </>
          ) : (
            <div className="auth-buttons-sidebar">
              <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      </div>

      <div className={`services-submenu ${showServices ? 'active' : ''}`}>
        <button 
          className="back-btn" 
          onClick={() => setShowServices(false)}
        >
          <FaChevronLeft /> Back
        </button>
        <div className="menu-section">
          <h3><FaBox /> Mail & Parcels</h3>
          <Link to="/services/domestic" onClick={() => setIsOpen(false)}>Domestic Mail</Link>
          <Link to="/services/international" onClick={() => setIsOpen(false)}>International</Link>
          <Link to="/services/express" onClick={() => setIsOpen(false)}>Express Service</Link>
        </div>
        <div className="menu-section">
          <h3><FaMoneyBill /> Financial</h3>
          <Link to="/services/money-order" onClick={() => setIsOpen(false)}>Money Order</Link>
          <Link to="/services/banking" onClick={() => setIsOpen(false)}>Banking</Link>
          <Link to="/services/bills" onClick={() => setIsOpen(false)}>Bill Payment</Link>
        </div>
        <div className="menu-section">
          <h3><FaMapMarkerAlt /> Locations</h3>
          <Link to="/locations/offices" onClick={() => setIsOpen(false)}>Post Offices</Link>
          <Link to="/locations/agents" onClick={() => setIsOpen(false)}>Postal Agents</Link>
          <Link to="/locations/atm" onClick={() => setIsOpen(false)}>ATM Locations</Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default SideBar;