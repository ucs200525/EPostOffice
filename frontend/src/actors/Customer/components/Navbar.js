import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SideBar from '../../../components/sideBar';
import styles from './Navbar.module.css';
import { 
  FaUser, FaBars, FaTimes, FaSearch, FaBell, 
  FaGlobe, FaChevronDown, FaEnvelope, FaBox, 
  FaPhone, FaMoneyBill, FaMapMarkerAlt, FaQuestionCircle,
  FaSignOutAlt 
} from 'react-icons/fa';
import logoImage from '../../../assets/image.png';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);
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
      if (isOpen && !e.target.closest(`.${styles.sidebar}`) && !e.target.closest(`.${styles.navToggle}`)) {
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
      <div className={styles.topBar}>
        <div className={styles.container}>
          <div className={styles.contactInfo}>
            <div className={styles.contactInfoItem}>
              <FaPhone />
              <span>0123456</span>
            </div>
            <div className={`${styles.contactInfoItem} ${styles.email}`}>
              <FaEnvelope />
              <span>support@epost.office</span>
            </div>
          </div>
          <div className={styles.topActions}>
            <Link to="/help" className={styles.helpLink}>
              <FaQuestionCircle />
              <span>Help Center</span>
            </Link>
          </div>
        </div>
      </div>

      <nav className={`${styles.mainNav} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.navContainer}>
          <div className={styles.navBrand}>
            <Link to="/">
              <img src={logoImage} alt="E-Post Office" />
              <div className={styles.brandText}>
                {/* <h1>E-Post Office</h1> 
                 <span>Government of Bangladesh</span> */}
              </div>
            </Link>
          </div>

          {isAuthenticated ? (
            <div className={styles.navSearch}>
              {/* <form onSubmit={(e) => {
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
              </form> */}
            </div>
          ) : null}

          {isAuthenticated ? (
            <div className={styles.mobileActions}>
              <button className={styles.mobileNotification}>
                <FaBell />
                <span className={styles.notificationBadge}>2</span>
              </button>
              <button 
                className={styles.mobileAccount}
                onClick={() => setShowMobileUserMenu(!showMobileUserMenu)}
              >
                <FaUser />
              </button>
              {showMobileUserMenu && (
                <div className={styles.mobileUserMenu}>
                  <Link to="/shipments">My Shipments</Link>
                  <Link to="/payment">Payments</Link>
                  <Link to="/settings">Settings</Link>
                  <Link to="/customer/addresses">Addresses</Link>
                  <button onClick={logout} className={styles.logout}>
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : null}

          <div className={`${styles.navMenu} ${isOpen ? styles.active : ''}`}>
            <ul className={styles.navItems}>
              <li><Link to="/">Home</Link></li>
              <li className={styles.hasSubmenu}>
                <span>Services <FaChevronDown /></span>
                <div className={styles.megaMenu}>
                  <div className={styles.menuSection}>
                    <h3><FaBox /> Mail & Parcels</h3>
                    <Link to="/services/domestic">Domestic Mail</Link>
                    <Link to="/services/international">International</Link>
                    <Link to="/services/express">Express Service</Link>
                  </div>
                  <div className={styles.menuSection}>
                    <h3><FaMoneyBill /> Financial</h3>
                    <Link to="/services/money-order">Money Order</Link>
                    <Link to="/services/banking">Banking</Link>
                    <Link to="/services/bills">Bill Payment</Link>
                  </div>
                  <div className={styles.menuSection}>
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

            <div className={styles.navActions}>
              {isAuthenticated ? (
                <button className={styles.notificationBtn}>
                  <FaBell />
                  <span className={styles.badge}>2</span>
                </button>
              ) : null}
              {isAuthenticated ? (
                <div className={styles.userMenu} onMouseEnter={() => setShowUserMenu(true)} onMouseLeave={() => setShowUserMenu(false)}>
                  <button className={styles.userBtn}>
                    <FaUser />
                    <span>{user?.name || 'My Account'}</span>
                  </button>
                  <div className={`${styles.dropdownMenu} ${showUserMenu ? styles.show : ''}`}>
                    <Link to="/shipments">My Shipments</Link>
                    <Link to="/payment">Payments</Link>
                    <Link to="/settings">Settings</Link>
                    <Link to="/customer/addresses">Addresses</Link>
                    <div className={styles.divider}></div>
                    <button onClick={logout} className={styles.logout}>
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.authButtons}>
                  <button 
                    className={`${styles.navLoginBtn} ${styles.customer}`}
                    onClick={() => handleRoleLogin('customer')}
                  >
                    Customer
                  </button>
                  <button 
                    className={`${styles.navLoginBtn} ${styles.staff}`}
                    onClick={() => handleRoleLogin('staff')}
                  >
                    Staff
                  </button>
                  <button 
                    className={`${styles.navLoginBtn} ${styles.admin}`}
                    onClick={() => handleRoleLogin('admin')}
                  >
                    Admin
                  </button>
                </div>
              )}
            </div>
          </div>

          <button className={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default Navbar;