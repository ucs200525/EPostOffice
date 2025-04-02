import React, { useState, useEffect } from 'react';
import StaffNavbar from '../components/StaffNavbar';
import styles from '../styles/Reports.module.css';
import { FaMoneyBillWave, FaBox, FaTruck, FaCheckCircle } from 'react-icons/fa';

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [reportData, setReportData] = useState({
    stats: {
      totalOrders: 0,
      completedDeliveries: 0,
      pendingDeliveries: 0,
      totalEarnings: 0,
      postOfficeRevenue: 0,
      staffEarnings: 0
    },
    deliveries: [],
    earnings: {
      today: 0,
      weekly: 0,
      monthly: 0
    }
  });

  // Staff commission percentage (30% of delivery charge)
  const STAFF_COMMISSION = 0.30;

  const fetchReportData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/staff/all`);
      const data = await response.json();

      if (data.success) {
        const orders = data.orders;
        
        // Calculate earnings and statistics safely with null checks
        const completedOrders = orders.filter(order => order.status === 'delivered');
        const totalAmount = completedOrders.reduce((sum, order) => 
          sum + (order.totalAmount || 0), 0
        );
        const staffEarnings = totalAmount * STAFF_COMMISSION;
        const postOfficeRevenue = totalAmount - staffEarnings;

        // Today's deliveries with safer date handling
        const today = new Date().toDateString();
        const todayDeliveries = orders.filter(order => 
          order.createdAt && new Date(order.createdAt).toDateString() === today
        );

        // This week's deliveries
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekDeliveries = orders.filter(order => 
          order.createdAt && new Date(order.createdAt) >= weekStart
        );

        // Transform orders with safe property access
        const transformedDeliveries = orders.map(order => ({
          id: order._id || 'N/A',
          trackingNumber: order.trackingNumber || 'N/A',
          date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
          amount: order.totalAmount || 0,
          staffEarning: (order.totalAmount || 0) * STAFF_COMMISSION,
          status: order.status || 'pending'
        }));

        setReportData({
          stats: {
            totalOrders: orders.length,
            completedDeliveries: completedOrders.length,
            pendingDeliveries: orders.filter(o => o.status !== 'delivered').length,
            totalEarnings: totalAmount,
            postOfficeRevenue,
            staffEarnings
          },
          deliveries: transformedDeliveries,
          earnings: {
            today: todayDeliveries.reduce((sum, order) => 
              sum + ((order.totalAmount || 0) * STAFF_COMMISSION), 0
            ),
            weekly: weekDeliveries.reduce((sum, order) => 
              sum + ((order.totalAmount || 0) * STAFF_COMMISSION), 0
            ),
            monthly: totalAmount * STAFF_COMMISSION
          }
        });
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  useEffect(() => {
    fetchReportData();
    const interval = setInterval(fetchReportData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [dateRange]);

  const getStatusClass = (status) => {
    return `${styles.status} ${styles[status.toLowerCase().replace(/ /g, '_')]}`;
  };

  return (
    <div className={styles.reportsContainer}>
      <StaffNavbar />
      <div className={styles.contentWrapper}>
        <div className={styles.headerSection}>
          <h1>Delivery Reports & Earnings</h1>
          <div className={styles.dateFilter}>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="daily">Today's Report</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
            </select>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.earnings}`}>
            <FaMoneyBillWave className={styles.statIcon} />
            <div className={styles.statInfo}>
              <h3>Your Earnings ({reportType})</h3>
              <p className={styles.statValue}>
                ₹{reportData.earnings[reportType === 'daily' ? 'today' : 
                   reportType === 'weekly' ? 'weekly' : 'monthly'].toFixed(2)}
              </p>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.completed}`}>
            <FaCheckCircle className={styles.statIcon} />
            <div className={styles.statInfo}>
              <h3>Completed Deliveries</h3>
              <p className={styles.statValue}>{reportData.stats.completedDeliveries}</p>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.pending}`}>
            <FaTruck className={styles.statIcon} />
            <div className={styles.statInfo}>
              <h3>Pending Deliveries</h3>
              <p className={styles.statValue}>{reportData.stats.pendingDeliveries}</p>
            </div>
          </div>
        </div>

        <div className={styles.deliveriesTable}>
          <h2>Recent Deliveries</h2>
          <table>
            <thead>
              <tr>
                <th>Tracking Number</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Your Earnings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.deliveries.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No deliveries found</td>
                </tr>
              ) : (
                reportData.deliveries.map(delivery => (
                  <tr key={delivery.id}>
                    <td>{delivery.trackingNumber}</td>
                    <td>{delivery.date}</td>
                    <td>₹{delivery.amount.toFixed(2)}</td>
                    <td>₹{delivery.staffEarning.toFixed(2)}</td>
                    <td>
                      <span className={getStatusClass(delivery.status)}>
                        {delivery.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.earningsSummary}>
          <h2>Earnings Summary</h2>
          <div className={styles.summaryContent}>
            <div className={styles.summaryItem}>
              <span>Total Deliveries Value:</span>
              <span>₹{reportData.stats.totalEarnings.toFixed(2)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Your Commission (30%):</span>
              <span>₹{reportData.stats.staffEarnings.toFixed(2)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Post Office Revenue:</span>
              <span>₹{reportData.stats.postOfficeRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
