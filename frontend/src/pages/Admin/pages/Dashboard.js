import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext'; // Fix import path
import AdminNavbar from '../components/AdminNavbar';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { FaUserCircle, FaEdit, FaCog } from 'react-icons/fa';
import { FaBox, FaTruck, FaUsers, FaClipboardList } from 'react-icons/fa';
import styles from '../styles/AdminDashboard.module.css';

const QuickActions = ({ actions, onActionClick }) => {
  return (
    <div className={styles.quickActionsContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <p className={styles.sectionSubtitle}>Frequently used administrative tools</p>
      </div>
      <div className={styles.quickActionsGrid}>
        {actions.map(action => (
          <div 
            key={action.id} 
            className={styles.actionCard}
            onClick={() => onActionClick(action)}
          >
            <div 
              className={styles.actionIcon} 
              style={{ backgroundColor: action.color }}
            >
              <i className={`fas fa-${action.icon}`}></i>
              {action.badge && (
                <span className={styles.actionBadge}>
                  {action.badge}
                </span>
              )}
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>{action.title}</h3>
              <p className={styles.actionDescription}>{action.description}</p>
            </div>
            <div className={styles.actionArrow}>
              <i className="fas fa-chevron-right"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate(); // Add this
  const { user } = useAuth(); // Add this line to get admin details
  
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

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

  const recentActivities = [
    { id: 1, type: 'New Staff', message: 'New staff member registered', time: '2 hours ago' },
    { id: 2, type: 'Order', message: 'Bulk order processed', time: '3 hours ago' },
    { id: 3, type: 'System', message: 'Daily backup completed', time: '5 hours ago' }
  ];

  // Create an array of stats for mapping
  const statsData = [
    { 
      id: 1, 
      label: 'Total Revenue', 
      value: `₹${stats.totalRevenue.toLocaleString()}`, 
      icon: <FaBox className={styles.pendingIcon} />,
      growth: `+${stats.monthlyGrowth}% from last month`
    },
    { 
      id: 2, 
      label: 'Active Customers', 
      value: stats.activeCustomers.toLocaleString(), 
      icon: <FaUsers className={styles.customersIcon} />
    },
    { 
      id: 3, 
      label: 'Total Orders', 
      value: stats.totalOrders, 
      icon: <FaTruck className={styles.completedIcon} />,
      subText: `${Math.round((stats.completedOrders/stats.totalOrders) * 100)}% completion rate`
    },
    { 
      id: 4, 
      label: 'Staff Members', 
      value: stats.totalStaff, 
      icon: <FaClipboardList className={styles.tasksIcon} />
    }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true, // Change to true
    aspectRatio: 2, // Add fixed aspect ratio
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20,
          padding: 20,
          usePointStyle: true,
          font: { size: 12 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 5, // Limit number of ticks
          font: { size: 12 }
        }
      },
      x: {
        ticks: {
          font: { size: 12 }
        }
      }
    },
    layout: {
      padding: 20
    },
    animation: {
      duration: 0 // Disable animations to prevent resize loops
    }
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: [30000, 45000, 55000, 60000, 75000, 85000],
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#4f46e5',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const orderData = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [{
      data: [380, 70, 20],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
      borderRadius: 4,
      hoverOffset: 4
    }]
  };

  const handleActionClick = (action) => {
    if (action.link) {
      navigate(action.link);
    } else if (action.action) {
      action.action();
    }
  };

  return (
    <div className={styles.adminDashboard}>
      <AdminNavbar />
      <div className={styles.dashboardContent}>
        <div className={styles.adminProfileSection}>
          <div className={styles.adminDetails}>
            <FaUserCircle className={styles.adminAvatar} />
            <div className={styles.adminInfo}>
              <h2>{user?.name || 'Administrator'}</h2>
              <div className={styles.adminRole}>System Administrator</div>
            </div>
          </div>
        </div>

        <div className={styles.dashboardHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.welcomeSection}>
              <h1 className={styles.welcomeTitle}>Admin Dashboard</h1>
              <p className={styles.welcomeText}>Welcome back, {user?.name || 'Administrator'}</p>
              <div className={styles.dateTime}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>

          <div className={styles.statsGrid}>
            {statsData.map(stat => (
              <div key={stat.id} className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles[stat.iconClass]}`}>
                  {stat.icon}
                </div>
                <div className={styles.statContent}>
                  <h3 className={styles.statLabel}>{stat.label}</h3>
                  <p className={styles.statValue}>{stat.value}</p>
                  {stat.growth && <span className={styles.statGrowth}>{stat.growth}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartsContainer}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Revenue Overview</h3>
            <div className={styles.chartWrapper}>
              <Line
                data={revenueData}
                options={chartOptions}
                redraw={false} // Add this to prevent unnecessary redraws
              />
            </div>
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Order Distribution</h3>
            <div className={styles.chartWrapper}>
              <Doughnut
                data={orderData}
                options={chartOptions}
                redraw={false} // Add this to prevent unnecessary redraws
              />
            </div>
          </div>
        </div>

        <div className={styles.chartsContainer}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Revenue Analytics</h3>
            <div className={styles.chartWrapper}>
              <Line
                data={revenueData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: false
                    }
                  }
                }}
                redraw={false}
              />
            </div>
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Order Statistics</h3>
            <div className={styles.chartWrapper}>
              <Bar
                data={orderData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: false
                    },
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
                      callbacks: {
                        label: (context) => `${context.parsed.y} orders`
                      }
                    }
                  },
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      ticks: {
                        maxTicksLimit: 5,
                        callback: (value) => value,
                        font: { size: 12 }
                      }
                    }
                  }
                }}
                redraw={false}
              />
            </div>
          </div>
        </div>

        <div className={styles.metricsAndActionsContainer}>
          <div className={styles.performanceMetrics}>
            <h2 className={styles.sectionTitle}>Performance Metrics</h2>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <h3>Average Response Time</h3>
                <p className={styles.metricValue}>2.5s</p>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <h3>Customer Satisfaction</h3>
                <p className={styles.metricValue}>4.8/5.0</p>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <QuickActions 
            actions={quickActions} 
            onActionClick={handleActionClick}
          />
        </div>

        <div className={styles.statsGridContainer}>
          <h2 className={styles.sectionTitle}>Key Metrics</h2>
          <div className={styles.statsGrid}>
            {statsData.map(stat => (
              <div key={stat.id} className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles[stat.iconClass]}`}>
                  {stat.icon}
                </div>
                <div className={styles.statContent}>
                  <h3 className={styles.statLabel}>{stat.label}</h3>
                  <p className={styles.statValue}>{stat.value || '0'}</p>
                  {stat.growth && <span className={styles.statGrowth}>{stat.growth}</span>}
                  {stat.subText && (
                    <span className={styles.statSubText}>
                      {isNaN(parseInt(stat.subText)) ? '0% completion rate' : stat.subText}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
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



        <div className={styles.dashboardContent}>
          <section className={styles.recentActivity}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Recent Activity</h3>
              <button className={styles.viewAllBtn}>View All</button>
            </div>
            <div className={styles.activityList}>
              {recentActivities.map(activity => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityContent}>
                    <div className={styles.activityMessage}>{activity.message}</div>
                    <div className={styles.activityTime}>{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
