import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import styles from '../styles/Shipments.module.css';

const Shipments = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    active: 0,
    transit: 0,
    completed: 0,
    total: 0
  });

  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token || !user?._id) {
          throw new Error('Authentication required');
        }

        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/orders/my-orders/${user._id}`,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setOrders(response.data.data || []);
          setStats(response.data.stats || {
            active: 0,
            transit: 0,
            completed: 0,
            total: 0
          });
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('Failed to fetch shipments:', error);
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchShipments();
    }
  }, [user]);

  const formatAddress = (addressDetails) => {
    if (!addressDetails) return 'N/A';
    return [addressDetails.city, addressDetails.state].filter(Boolean).join(', ');
  };

  // if (loading) return <div className={styles.loading}>Loading shipments...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.shipmentsContainer}>
      <h1>My Shipments</h1>
      
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span>Active</span>
          <strong>{stats.active}</strong>
        </div>
        <div className={styles.statItem}>
          <span>In Transit</span>
          <strong>{stats.transit}</strong>
        </div>
        <div className={styles.statItem}>
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>
        <div className={styles.statItem}>
          <span>Total</span>
          <strong>{stats.total}</strong>
        </div>
      </div>

      <div className={styles.orderList}>
        {orders.length === 0 ? (
          <div className={styles.noOrders}>
            No shipments found
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id || order.trackingNumber} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <h3>Tracking #: {order.trackingNumber}</h3>
                <span className={styles[order.status || 'pending']}>{order.status || 'pending'}</span>
              </div>
              <div className={styles.orderDetails}>
                <div className={styles.addressInfo}>
                  <p>From: {formatAddress(order?.shippingDetails?.pickupAddress)}</p>
                  <p>To: {formatAddress(order?.shippingDetails?.deliveryAddress)}</p>
                </div>
                <div className={styles.shipmentInfo}>
                  <p>Type: {order.type || 'N/A'}</p>
                  <p>Weight: {order?.shippingDetails?.weight || 'N/A'} kg</p>
                  <p>Created: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Shipments;
