import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBox, FaTruck, FaCheckCircle, FaMapMarkerAlt, FaCalendar, FaClock } from 'react-icons/fa';
import axios from 'axios';
import styles from '../styles/TrackTrace.module.css';
import Notification from '../../../components/Notification';

const TrackTrace = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const number = params.get('number');
    if (number) {
      setTrackingNumber(number);
      trackPackage(number);
    }
  }, [location]);

  const trackPackage = async (number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/orders/track/${number}`
      );

      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setNotification({
          type: 'error',
          message: 'Package not found'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to track package'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber) {
      navigate(`/track?number=${trackingNumber}`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <FaCheckCircle className={styles.iconSuccess} />;
      case 'in-transit': return <FaTruck className={styles.iconPrimary} />;
      case 'processing': return <FaBox className={styles.iconWarning} />;
      default: return <FaClock className={styles.iconDefault} />;
    }
  };

  return (
    <div className={styles.trackTraceContainer}>
      {notification && (
        <Notification
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}

      <div className={styles.trackingForm}>
        <h1>Track Your Package</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Tracking...' : 'Track Package'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <FaTruck className={styles.spinningIcon} />
          <p>Tracking your package...</p>
        </div>
      ) : order ? (
        <div className={styles.trackingResult}>
          <div className={styles.orderHeader}>
            <h2>Tracking Details</h2>
            <div className={`${styles.status} ${styles[order.status]}`}>
              {getStatusIcon(order.status)}
              <span>{order.status}</span>
            </div>
          </div>

          <div className={styles.orderInfo}>
            <div className={styles.infoCard}>
              <h3><FaBox /> Package Details</h3>
              <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
              <p><strong>Type:</strong> {order.type}</p>
              <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>

            <div className={styles.infoCard}>
              <h3><FaMapMarkerAlt /> Shipping Details</h3>
              <div className={styles.addresses}>
                <div className={styles.address}>
                  <span>From</span>
                  <p>{order.shippingDetails?.senderAddress}</p>
                </div>
                <div className={styles.address}>
                  <span>To</span>
                  <p>{order.shippingDetails?.receiverAddress}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.timeline}>
            <h3>Tracking History</h3>
            {order.timeline?.map((event, index) => (
              <div key={index} className={styles.timelineEvent}>
                <div className={styles.timelineIcon}>
                  {getStatusIcon(event.status)}
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <h4>{event.status}</h4>
                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                  <p>{event.description}</p>
                  {event.location && (
                    <p className={styles.location}>
                      <FaMapMarkerAlt /> {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TrackTrace;