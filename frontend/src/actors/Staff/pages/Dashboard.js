import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import styles from '../styles/StaffDashboard.module.css';
import { FaUserCircle, FaMapMarkerAlt, FaPhone, FaClock, FaCalendarAlt } from 'react-icons/fa';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [staffStats, setStaffStats] = useState({
    deliveriesCompleted: 0,
    pendingDeliveries: 0,
    customerRating: 0,
    todaysTasks: []
  });

  useEffect(() => {
    const fetchStaffStats = async () => {
      try {
        // Temporary mock data until backend is connected
        setStaffStats({
          deliveriesCompleted: 150,
          pendingDeliveries: 5,
          customerRating: 4.8,
          todaysTasks: [
            {
              type: 'Delivery',
              status: 'Pending',
              scheduledTime: '10:00 AM',
              location: '123 Main St',
              description: 'Package delivery'
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching staff stats:', error);
      }
    };

    fetchStaffStats();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.profileSection}>
          <div className={styles.profileHeader}>
            <FaUserCircle className={styles.avatar} />
            <div className={styles.profileInfo}>
              <h2>{user?.name || 'Staff Member'}</h2>
              <p className={styles.staffId}>ID: {user?.staffId || 'ST-001'}</p>
            </div>
          </div>
          
          <div className={styles.contactInfo}>
            <div className={styles.infoItem}>
              <FaMapMarkerAlt />
              <span>{user?.address || 'Main Branch'}</span>
            </div>
            <div className={styles.infoItem}>
              <FaPhone />
              <span>{user?.phone || 'Not provided'}</span>
            </div>
            <div className={styles.infoItem}>
              <FaClock />
              <span>Regular Shift</span>
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Completed Deliveries</h3>
            <p className={styles.statValue}>{staffStats.deliveriesCompleted}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Pending Deliveries</h3>
            <p className={styles.statValue}>{staffStats.pendingDeliveries}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Customer Rating</h3>
            <p className={styles.statValue}>{staffStats.customerRating.toFixed(1)}/5.0</p>
          </div>
        </div>

        <div className={styles.tasksSection}>
          <h3>Today's Tasks</h3>
          <div className={styles.tasksList}>
            {staffStats.todaysTasks.map((task, index) => (
              <div key={index} className={styles.taskCard}>
                <div className={styles.taskHeader}>
                  <h4>{task.type}</h4>
                  <span className={`${styles.status} ${styles[task.status.toLowerCase()]}`}>
                    {task.status}
                  </span>
                </div>
                <div className={styles.taskDetails}>
                  <p><strong>Time:</strong> {task.scheduledTime}</p>
                  <p><strong>Location:</strong> {task.location}</p>
                  <p><strong>Details:</strong> {task.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
