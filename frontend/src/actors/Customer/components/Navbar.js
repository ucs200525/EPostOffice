import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SideBar from '../../../components/sideBar';
import './Navbar.css';
import { 
  FaUser, FaBars, FaTimes, FaSearch, FaBell, 
  FaGlobe, FaChevronDown, FaEnvelope, FaBox, 
  FaPhone, FaMoneyBill, FaMapMarkerAlt, FaQuestionCircle,
  FaSignOutAlt 
} from 'react-icons/fa';
import logoImage from '../../../assets/logo-removebg-preview.png';
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false); // new state
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleRoleLogin = (role) => {
    switch(role) {
      case 'admin':
        navigate('/admin/login');
        break;
      case 'staff':
        navigate('/staff/login');
        break;
      default:
        navigate('/login');
        break;
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && !e.target.closest('.sidebar') && !e.target.closest('.nav-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
      <div className="top-bar">
        <div className="container">
          <div className="contact-info">
            <div className="contact-info-item">
              <FaPhone />
              <span>0123456</span>
            </div>
            <div className="contact-info-item email">
              <FaEnvelope />
              <span>support@epost.office</span>
            </div>
          </div>
          <div className="top-actions">
            <Link to="/help" className="help-link">
              <FaQuestionCircle />
              <span>Help Center</span>
            </Link>
          </div>
        </div>
      </div>

      <nav className={`main-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-brand">
            <Link to="/">
            <img src={logoImage} alt="E-Post Office" />
              <div className="brand-text">
                <h1>E-Post Office</h1>
                {/* <span>Government of Bangladesh</span> */}
              </div>
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="nav-search">
              <form onSubmit={(e) => {
                e.preventDefault();
                navigate(`/track?id=${searchQuery}`);
              }}>
                <input
                  type="text"
                  placeholder="Enter tracking number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">
                  <FaSearch />
                </button>
              </form>
            </div>
          ) : null}


          {isAuthenticated ? (
            <div className="mobile-actions">
              <button className="mobile-notification">
                <FaBell />
                <span className="notification-badge">2</span>
              </button>
              <button 
                className="mobile-account"
                onClick={() => setShowMobileUserMenu(!showMobileUserMenu)}
              >
                <FaUser />
              </button>
              {/* Mobile User Menu */}
              {showMobileUserMenu && (
                <div className="mobile-user-menu">
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/shipments">My Shipments</Link>
                  <Link to="/payment">Payments</Link>
                  <Link to="/settings">Settings</Link>
                  <button onClick={logout} className="logout">
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : null}

          <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
            <ul className="nav-items">
              <li><Link to="/">Home</Link></li>
              <li className="has-submenu">
                <span>Services <FaChevronDown /></span>
                <div className="mega-menu">
                  <div className="menu-section">
                    <h3><FaBox /> Mail & Parcels</h3>
                    <Link to="/services/domestic">Domestic Mail</Link>
                    <Link to="/services/international">International</Link>
                    <Link to="/services/express">Express Service</Link>
                  </div>
                  <div className="menu-section">
                    <h3><FaMoneyBill /> Financial</h3>
                    <Link to="/services/money-order">Money Order</Link>
                    <Link to="/services/banking">Banking</Link>
                    <Link to="/services/bills">Bill Payment</Link>
                  </div>
                  <div className="menu-section">
                    <h3><FaMapMarkerAlt /> Locations</h3>
                    <Link to="/locations/offices">Post Offices</Link>
                    <Link to="/locations/agents">Postal Agents</Link>
                    <Link to="/locations/atm">ATM Locations</Link>
                  </div>
                </div>
              </li>
              <li><Link to="/track">Track & Trace</Link></li>
              <li><Link to="/calculator">Price Calculator</Link></li>
            </ul>

            <div className="nav-actions">


              {isAuthenticated ? (
                  <button className="notification-btn">
                  <FaBell />
                  <span className="badge">2</span>
                </button>
                    ) : null}
              {isAuthenticated ? (
                <div className="user-menu" onMouseEnter={() => setShowUserMenu(true)} onMouseLeave={() => setShowUserMenu(false)}>
                  <button className="user-btn">
                    <FaUser />
                    <span>{user?.name || 'My Account'}</span>
                  </button>
                  <div className={`dropdown-menu ${showUserMenu ? 'show' : ''}`}>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/shipments">My Shipments</Link>
                    <Link to="/payment">Payments</Link>
                    <Link to="/settings">Settings</Link>
                    <div className="divider"></div>
                    <button onClick={logout} className="logout">
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button 
                    className="nav-login-btn customer"
                    onClick={() => handleRoleLogin('customer')}
                  >
                    Customer
                  </button>
                  <button 
                    className="nav-login-btn staff"
                    onClick={() => handleRoleLogin('staff')}
                  >
                    Staff
                  </button>
                  <button 
                    className="nav-login-btn admin"
                    onClick={() => handleRoleLogin('admin')}
                  >
                    Admin
                  </button>
                </div>
              )}
            </div>
          </div>

          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default Navbar;