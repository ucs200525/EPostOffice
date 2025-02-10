import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa';
import axios from 'axios';
import styles from './styles/Shipments.module.css';
import Notification from '../../components/Notification';

const Shipments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:4000/api/orders/my-orders',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to fetch orders'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <FaCheckCircle className={styles.iconSuccess} />;
      case 'in-transit': return <FaTruck className={styles.iconPrimary} />;
      case 'pending': return <FaClock className={styles.iconWarning} />;
      default: return <FaBox className={styles.iconDefault} />;
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading orders...</div>;
  }

  return (
    <div className={styles.shipmentsContainer}>
      {notification && (
        <Notification
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}

      <div className={styles.header}>
        <h1>My Shipments</h1>
        <button
          onClick={() => navigate('/send-package')}
          className={styles.newShipmentButton}
        >
          New Shipment
        </button>
      </div>

      <div className={styles.ordersList}>
        {orders.length === 0 ? (
          <div className={styles.noOrders}>
            <FaBox className={styles.emptyIcon} />
            <p>No shipments found</p>
            <button onClick={() => navigate('/send-package')}>
              Send Your First Package
            </button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.trackingInfo}>
                  <span>Tracking Number:</span>
                  <strong>{order.trackingNumber}</strong>
                </div>
                <div className={`${styles.status} ${styles[order.status]}`}>
                  {getStatusIcon(order.status)}
                  <span>{order.status}</span>
                </div>
              </div>

              <div className={styles.orderDetails}>
                <div className={styles.addressInfo}>
                  <div className={styles.from}>
                    <span>From:</span>
                    <p>{order.shippingDetails?.senderAddress || 'Not specified'}</p>
                  </div>
                  <div className={styles.to}>
                    <span>To:</span>
                    <p>{order.shippingDetails?.receiverAddress || 'Not specified'}</p>
                  </div>
                </div>

                <div className={styles.packageInfo}>
                  <div>
                    <span>Type:</span>
                    <p>{order.type || 'Standard'}</p>
                  </div>
                  <div>
                    <span>Created:</span>
                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  {order.shippingDetails?.packageInfo && (
                    <div>
                      <span>Weight:</span>
                      <p>{order.shippingDetails.packageInfo.weight} kg</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  onClick={() => navigate(`/track?number=${order.trackingNumber}`)}
                  className={styles.trackButton}
                >
                  Track Package
                </button>
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className={styles.detailsButton}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Shipments;
