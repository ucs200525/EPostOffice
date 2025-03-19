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
        const { tracking } = response.data;
        const transformedOrder = {
          ...tracking,
          status: tracking.status,
          type: tracking.packageDetails.type,
          shippingDetails: {
            senderAddress: `${tracking.addresses.pickup.street}, ${tracking.addresses.pickup.city}`,
            receiverAddress: `${tracking.addresses.delivery.street}, ${tracking.addresses.delivery.city}`
          },
          timeline: tracking.history.map(event => ({
            status: event.status,
            timestamp: event.timestamp,
            description: event.status,
            location: event.location
          })),
          packageDetails: tracking.packageDetails,
          currentLocation: tracking.currentLocation,
          estimatedDelivery: tracking.estimatedDelivery,
          progress: tracking.progress,
          cost: tracking.orderDetails?.cost || {}
        };
        setOrder(transformedOrder);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressWidth = (progress) => {
    return `${Math.min(progress * 100, 100)}%`;
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
            <h2>Tracking Number: {order.trackingNumber}</h2>
            <div className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
              {getStatusIcon(order.status)}
              <span>{order.status}</span>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${getProgressWidth(order.progress)}` }}
            />
          </div>

          <div className={styles.deliveryInfo}>
            <div className={styles.currentLocation}>
              <h4>Current Location</h4>
              <p><FaMapMarkerAlt /> {order.currentLocation}</p>
            </div>
            <div className={styles.packageDetails}>
              <h4>Package Details</h4>
              <p>Type: {order.packageDetails?.type}</p>
              <p>Weight: {order.packageDetails?.weight} kg</p>
            </div>
            <div className={styles.deliveryDate}>
              <h4>Estimated Delivery</h4>
              <p><FaCalendar /> {formatDate(order.estimatedDelivery)}</p>
            </div>
          </div>

          <div className={styles.addressSection}>
            <div className={styles.address}>
              <h4>From</h4>
              <p>{order.addresses.pickup.label}</p>
              <p>{order.addresses.pickup.street}</p>
              <p>{order.addresses.pickup.city}, {order.addresses.pickup.state} {order.addresses.pickup.pincode}</p>
            </div>
            <div className={styles.address}>
              <h4>To</h4>
              <p>{order.addresses.delivery.label}</p>
              <p>{order.addresses.delivery.street}</p>
              <p>{order.addresses.delivery.city}, {order.addresses.delivery.state} {order.addresses.delivery.pincode}</p>
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
                    <span>{formatDate(event.timestamp)}</span>
                  </div>
                  <p className={styles.location}>
                    <FaMapMarkerAlt /> {event.location}
                  </p>
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