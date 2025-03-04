import React from 'react';
import { FaBox, FaTruck, FaCheck, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import styles from './TrackingDetails.module.css';

const TrackingDetails = ({ tracking }) => {
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <FaCheck className={styles.iconDelivered} />;
      case 'in transit': return <FaTruck className={styles.iconTransit} />;
      case 'out for delivery': return <FaTruck className={styles.iconOutForDelivery} />;
      default: return <FaBox className={styles.iconPending} />;
    }
  };

  return (
    <div className={styles.trackingContainer}>
      <div className={styles.statusHeader}>
        <div className={styles.currentStatus}>
          {getStatusIcon(tracking.status)}
          <h3>{tracking.status}</h3>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progress} 
            style={{ width: `${tracking.progress}%` }}
          />
        </div>
      </div>

      <div className={styles.deliveryInfo}>
        <div className={styles.infoItem}>
          <FaMapMarkerAlt />
          <span>Current Location:</span>
          <strong>{tracking.currentLocation}</strong>
        </div>
        <div className={styles.infoItem}>
          <FaClock />
          <span>Estimated Delivery:</span>
          <strong>{new Date(tracking.estimatedDelivery).toLocaleDateString()}</strong>
        </div>
      </div>

      <div className={styles.timeline}>
        {tracking.history.map((event, index) => (
          <div key={index} className={styles.timelineItem}>
            <div className={styles.timelineIcon}>
              {getStatusIcon(event.status)}
            </div>
            <div className={styles.timelineContent}>
              <h4>{event.status}</h4>
              <p>{event.location}</p>
              <span>{new Date(event.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingDetails;
