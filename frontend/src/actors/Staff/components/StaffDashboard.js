import React from 'react';

const StaffDashboard = () => {
  const stats = {
    pendingOrders: 15,
    deliveredToday: 25,
    activeCustomers: 150,
    totalOrders: 45
  };
  
  return (
    <div className="dashboard-container">
      <h2>Welcome, Staff Member</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p>{stats.pendingOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Delivered Today</h3>
          <p>{stats.deliveredToday}</p>
        </div>
        <div className="stat-card">
          <h3>Active Customers</h3>
          <p>{stats.activeCustomers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{stats.totalOrders}</p>
        </div>
      </div>

      <div className="recent-activities">
        <h3>Recent Activities</h3>
        <div className="activity-list">
          {/* Activity items would be mapped here */}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
