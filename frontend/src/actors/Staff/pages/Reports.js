import React, { useState } from 'react';
import StaffNavbar from '../components/StaffNavbar';

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [reportData] = useState({
    stats: {
      totalOrders: 45,
      completedDeliveries: 38,
      pendingDeliveries: 7,
      revenue: 12500
    },
    topPerformers: [
      { name: 'John Doe', deliveries: 15, rating: 4.8 },
      { name: 'Jane Smith', deliveries: 12, rating: 4.7 },
      { name: 'Mike Johnson', deliveries: 11, rating: 4.6 }
    ],
    recentTransactions: [
      { id: 'TRX001', amount: 500, date: '2024-02-05', status: 'Completed' },
      { id: 'TRX002', amount: 750, date: '2024-02-04', status: 'Processing' },
      { id: 'TRX003', amount: 300, date: '2024-02-03', status: 'Completed' }
    ]
  });

  const handleExportReport = () => {
    // Add export functionality here
    console.log('Exporting report...');
  };

  return (
    <div className="staff-dashboard">
      <StaffNavbar />
      <div className="dashboard-content">
        <div className="staff-header">
          <div className="header-left">
            <h1>Reports & Analytics</h1>
            <p>View and generate reports</p>
          </div>
          <div className="header-actions">
            <button className="action-btn" onClick={handleExportReport}>
              <i className="fas fa-download"></i> Export Report
            </button>
          </div>
        </div>

        <div className="report-filters">
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="report-type-select"
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="custom">Custom Range</option>
          </select>

          <div className="date-range">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        <div className="reports-grid">
          <div className="report-card">
            <h3>Delivery Statistics</h3>
            <div className="stats-content">
              <div className="stat-item">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">{reportData.stats.totalOrders}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{reportData.stats.completedDeliveries}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{reportData.stats.pendingDeliveries}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Revenue</span>
                <span className="stat-value">₹{reportData.stats.revenue}</span>
              </div>
            </div>
          </div>

          <div className="report-card">
            <h3>Top Performers</h3>
            <table className="performers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Deliveries</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topPerformers.map((performer, index) => (
                  <tr key={index}>
                    <td>{performer.name}</td>
                    <td>{performer.deliveries}</td>
                    <td>{performer.rating}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-card">
            <h3>Recent Transactions</h3>
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.recentTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{transaction.id}</td>
                    <td>₹{transaction.amount}</td>
                    <td>{transaction.date}</td>
                    <td>
                      <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
