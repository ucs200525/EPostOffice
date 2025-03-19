import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import styles from '../styles/StaffDashboard.module.css';
import { FaUserCircle, FaMapMarkerAlt, FaPhone, FaClock, FaBox, FaTruck, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import StaffNavbar from '../components/StaffNavbar';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    deliveriesCompleted: 0,
    pendingDeliveries: 0,
    inTransitDeliveries: 0,
    totalOrders: 0,
    todaysTasks: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders summary
      const ordersResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/staff/all`);
      const ordersData = await ordersResponse.json();

      if (ordersData.success) {
        const orders = ordersData.orders;
        setDashboardStats({
          deliveriesCompleted: orders.filter(order => order.status === 'delivered').length,
          pendingDeliveries: orders.filter(order => order.status === 'pending').length,
          inTransitDeliveries: orders.filter(order => 
            order.status === 'in_transit' || order.status === 'out_for_delivery'
          ).length,
          totalOrders: orders.length,
          todaysTasks: orders.filter(order => {
            const today = new Date().toDateString();
            const orderDate = new Date(order.createdAt).toDateString();
            return orderDate === today;
          })
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading dashboard data...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <StaffNavbar />
      <div className={styles.contentWrapper}>
        <div className={styles.profileSection}>
          <div className={styles.profileHeader}>
            <FaUserCircle className={styles.avatar} />
            <div className={styles.profileInfo}>
              <h2>{user?.name || 'Staff Member'}</h2>
              <p className={styles.staffId}>ID: {user?.staffId || 'ST-001'}</p>
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.pending}`}>
            <FaBox className={styles.statIcon} />
            <div className={styles.statInfo}>
              <h3>Pending Orders</h3>
              <p className={styles.statValue}>{dashboardStats.pendingDeliveries}</p>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.inTransit}`}>
            <FaTruck className={styles.statIcon} />
            <div className={styles.statInfo}>
              <h3>In Transit</h3>
              <p className={styles.statValue}>{dashboardStats.inTransitDeliveries}</p>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.completed}`}>
            <FaCheckCircle className={styles.statIcon} />
            <div className={styles.statInfo}>
              <h3>Completed</h3>
              <p className={styles.statValue}>{dashboardStats.deliveriesCompleted}</p>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.total}`}>
            <FaExclamationTriangle className={styles.statIcon} />
            <div className={styles.statInfo}>
              <h3>Total Orders</h3>
              <p className={styles.statValue}>{dashboardStats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className={styles.tasksSection}>
          <h3>Today's Tasks ({dashboardStats.todaysTasks.length})</h3>
          <div className={styles.tasksList}>
            {dashboardStats.todaysTasks.length === 0 ? (
              <p className={styles.noTasks}>No tasks for today</p>
            ) : (
              dashboardStats.todaysTasks.map((task, index) => (
                <div key={task._id || index} className={styles.taskCard}>
                  <div className={styles.taskHeader}>
                    <h4>Order #{task.trackingNumber}</h4>
                    <span className={`${styles.status} ${styles[task.status]}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className={styles.taskDetails}>
                    <p><strong>Type:</strong> {task.orderType}</p>
                    <p><strong>Amount:</strong> ₹{task.totalAmount}</p>
                    <p><strong>Created:</strong> {new Date(task.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
