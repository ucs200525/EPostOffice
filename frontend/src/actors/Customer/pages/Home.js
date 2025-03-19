import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import styles from '../styles/Home.module.css';
import { FaBox, FaTruck, FaMoneyBill, FaUser, FaBell, FaMapMarkerAlt, FaFileAlt, FaStar, FaSearch, FaQuestionCircle, FaArrowRight, FaCalculator, FaClock, FaShieldAlt, FaCheckCircle, FaPlus, FaMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useShipments } from '../../../context/ShipmentContext';
import Notification from '../../../components/Notification';

const SendPackageSection = () => {
  const navigate = useNavigate();
  
  return (
    <div className={styles.serviceSection}>
      <h2>Send Package</h2>
      <div className={styles.serviceCards}>
        <div className={styles.serviceCard}>
          <FaBox className={styles.cardIcon} />
          <h3>Domestic Shipping</h3>
          <p>Send packages anywhere within the country</p>
          <button onClick={() => navigate('/send-package/domestic')}>
            Send Now
          </button>
        </div>
        <div className={styles.serviceCard}>
          <FaTruck className={styles.cardIcon} />
          <h3>International Shipping</h3>
          <p>Ship worldwide with tracking</p>
          <button onClick={() => navigate('/send-package/international')}>
            Send Now
          </button>
        </div>
      </div>
    </div>
  );
};

const PickupSection = () => {
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const navigate = useNavigate();

  const handlePickupSchedule = () => {
    navigate('/schedule-pickup', { 
      state: { date: pickupDate, time: pickupTime } 
    });
  };

  return (
    <div className={styles.serviceSection}>
      <h2>Schedule a Pickup</h2>
      <div className={styles.pickupScheduler}>
        <div className={styles.schedulerCard}>
          <FaClock className={styles.cardIcon} />
          <h3>Plan Your Pickup</h3>
          <div className={styles.schedulerForm}>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <select 
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
            >
              <option value="">Select Time</option>
              <option value="morning">9 AM - 12 PM</option>
              <option value="afternoon">12 PM - 3 PM</option>
              <option value="evening">3 PM - 6 PM</option>
            </select>
            <button onClick={handlePickupSchedule}>
              Schedule Pickup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShippingCalculator = () => {
  // const navigate = useNavigate();
  // return (
  //   <div className={styles.calculatorSection}>
  //     <h2>Shipping Calculator</h2>
  //     <div className={styles.calculatorCard}>
  //       <FaCalculator className={styles.cardIcon} />
  //       <p>Calculate shipping costs instantly</p>
  //       <button onClick={() => navigate('/calculator')}>
  //         Calculate Now
  //       </button>
  //     </div>
  //   </div>
  // );
};

const Home = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Add authLoading
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Change to false initially
  const [notification, setNotification] = useState({
    show: false,
    type: 'info',
    message: ''
  });

  // Add CSS variables
  const cssVariables = {
    '--primary-color': '#1a237e',
    '--secondary-color': '#0d47a1',
    '--white': '#ffffff',
    '--gray-light': '#f8f9fa',
    '--text-dark': '#333333',
    '--text-light': '#666666',
    '--shadow': '0 2px 8px rgba(0,0,0,0.1)'
  };

  const [customerData, setCustomerData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'customer',
    phone: '',
    walletBalance: 0,
    pickupAddress: {
      label: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      type: 'pickup',
      isDefault: false,
      _id: ''
    },
    deliveryAddresses: []
  });
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]); // Initialize as empty array
  const [trackingNumber, setTrackingNumber] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [faqSearch, setFaqSearch] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const { stats } = useShipments();
  const [packageStats, setPackageStats] = useState({
    active: 0,
    transit: 0,
    delivered: 0,
    total: 0
  });
  const [visibleFaqs, setVisibleFaqs] = useState(5); // Add this state
  const [expandedFaq, setExpandedFaq] = useState(null); // Add this state
  const [orderStats, setOrderStats] = useState({
    active: 0,
    transit: 0,
    completed: 0,
    total: 0
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setLoading(true); // Only set loading true when fetching authenticated user data
      Promise.all([
        fetchProfile(),
        fetchOrders(),
        fetchNotifications(),
        fetchWalletBalance(),
        fetchPackageStats()
      ])
      .then(() => setLoading(false))
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
    }
  }, [isAuthenticated, user]);

  // Safe navigation function
  const handleNavigation = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  
  useEffect(() => {
    // First try to get data from auth context
    if (user) {
      setCustomerData(user);
    } else {
      // If not in auth context, try localStorage
      const userFromLocal = localStorage.getItem('user');
      if (userFromLocal) {
        try {
          const parsedUser = JSON.parse(userFromLocal);
          setCustomerData(parsedUser);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    }
  }, [user]);

const fetchProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!user || !user._id) {
      console.log('No user ID available');
      return;
    }
    
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/customers/${user._id}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    setCustomerData(response.data);
    setError(null);
  } catch (err) {
    console.error('Profile fetch failed:', err);
    setNotification({
      show: true,
      type: 'error',
      message: err.response?.data?.message || 'Failed to fetch profile'
    });
    setCustomerData(null);
  }
};

  // useEffect(() => {
  //   fetchProfile();
  // }, []);

  // if (error) {
  //   return <div className="error-message">{error}</div>;
  // }

  // if (!customerData) {
  //   return <div>Loading...</div>;
  // }

  
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      // if (!user || !user._id) {
      //   console.log('No user ID available');
      //   setOrderStats({ active: 0, transit: 0, completed: 0, total: 0 });
      //   setOrders([]);
      //   return;
      // }

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/orders/my-orders/${customerData.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update to use the correct response structure
        const { data: orders, stats } = response.data;
        setOrderStats(stats);
        setOrders(orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to fetch orders'
      });
      setOrderStats({ active: 0, transit: 0, completed: 0, total: 0 });
      setOrders([]);
    }
  };

  useEffect(() => {
    // Only fetch orders if user exists and has id
    if (isAuthenticated && user?.id) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/customer/notifications`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Ensure we always have an array
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error('Notifications fetch failed:', err);
      setError('Failed to load notifications');
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      // Check if user and user.id exist
      if (!user || !user._id) {
        console.log('No user ID available');
        setWalletBalance(0);
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/${user.id}/wallet`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data) {
        setWalletBalance(response.data.balance || 0);
      }
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err);
      setWalletBalance(0);
    }
  };

  useEffect(() => {
    // Only fetch wallet balance if user is authenticated and has an ID
    if (isAuthenticated && user?.id) {
      fetchWalletBalance();
    }
  }, [isAuthenticated, user]);

  const fetchPackageStats = async () => {
    try {
        if (!user || !user._id) {
            console.log('No user ID available');
            return;
        }

        const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/packages/${user._id}/stats`,
            { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
        );
        
        if (response.data.success) {
            setPackageStats(response.data.stats);
        } else {
            console.error('Failed to fetch stats:', response.data.message);
        }
    } catch (err) {
        console.error('Stats fetch error:', err.message);
        setPackageStats({
            active: 0,
            transit: 0,
            delivered: 0,
            total: 0
        });
    }
};

useEffect(() => {
    if (user && user._id) {
        fetchPackageStats();
    }
}, [user]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/feedback/`, {
        feedback,
        rating,
        userId: user._id
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Show success message
      setNotification({
        show: true,
        type: 'success',
        message: 'Thank you for your feedback!'
      });
      
      // Reset form
      setFeedback('');
      setRating(0);
    } catch (err) {
      console.error('Feedback submission failed:', err);
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to submit feedback. Please try again.'
      });
    }
  };

  const faqs = [
    { question: "How do I track my package?", 
      answer: "Enter your tracking number in the search box at the top of the page. You'll receive real-time updates about your package's location and status." },
    
    { question: "What payment methods are accepted?", 
      answer: "We accept credit cards, debit cards, digital wallets (Google Pay, Apple Pay), net banking, and UPI payments." },
    
    { question: "How do I schedule a pickup?", 
      answer: "Click the 'Send Package' button, fill in the pickup details, and choose your preferred time slot. We offer same-day pickup if scheduled before 2 PM." },
    
    { question: "What are your delivery hours?", 
      answer: "Regular deliveries are made between 9 AM and 6 PM on working days. Express deliveries may be made until 8 PM." },
    
    { question: "How can I calculate shipping costs?", 
      answer: "Use our Price Calculator tool to estimate shipping costs based on package weight, dimensions, and destination." },
    
    { question: "What items are prohibited for shipping?", 
      answer: "Prohibited items include flammable materials, weapons, illegal substances, perishable goods without proper packaging, and valuable items like jewelry without insurance." },
    
    { question: "How do I report a lost package?", 
      answer: "Contact our customer support with your tracking number. Lost package claims can be filed after 7 days for domestic and 15 days for international shipments." },
    
    { question: "What's the maximum weight limit for packages?", 
      answer: "Regular shipping allows up to 30kg per package. For heavier items, please use our cargo service." },
    
    { question: "Do you offer international shipping?", 
      answer: "Yes, we ship to over 200 countries. International shipping times and rates vary by destination." },
    
    { question: "How can I get shipping insurance?", 
      answer: "Insurance can be added during checkout. The cost is 1% of the declared value of your items." },
    
    { question: "What's your refund policy?", 
      answer: "Refunds are processed within 7-10 business days for eligible cases like service failure or damaged packages." },
    
    { question: "How do I package fragile items?", 
      answer: "Use bubble wrap, foam peanuts, and mark the package as 'FRAGILE'. We offer professional packaging services for delicate items." },
    
    { question: "What are your express delivery timeframes?", 
      answer: "Express delivery ensures next-day delivery for local packages and 2-3 days for national delivery within major cities." },
    
    { question: "How can I change my delivery address?", 
      answer: "Log into your account and update the delivery address before the package is dispatched. A fee may apply for changes after dispatch." },
    
    { question: "Do you deliver on weekends?", 
      answer: "Yes, we offer weekend delivery for express packages at an additional charge. Regular deliveries are Monday to Friday." },
    
    { question: "What happens if I'm not home during delivery?", 
      answer: "We'll leave a delivery notice and attempt delivery two more times. You can also arrange pickup from our nearest post office." },
    
    { question: "How do I create a business account?", 
      answer: "Visit our Business Solutions page and submit your business details. Our team will contact you within 24 hours." },
    
    { question: "What's the process for bulk shipping?", 
      answer: "Business accounts can access our bulk shipping portal. We offer special rates and dedicated support for bulk orders." },
    
    { question: "How can I print shipping labels?", 
      answer: "Log into your account, create a shipment, and print labels directly or save them as PDF. We support thermal and regular printing." },
    
    { question: "Do you offer PO box services?", 
      answer: "Yes, we offer PO box rentals at various sizes. Visit your nearest post office or apply online." },
    
    { question: "What's your damaged package policy?", 
      answer: "Document the damage with photos and contact customer support immediately. Claims must be filed within 24 hours of delivery." },
    
    { question: "How do I schedule a redelivery?", 
      answer: "Use your tracking number to schedule redelivery online or contact customer support. First redelivery is free." },
    
    { question: "What are your customs declaration requirements?", 
      answer: "International shipments require accurate customs declarations including item description, value, and purpose of shipping." },
    
    { question: "Do you offer packing supplies?", 
      answer: "Yes, we sell boxes, envelopes, tape, and other packing supplies at all our locations and online." },
    
    { question: "How can I become a delivery partner?", 
      answer: "Apply through our Careers page. We require valid ID, vehicle documentation, and clean driving record." },
    
    { question: "What's your holiday delivery schedule?", 
      answer: "Holiday schedules are posted a month in advance. Express services remain available on selected holidays." }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleShowMore = () => {
    setVisibleFaqs(prev => prev + 5);
  };

  const BeforeLoginView = () => (
    <div className={styles.homeGuestContainer} style={cssVariables}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          {/* Swap: Place image above text */}
          <div className={styles.heroImage}>
            <img src="hero-illustration.png" alt="E-Post Office Services" />
          </div>
          <div className={styles.heroText}>
            <h1>Welcome to E-Post Office</h1>
            <p>
              Experience seamless postal services with modern technology. Track packages, pay bills, and manage all your postal needs in one place.
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/register" className={styles.ctaBtnPrimary}>Get Started</Link>
              <Link to="/services" className={styles.ctaBtnSecondary}>Explore Services</Link>
            </div>
          </div>
        </div>
      </section>
  
      <section className={styles.featuresSection}>
        <div className={styles.sectionTitle}>
          <h2>Why Choose E-Post Office?</h2>
          <p>Discover the advantages of our digital postal services</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <FaTruck className={styles.featureIcon} />
            <h3>Real-Time Tracking</h3>
            <p>Track your packages instantly with our advanced tracking system</p>
          </div>
          <div className={styles.featureCard}>
            <FaShieldAlt className={styles.featureIcon} />
            <h3>Secure Services</h3>
            <p>Your parcels and documents are protected with utmost security</p>
          </div>
          <div className={styles.featureCard}>
            <FaClock className={styles.featureIcon} />
            <h3>24/7 Access</h3>
            <p>Manage your postal needs anytime, anywhere</p>
          </div>
        </div>
      </section>
  
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>5M+</div>
            <div className={styles.statLabel}>Active Users</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>10K+</div>
            <div className={styles.statLabel}>Daily Deliveries</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>98%</div>
            <div className={styles.statLabel}>Satisfaction Rate</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>500+</div>
            <div className={styles.statLabel}>Post Offices</div>
          </div>
        </div>
      </section>
    </div>
  );

  // Add this function to get user data
  const getUserData = () => {
    if (customerData?.name) {
      return customerData;
    }
    try {
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser) {
        // Update customerData with full localStorage data
        setCustomerData({
          id: localUser.id || '',
          name: localUser.name || '',
          email: localUser.email || '',
          role: localUser.role || 'customer',
          phone: localUser.phone || '',
          walletBalance: localUser.walletBalance || 0,
          pickupAddress: localUser.pickupAddress || {
            label: '',
            streetAddress: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India',
            type: 'pickup',
            isDefault: false,
            _id: ''
          },
          deliveryAddresses: localUser.deliveryAddresses || []
        });
        return localUser;
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
    return null;
  };

  const formatAddress = (address) => {
    if (!address) return 'No pickup address set';
    return `${address.streetAddress}, ${address.city}, ${address.state} ${address.postalCode}`;
  };

  // Update the profile section JSX
  return isAuthenticated ? (
    <div className={styles.dashboardContainer}>
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ show: false, type: 'info', message: '' })}
        />
      )}

      {loading ? (
        <div className={styles.loader}>Loading dashboard...</div>
      ) : (
        <>
          <header className={styles.dashboardHeader}>
            <div className={styles.profileSection}>
              <FaUser className={styles.profileIcon} />
              <div className={styles.profileInfo}>
                {getUserData() ? (
                  <>
                    <h1>Welcome back, {getUserData().name}</h1>
                    <p>{getUserData().email}</p>
                    <p>
                      <FaMapMarkerAlt /> 
                      {getUserData().pickupAddress ? formatAddress(getUserData().pickupAddress) : 'No pickup address set'}
                    </p>
                  </>
                ) : (
                  <h1>Welcome</h1>
                )}
              </div>
            </div>
            <div className={styles.balanceSection}>
              <h3>Wallet Balance</h3>
              {/* <p className={styles.balanceAmount}>${walletBalance?.toFixed(2)}</p> */}
              <p className={styles.balanceAmount}>₹{customerData?.walletBalance?.toFixed(2)}</p>
            </div>
          </header>

          <section className={styles.statsOverview}>
            <div className={styles.statCard}>
              <FaBox className={styles.statIcon} />
              <div className={styles.statInfo}>
                <h3>Active Orders</h3>
                <p>{orderStats.active}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <FaTruck className={styles.statIcon} />
              <div className={styles.statInfo}>
                <h3>In Transit</h3>
                <p>{orderStats.transit}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <FaCheckCircle className={styles.statIcon} />
              <div className={styles.statInfo}>
                <h3>Completed</h3>
                <p>{orderStats.completed}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <FaBox className={styles.statIcon} />
              <div className={styles.statInfo}>
                <h3>Total Shipments</h3>
                <p>{orderStats.total}</p>
              </div>
            </div>
          </section>

          <div className={styles.servicesContainer}>
            <SendPackageSection />
            <PickupSection />
            <ShippingCalculator />
          </div>

          <section className={styles.servicesHighlights}>
            <h2>Our Services</h2>
            <div className={styles.servicesGrid}>
              <div className={styles.serviceCard}>
                <FaTruck className={styles.serviceIcon} />
                <h3>Express Delivery</h3>
                <p>Next-day delivery guaranteed</p>
              </div>
              <div className={styles.serviceCard}>
                <FaBox className={styles.serviceIcon} />
                <h3>Secure Packaging</h3>
                <p>Professional packaging service</p>
              </div>
              <div className={styles.serviceCard}>
                <FaMoneyBill className={styles.serviceIcon} />
                <h3>Bill Payments</h3>
                <p>Pay utilities & more</p>
              </div>
            </div>
          </section>

          <section className={styles.recentActivities}>
            <h2>Recent Activities</h2>
            <div className={styles.activitiesGrid}>
              {notifications.map(notif => (
                <div key={notif.id} className={styles.activityCard}>
                  <FaBell className={styles.notifIcon} />
                  <div className={styles.notifContent}>
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <small>{new Date(notif.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.faqSection}>
            <h2>Frequently Asked Questions</h2>
            <div className={styles.faqSearch}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search FAQs..."
              />
            </div>
            <div className={styles.faqList}>
              {faqs
                .filter(faq => 
                  faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
                  faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
                )
                .slice(0, visibleFaqs)
                .map((faq, index) => (
                  <div key={index} className={styles.faqItem}>
                    <div 
                      className={styles.faqQuestion}
                      onClick={() => toggleFaq(index)}
                    >
                      <h4>
                        <FaQuestionCircle /> 
                        {faq.question}
                      </h4>
                      {expandedFaq === index ? <FaMinus /> : <FaPlus />}
                    </div>
                    <div className={`${styles.faqAnswer} ${expandedFaq === index ? styles.expanded : ''}`}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
            </div>
            {visibleFaqs < faqs.length && !faqSearch && (
              <div className={styles.showMoreContainer}>
                <button onClick={handleShowMore} className={styles.showMoreBtn}>
                  Show More FAQs
                </button>
              </div>
            )}
          </section>

          <section className={styles.feedbackSection}>
            <h2>Your Feedback Matters</h2>
            <form onSubmit={handleFeedbackSubmit} className={styles.feedbackForm}>
              <div className={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={`star-${star}`}
                    className={`${styles.star} ${star <= rating ? styles.active : ''}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience with us..."
                required
                minLength={10}
                maxLength={500}
              />
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={!feedback.trim() || rating === 0}
              >
                Submit Feedback
              </button>
            </form>
          </section>

          <footer className={styles.dashboardFooter}>
            <div className={styles.footerLinks}>
              <a onClick={handleNavigation('/help')}>Help Center</a>
              <a onClick={handleNavigation('/contact')}>Contact Support</a>
              <a onClick={handleNavigation('/terms')}>Terms of Service</a>
            </div>
          </footer>
        </>
      )}
    </div>
  ) : (
    <BeforeLoginView />
  );
};

export default Home;