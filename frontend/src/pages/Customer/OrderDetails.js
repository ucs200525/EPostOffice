import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBox, FaTruck, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import styles from './styles/OrderDetails.module.css';
import Notification from '../../components/Notification';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:4000/api/orders/${orderId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to fetch order details'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className={styles.notFound}>
        <FaBox className={styles.icon} />
        <h2>Order Not Found</h2>
        <p>The order you are looking for does not exist.</p>
        <button onClick={() => navigate('/shipments')}>
          View All Orders
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {notification && (
        <Notification
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}

      <div className={styles.header}>
        <button
          onClick={() => navigate('/shipments')}
          className={styles.backButton}
        >
          <FaArrowLeft /> Back to Shipments
        </button>
        <h1>Order Details</h1>
      </div>

      <div className={styles.orderCard}>
        <div className={styles.section}>
          <h2><FaBox /> Order Information</h2>
          <div className={styles.orderInfo}>
            <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
            <p><strong>Status:</strong> <span className={styles[order.status]}>{order.status}</span></p>
            <p><strong>Type:</strong> {order.type}</p>
            <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2><FaMapMarkerAlt /> Shipping Details</h2>
          <div className={styles.addressGrid}>
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

        <div className={styles.section}>
          <h2><FaTruck /> Package Information</h2>
          <div className={styles.packageDetails}>
            <div className={styles.detail}>
              <span>Type</span>
              <strong>{order.type}</strong>
            </div>
            <div className={styles.detail}>
              <span>Weight</span>
              <strong>{order.shippingDetails?.packageInfo?.weight} kg</strong>
            </div>
            <div className={styles.detail}>
              <span>Created</span>
              <strong>
                <FaCalendarAlt className={styles.icon} />
                {new Date(order.createdAt).toLocaleDateString()}
              </strong>
            </div>
          </div>
        </div>

        {order.timeline && order.timeline.length > 0 && (
          <div className={styles.section}>
            <h2>Tracking History</h2>
            <div className={styles.timeline}>
              {order.timeline.map((event, index) => (
                <div key={index} className={styles.timelineEvent}>
                  <div className={styles.timelineIcon} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timestamp}>
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                    <h3>{event.status}</h3>
                    <p>{event.description}</p>
                    {event.location && (
                      <span className={styles.location}>{event.location}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
