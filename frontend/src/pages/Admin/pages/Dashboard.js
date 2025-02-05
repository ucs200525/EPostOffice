import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStaff: 25,
    activeCustomers: 1250,
    totalRevenue: 150000,
    pendingApprovals: 8,
    totalOrders: 450,
    completedOrders: 380,
    pendingOrders: 70,
    monthlyGrowth: 15
  });

  const [notifications, setNotifications] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(false);

  const headerStats = {
    todayOrders: 45,
    pendingDeliveries: 12,
    activeStaff: 18,
    systemStatus: 'Operational'
  };

  const analyticsData = {
    revenueData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue (₹)',
        data: [30000, 45000, 55000, 60000, 75000, 85000],
        borderColor: '#4f46e5',
        tension: 0.4
      }]
    },
    orderData: {
      labels: ['Completed', 'Pending', 'Cancelled'],
      datasets: [{
        data: [380, 70, 20],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336']
      }]
    },
    serviceUsageData: {
      labels: ['Express', 'Standard', 'Economy', 'International'],
      datasets: [{
        data: [35, 25, 20, 20],
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444']
      }]
    }
  };

  const handleTimeRangeChange = (range) => {
    setIsLoading(true);
    setSelectedTimeRange(range);
    setTimeout(() => setIsLoading(false), 800);
  };

  const quickActions = [
    {
      id: 1,
      title: 'Add Staff',
      icon: 'user-plus',
      color: '#4f46e5',
      description: 'Create new staff account',
      link: '/admin/staff'
    },
    {
      id: 2,
      title: 'Manage Services',
      icon: 'cogs',
      color: '#10b981',
      description: 'Update service offerings',
      link: '/admin/services'
    },
    {
      id: 3,
      title: 'View Reports',
      icon: 'chart-bar',
      color: '#f59e0b',
      description: 'Analytics & statistics',
      link: '/admin/reports'
    },
    {
      id: 4,
      title: 'System Backup',
      icon: 'database',
      color: '#6366f1',
      description: 'Backup system data',
      action: () => console.log('Backup initiated')
    },
    {
      id: 5,
      title: 'Notifications',
      icon: 'bell',
      color: '#ef4444',
      description: 'Manage alerts',
      badge: '3'
    },
    {
      id: 6,
      title: 'Settings',
      icon: 'cog',
      color: '#8b5cf6',
      description: 'System configuration',
      link: '/admin/settings'
    }
  ];

  return (
    <div className="admin-dashboard">
      <AdminNavbar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-left">
            <div className="welcome-section">
              <h1>Admin Dashboard</h1>
              <p>Welcome back, Administrator</p>
            </div>
            <div className="date-time">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div className="header-stats">
            <div className="header-stat-item">
              <i className="fas fa-box"></i>
              <div className="stat-details">
                <span className="stat-label">Today's Orders</span>
                <span className="stat-value">{headerStats.todayOrders}</span>
              </div>
            </div>
            <div className="header-stat-item">
              <i className="fas fa-truck"></i>
              <div className="stat-details">
                <span className="stat-label">Pending Deliveries</span>
                <span className="stat-value">{headerStats.pendingDeliveries}</span>
              </div>
            </div>
            <div className="header-stat-item">
              <i className="fas fa-user-check"></i>
              <div className="stat-details">
                <span className="stat-label">Active Staff</span>
                <span className="stat-value">{headerStats.activeStaff}</span>
              </div>
            </div>
            <div className="header-stat-item">
              <i className={`fas fa-circle ${headerStats.systemStatus.toLowerCase() === 'operational' ? 'text-success' : 'text-warning'}`}></i>
              <div className="stat-details">
                <span className="stat-label">System Status</span>
                <span className="stat-value">{headerStats.systemStatus}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="time-range-selector">
          <button 
            className={`range-btn ${selectedTimeRange === 'week' ? 'active' : ''}`}
            onClick={() => handleTimeRangeChange('week')}
          >
            Week
          </button>
          <button 
            className={`range-btn ${selectedTimeRange === 'month' ? 'active' : ''}`}
            onClick={() => handleTimeRangeChange('month')}
          >
            Month
          </button>
          <button 
            className={`range-btn ${selectedTimeRange === 'year' ? 'active' : ''}`}
            onClick={() => handleTimeRangeChange('year')}
          >
            Year
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card highlight">
            <i className="fas fa-chart-line"></i>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-number">₹{stats.totalRevenue.toLocaleString()}</p>
              <span className="stat-growth">+{stats.monthlyGrowth}% from last month</span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-users"></i>
            <div className="stat-content">
              <h3>Active Customers</h3>
              <p className="stat-number">{stats.activeCustomers.toLocaleString()}</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-shipping-fast"></i>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-number">{stats.totalOrders}</p>
              <span className="completion-rate">
                {Math.round((stats.completedOrders/stats.totalOrders) * 100)}% completion rate
              </span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-user-shield"></i>
            <div className="stat-content">
              <h3>Staff Members</h3>
              <p className="stat-number">{stats.totalStaff}</p>
            </div>
          </div>
          <div className="stat-card performance">
            <i className="fas fa-chart-pie"></i>
            <div className="stat-content">
              <h3>System Performance</h3>
              <p className="stat-number">98.5%</p>
              <span className="stat-label">Uptime</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="chart-container">
            <h2>Revenue Analytics</h2>
            <Line data={analyticsData.revenueData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Monthly Revenue Trend' }
              }
            }} />
          </div>

          <div className="chart-container">
            <h2>Order Statistics</h2>
            <Bar data={analyticsData.orderData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Order Distribution' }
              }
            }} />
          </div>

          <div className="chart-container services">
            <h2>Service Distribution</h2>
            <Doughnut data={analyticsData.serviceUsageData} options={{
              responsive: true,
              plugins: {
                legend: { position: 'right' }
              }
            }} />
          </div>

          <div className="recent-activities">
            <h2>System Alerts</h2>
            <div className="alert-list">
              {[
                { type: 'warning', message: 'System maintenance scheduled for tonight' },
                { type: 'success', message: 'Daily backup completed successfully' },
                { type: 'error', message: 'Failed delivery attempts: 3 packages' }
              ].map((alert, index) => (
                <div key={index} className={`alert-item ${alert.type}`}>
                  <i className={`fas fa-${alert.type === 'warning' ? 'exclamation-triangle' : 
                                       alert.type === 'success' ? 'check-circle' : 'times-circle'}`}></i>
                  <p>{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="performance-metrics">
            <h2>Performance Metrics</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Average Response Time</h3>
                <p className="metric-value">2.5s</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="metric-card">
                <h3>Customer Satisfaction</h3>
                <p className="metric-value">4.8/5.0</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="quick-actions-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
              <p>Frequently used administrative tools</p>
            </div>
            <div className="quick-actions-grid">
              {quickActions.map(action => (
                <div 
                  key={action.id} 
                  className="quick-action-card"
                  onClick={() => action.link ? navigate(action.link) : action.action?.()}
                >
                  <div className="action-icon" style={{ backgroundColor: action.color }}>
                    <i className={`fas fa-${action.icon}`}></i>
                    {action.badge && <span className="action-badge">{action.badge}</span>}
                  </div>
                  <div className="action-content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  <div className="action-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
