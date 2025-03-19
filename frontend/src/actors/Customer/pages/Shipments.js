import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaTruck, FaCheck, FaArrowRight } from 'react-icons/fa';
import styles from '../styles/Shipments.module.css';

const Shipments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    active: 0,
    transit: 0,
    completed: 0,
    total: 0
  });
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => {
    if (user) {
      setCustomerData(user);
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setCustomerData(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token || !customerData?.id) {
          throw new Error('Authentication required');
        }

        console.log('Fetching orders for customer:', customerData.id);
        
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/orders/my-orders/${customerData.id}`,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Orders response:', response.data);

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

    if (customerData?.id) {
      fetchShipments();
    }
  }, [customerData?.id]);

  const formatAddress = (addressDetails) => {
    if (!addressDetails || typeof addressDetails !== 'object') return 'N/A';
    return [addressDetails.street, addressDetails.city, addressDetails.state, addressDetails.zipcode, addressDetails.country]
      .filter(Boolean)
      .join(', ');
  };

  const handleTrackOrder = (trackingNumber) => {
    navigate(`/track?number=${trackingNumber}`);
  };

  if (loading) return <div className={styles.loading}>Loading shipments...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.shipmentsContainer}>
      <h1>My Orders</h1>
      
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
            <FaBox className={styles.emptyIcon} />
            <p>You haven't placed any orders yet</p>
            <button onClick={() => navigate('/send-package')}>Send a Package</button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.trackingInfo}>
                  <span>Tracking Number</span>
                  <strong>{order.trackingNumber}</strong>
                </div>
                <span className={`${styles.status} ${styles[order.status || 'pending']}`}>
                  {order.status || 'Pending'}
                </span>
              </div>

              <div className={styles.orderDetails}>
                <div className={styles.section}>
                  <h3>From</h3>
                  <p>{order.pickupAddress?.name}</p>
                  <p>{formatAddress(order.pickupAddress)}</p>
                </div>

                <div className={styles.section}>
                  <h3>To</h3>
                  <p>{order.shippingAddress?.name}</p>
                  <p>{formatAddress(order.shippingAddress)}</p>
                </div>

                <div className={styles.section}>
                  <h3>Package Details</h3>
                  <p><strong>Type:</strong> {order.packageDetails?.type}</p>
                  <p><strong>Weight:</strong> {order.packageDetails?.weight} kg</p>
                  <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className={styles.orderActions}>
                <button 
                  onClick={() => handleTrackOrder(order.trackingNumber)}
                  className={styles.trackButton}
                >
                  <FaTruck /> Track Shipment <FaArrowRight />
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
