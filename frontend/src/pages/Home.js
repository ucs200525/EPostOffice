import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Home.css';
import { FaBox, FaTruck, FaMoneyBill, FaUser, FaBell, FaMapMarkerAlt, FaFileAlt, FaStar, FaSearch, FaQuestionCircle, FaArrowRight, FaCalculator, FaClock, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useShipments } from '../context/ShipmentContext';

const SendPackageSection = () => {
  const navigate = useNavigate();
  
  return (
    <div className="service-section">
      <h2>Send Package</h2>
      <div className="service-cards">
        <div className="service-card">
          <FaBox className="card-icon" />
          <h3>Domestic Shipping</h3>
          <p>Send packages anywhere within the country</p>
          <button onClick={() => navigate('/send-package')}>
            Send Now
          </button>
        </div>
        <div className="service-card">
          <FaTruck className="card-icon" />
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
    <div className="service-section">
      <h2>Schedule a Pickup</h2>
      <div className="pickup-scheduler">
        <div className="scheduler-card">
          <FaClock className="card-icon" />
          <h3>Plan Your Pickup</h3>
          <div className="scheduler-form">
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
  const navigate = useNavigate();
  return (
    <div className="calculator-section">
      <h2>Shipping Calculator</h2>
      <div className="calculator-card">
        <FaCalculator className="card-icon" />
        <p>Calculate shipping costs instantly</p>
        <button onClick={() => navigate('/calculator')}>
          Calculate Now
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null); // Add error state

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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    address: '',
    balance: 0
  });
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [faqSearch, setFaqSearch] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const { stats } = useShipments();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        setIsAuthenticated(true);
        Promise.all([
            fetchProfile(),
            fetchOrders(),
            fetchNotifications(),
            fetchWalletBalance()
        ])
        .then(() => setLoading(false))
        .catch(err => {
            setError(err.message);
            setLoading(false);
        });
    } else {
        setLoading(false);
    }
  }, [user]);

  // Safe navigation function
  const handleNavigation = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  
  useEffect(() => {
    setCustomerData(user);
  }, [user]);
  const fetchProfile = async () => {
    // try {
    //   // Get customer ID from localStorage or another source
    //   const customerId = localStorage.getItem('userId');
      
    //   const response = await axios.get(
    //     `http://localhost:4000/api/customers/1`,
    //     {
    //       headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    //     }
    //   );
      
    //   setCustomerData(response.data);
    //   setError(null);
    // } catch (err) {
    //   console.error('Profile fetch failed:', err);
    //   setError(err.response?.data?.message || 'Failed to fetch profile');
    //   setCustomerData(null);
    // }
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
      const response = await axios.get('http://localhost:4000/api/customer/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(response.data);
    } catch (err) {
      console.error('Orders fetch failed:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/customer/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Notifications fetch failed:', err);
    }
  };

  const fetchWalletBalance = async () => {
    try {
        const response = await axios.get(
            `http://localhost:4000/api/customer/${user.id}/wallet`,
            { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
        );
        setWalletBalance(response.data.balance);
    } catch (err) {
        console.error('Failed to fetch wallet balance', err);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/customer/feedback', {
        feedback,
        rating
      });
      setFeedback('');
      setRating(0);
    } catch (err) {
      console.error('Feedback submission failed:', err);
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
      answer: "Holiday schedules are posted a month in advance. Express services remain available on selected holidays." },
    
    { question: "How do I handle return shipments?", 
      answer: "Generate a return label through your account or contact customer support. Return shipping rates may vary." },
    
    { question: "What's the process for filing a complaint?", 
      answer: "Submit complaints through your account or contact customer support with relevant details and tracking numbers." },
    
    { question: "Do you offer mail forwarding services?", 
      answer: "Yes, set up mail forwarding through your account or at any post office. Service available for 3, 6, or 12 months." },
    
    { question: "How do I update my account information?", 
      answer: "Log into your account and visit Profile Settings to update personal information, addresses, and preferences." },
    
    { question: "What are your green shipping options?", 
      answer: "We offer eco-friendly packaging and carbon-neutral delivery options at a small additional cost." },
    
    { question: "How can I track multiple packages?", 
      answer: "Business accounts can use bulk tracking. Regular users can track up to 10 packages simultaneously." },
    
    { question: "What's your signature requirement policy?", 
      answer: "High-value packages and express deliveries require signatures. You can request signature service for any package." },
    
    { question: "Do you offer same-day delivery?", 
      answer: "Same-day delivery is available in select cities for packages booked before 10 AM." },
    
    { question: "How do I get delivery notifications?", 
      answer: "Enable SMS and email notifications in your account settings for real-time delivery updates." },
    
    { question: "What's your inclement weather policy?", 
      answer: "Deliveries may be delayed during severe weather. Check our service alerts page for updates." }
  ];

  const BeforeLoginView = () => (
    <div className="home-guest-container" style={cssVariables}>
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome to E-Post Office</h1>
            <p>Experience seamless postal services with modern technology. Track packages, pay bills, and manage all your postal needs in one place.</p>
            <div className="cta-buttons">
              <Link to="/register" className="cta-btn primary">Get Started</Link>
              <Link to="/services" className="cta-btn secondary">Explore Services</Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="./assets/hero-illustration.png" alt="E-Post Office Services" />
          </div>
        </div>
      </section>
  
      <section className="features-section">
        <div className="section-title">
          <h2>Why Choose E-Post Office?</h2>
          <p>Discover the advantages of our digital postal services</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <FaTruck className="feature-icon" />
            <h3>Real-Time Tracking</h3>
            <p>Track your packages instantly with our advanced tracking system</p>
          </div>
          <div className="feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Secure Services</h3>
            <p>Your parcels and documents are protected with utmost security</p>
          </div>
          <div className="feature-card">
            <FaClock className="feature-icon" />
            <h3>24/7 Access</h3>
            <p>Manage your postal needs anytime, anywhere</p>
          </div>
        </div>
      </section>
  
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">5M+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Daily Deliveries</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Post Offices</div>
          </div>
        </div>
      </section>
    </div>
  );

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return isAuthenticated ? (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="profile-section">
          <FaUser className="profile-icon" />
          <div className="profile-info">
            <h1>Welcome back, {customerData?.name}</h1>
            <p>{customerData?.email}</p>
            <p><FaMapMarkerAlt /> {customerData?.address}</p>
          </div>
        </div>
        <div className="balance-section">
          <h3>Wallet Balance</h3>
          <p className="balance-amount">${walletBalance?.toFixed(2)}</p>
        </div>
      </header>
{/* 
      <section className="quick-actions">
        <div className="tracking-box">
          <input 
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
          />
          <button className="track-btn">Track Package</button>
        </div>
        <button className="action-btn send-btn">Send Package</button>
        <button className="action-btn pay-btn">Pay Bills</button>
      </section> */}

      <section className="stats-overview">
        <div className="stat-card">
          <FaBox className="stat-icon" />
          <div className="stat-info">
            <h3>Active Orders</h3>
            <p>{stats.active}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaTruck className="stat-icon" />
          <div className="stat-info">
            <h3>In Transit</h3>
            <p>{stats.transit}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaCheckCircle className="stat-icon" />
          <div className="stat-info">
            <h3>Completed</h3>
            <p>{stats.delivered}</p>
          </div>
        </div>
      </section>

      <div className="services-container">
        <SendPackageSection />
        <PickupSection />
        <ShippingCalculator />
      </div>

      <section className="services-highlights">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <FaTruck className="service-icon" />
            <h3>Express Delivery</h3>
            <p>Next-day delivery guaranteed</p>
          </div>
          <div className="service-card">
            <FaBox className="service-icon" />
            <h3>Secure Packaging</h3>
            <p>Professional packaging service</p>
          </div>
          <div className="service-card">
            <FaMoneyBill className="service-icon" />
            <h3>Bill Payments</h3>
            <p>Pay utilities & more</p>
          </div>
        </div>
      </section>

      <section className="recent-activities">
        <h2>Recent Activities</h2>
        <div className="activities-grid">
          {notifications.map(notif => (
            <div key={notif.id} className="activity-card">
              <FaBell className="notif-icon" />
              <div className="notif-content">
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
                <small>{new Date(notif.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            placeholder="Search FAQs..."
          />
        </div>
        <div className="faq-list">
          {faqs
            .filter(faq => 
              faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
              faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
            )
            .map((faq, index) => (
              <div key={index} className="faq-item">
                <h4><FaQuestionCircle /> {faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
        </div>
      </section>

      <section className="feedback-section">
        <h2>Your Feedback Matters</h2>
        <form onSubmit={handleFeedbackSubmit} className="feedback-form">
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={`star-${star}`}
                className={star <= rating ? 'star active' : 'star'}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience with us..."
          />
          <button type="submit" className="submit-btn">Submit Feedback</button>
        </form>
      </section>

      <footer className="dashboard-footer">
        <div className="footer-links">
          <a onClick={handleNavigation('/help')} href="/help">Help Center</a>
          <a onClick={handleNavigation('/contact')} href="/contact">Contact Support</a>
          <a onClick={handleNavigation('/terms')} href="/terms">Terms of Service</a>
        </div>
      </footer>
    </div>
  ) : (
    <BeforeLoginView />
  );
};

export default Home;