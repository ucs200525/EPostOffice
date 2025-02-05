import React, { useState } from 'react';
import StaffNavbar from '../components/StaffNavbar';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders] = useState([
    {
      id: 'ORD001',
      customerName: 'John Doe',
      type: 'Regular Mail',
      status: 'Processing',
      date: '2024-02-05',
      amount: 250,
      priority: 'Normal'
    },
    {
      id: 'ORD002',
      customerName: 'Jane Smith',
      type: 'Express Delivery',
      status: 'In Transit',
      date: '2024-02-04',
      amount: 500,
      priority: 'High'
    },
    {
      id: 'ORD003',
      customerName: 'Mike Johnson',
      type: 'Package',
      status: 'Delivered',
      date: '2024-02-03',
      amount: 750,
      priority: 'Normal'
    }
  ]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="staff-dashboard">
      <StaffNavbar />
      <div className="dashboard-content">
        <div className="staff-header">
          <div className="header-left">
            <h1>Order Management</h1>
            <p>View and manage all orders</p>
          </div>
          <button className="action-btn">
            <i className="fas fa-plus"></i> Create New Order
          </button>
        </div>

        <div className="filter-section">
          <div className="search-bar">
            <input
              type="search"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="processing">Processing</option>
            <option value="in transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div className="table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.type}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase().replace(' ', '-')}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.date}</td>
                  <td>₹{order.amount}</td>
                  <td>
                    <span className={`priority-badge ${order.priority.toLowerCase()}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="btn-view" title="View Details">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="btn-edit" title="Edit Order">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn-track" title="Track Order">
                      <i className="fas fa-map-marker-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
