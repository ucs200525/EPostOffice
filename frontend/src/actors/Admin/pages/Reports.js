import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import '../styles/ServicesAndReports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [dateRange, setDateRange] = useState('week');

  const revenueData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Revenue',
      data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
      fill: false,
      borderColor: '#1e40af',
      tension: 0.4
    }]
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
      </div>

      <div className="reports-tabs">
        <button 
          className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue
        </button>
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`tab-button ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
      </div>

      <div className="report-filters">
        <select 
          className="filter-select"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="chart-container">
        <Line data={revenueData} options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Revenue Trends' }
          }
        }} />
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3 className="metric-label">Total Revenue</h3>
          <p className="metric-value">₹151,000</p>
          <span className="metric-trend">+12.5% vs last period</span>
        </div>
        <div className="metric-card">
          <h3 className="metric-label">Orders Processed</h3>
          <p className="metric-value">284</p>
          <span className="metric-trend">+5.3% vs last period</span>
        </div>
        <div className="metric-card">
          <h3 className="metric-label">Active Customers</h3>
          <p className="metric-value">1,203</p>
          <span className="metric-trend">+8.1% vs last period</span>
        </div>
      </div>
    </div>
  );
};

export default Reports;
