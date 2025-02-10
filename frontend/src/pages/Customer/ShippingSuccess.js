import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaBox, FaPrint, FaShare, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import styles from './styles/ShippingSuccess.module.css';
import axios from 'axios';
import Notification from '../../components/Notification';

const ShippingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [orderVerified, setOrderVerified] = useState(false);
  const { trackingNumber, shipmentDetails } = location.state || {};

  useEffect(() => {
    if (!trackingNumber) {
      navigate('/send-package');
      return;
    }
    verifyShipment();
    verifyOrder();
  }, [trackingNumber]);

  const verifyShipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:4000/api/orders/track/${trackingNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setIsVerified(true);
        setLoading(false);
      } else {
        setNotification({
          type: 'error',
          message: response.data.message || 'Verification failed'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Server error'
      });
      setLoading(false);
    }
  };

  const verifyOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:4000/api/orders/verify/${trackingNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setOrderVerified(true);
      } else {
        setNotification({
          type: 'error',
          message: 'Order verification failed'
        });
      }
    } catch (error) {
      console.error('Order verification error:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Track My Package',
          text: `Track my package with tracking number: ${trackingNumber}`,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(`Track my package: ${trackingNumber}`);
        setNotification({
          type: 'success',
          message: 'Tracking number copied to clipboard!'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to share tracking information'
      });
      console.error('Sharing failed:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Verifying your shipment...</p>
      </div>
    );
  }

  // Redirect if no tracking number
  if (!trackingNumber) {
    return null;
  }

  return (
    <div className={styles.successContainer}>
      {notification && (
        <Notification
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className={styles.successCard}>
        <div className={styles.successHeader}>
          <FaCheckCircle className={styles.successIcon} />
          <h1>Shipping Confirmed!</h1>
          <p>Your package has been successfully booked for shipping</p>
        </div>

        <div className={styles.trackingInfo}>
          <div className={styles.trackingNumber}>
            <span>Tracking Number:</span>
            <h2>{trackingNumber}</h2>
          </div>
          
          <div className={styles.estimatedDelivery}>
            <FaBox className={styles.icon} />
            <div>
              <span>Estimated Delivery</span>
              <p>{new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.printButton}
            onClick={handlePrint}
          >
            <FaPrint /> Print Label
          </button>
          
          <button 
            className={styles.shareButton}
            onClick={handleShare}
          >
            <FaShare /> Share Tracking
          </button>
          
          <button 
            className={styles.trackButton}
            onClick={() => navigate(`/track?number=${trackingNumber}`)}
          >
            Track Package <FaArrowRight />
          </button>
        </div>

        <div className={styles.nextSteps}>
          <h3>Next Steps</h3>
          <ul>
            <li>Print your shipping label</li>
            <li>Pack your item securely</li>
            <li>Drop off at any post office or schedule a pickup</li>
          </ul>
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.homeButton}
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
          {isVerified && (
            <button 
              className={styles.newShipmentButton}
              onClick={() => navigate('/send-package')}
            >
              Ship Another Package
            </button>
          )}
          {!isVerified && (
            <button 
              className={styles.retryButton}
              onClick={verifyShipment}
            >
              Retry Verification
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingSuccess;
