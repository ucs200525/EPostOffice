import React, { useState } from 'react';
import StaffNavbar from '../components/StaffNavbar';
import { Link } from 'react-router-dom';
import '../styles/StaffDashboard.css';

const Dashboard = () => {
  const [stats] = useState({
    pendingOrders: 15,
    deliveredToday: 28,
    activeCustomers: 156,
    totalRevenue: 25000,
    tasksCompleted: 45,
    efficiency: 92
  });

  const [tasks] = useState([
    { id: 1, title: 'Process Order #123', status: 'pending', priority: 'high', deadline: '2024-02-06' },
    { id: 2, title: 'Verify Customer Documents', status: 'completed', priority: 'medium', deadline: '2024-02-05' },
    { id: 3, title: 'Update Delivery Status', status: 'processing', priority: 'normal', deadline: '2024-02-07' }
  ]);

  return (
    <div className="staff-dashboard">
      <StaffNavbar />
      <div className="staff-content">
        <div className="staff-header">
          <div className="header-left">
            <h1>Staff Dashboard</h1>
            <p>Welcome back, {localStorage.getItem('staffName') || 'Staff Member'}</p>
          </div>
          <div className="current-time">
            {new Date().toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        <div className="staff-stats">
          <div className="stat-card">
            <h3>Pending Orders</h3>
            <div className="stat-value">{stats.pendingOrders}</div>
            <div className="stat-label">Needs attention</div>
          </div>
          <div className="stat-card">
            <h3>Delivered Today</h3>
            <div className="stat-value">{stats.deliveredToday}</div>
            <div className="stat-label">Successfully completed</div>
          </div>
          <div className="stat-card">
            <h3>Active Customers</h3>
            <div className="stat-value">{stats.activeCustomers}</div>
            <div className="stat-label">Current customers</div>
          </div>
          <div className="stat-card">
            <h3>Efficiency Rate</h3>
            <div className="stat-value">{stats.efficiency}%</div>
            <div className="stat-label">Task completion rate</div>
          </div>
        </div>

        <div className="staff-tasks">
          <div className="task-list">
            <h2>Today's Tasks</h2>
            {tasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p>Due: {task.deadline}</p>
                </div>
                <span className={`task-status status-${task.status}`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </div>
            ))}
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <Link to="/staff/orders/new" className="action-btn">
              <i className="fas fa-plus"></i>
              New Order
            </Link>
            <Link to="/staff/customers" className="action-btn">
              <i className="fas fa-users"></i>
              Manage Customers
            </Link>
            <Link to="/staff/deliveries" className="action-btn">
              <i className="fas fa-truck"></i>
              Track Deliveries
            </Link>
            <Link to="/staff/reports" className="action-btn">
              <i className="fas fa-chart-bar"></i>
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
