import React, { useState } from 'react';
import StaffNavbar from '../components/StaffNavbar';

const Deliveries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deliveries] = useState([
    {
      id: 'DEL001',
      orderId: 'ORD001',
      customerName: 'John Doe',
      address: '123 Main St, City',
      status: 'Out for Delivery',
      expectedDate: '2024-02-06',
      assignedTo: 'Delivery Agent 1',
      trackingNumber: 'TRK123456'
    },
    {
      id: 'DEL002',
      orderId: 'ORD002',
      customerName: 'Jane Smith',
      address: '456 Oak Ave, Town',
      status: 'In Transit',
      expectedDate: '2024-02-07',
      assignedTo: 'Delivery Agent 2',
      trackingNumber: 'TRK789012'
    },
    {
      id: 'DEL003',
      orderId: 'ORD003',
      customerName: 'Mike Johnson',
      address: '789 Pine Rd, Village',
      status: 'Delivered',
      expectedDate: '2024-02-05',
      assignedTo: 'Delivery Agent 3',
      trackingNumber: 'TRK345678'
    }
  ]);

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || delivery.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="staff-dashboard">
      <StaffNavbar />
      <div className="dashboard-content">
        <div className="staff-header">
          <div className="header-left">
            <h1>Delivery Management</h1>
            <p>Track and manage deliveries</p>
          </div>
          <div className="header-actions">
            <button className="action-btn">
              <i className="fas fa-plus"></i> Assign Delivery
            </button>
          </div>
        </div>

        <div className="filter-section">
          <div className="search-bar">
            <input
              type="search"
              placeholder="Search by ID, customer, or tracking number..."
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
            <option value="pending">Pending</option>
            <option value="in transit">In Transit</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div className="table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Status</th>
                <th>Expected Date</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map(delivery => (
                <tr key={delivery.id}>
                  <td>{delivery.id}</td>
                  <td>{delivery.orderId}</td>
                  <td>{delivery.customerName}</td>
                  <td>{delivery.address}</td>
                  <td>
                    <span className={`status-badge ${delivery.status.toLowerCase().replace(' ', '-')}`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td>{delivery.expectedDate}</td>
                  <td>{delivery.assignedTo}</td>
                  <td className="action-buttons">
                    <button className="btn-track" title="Track Delivery">
                      <i className="fas fa-map-marked-alt"></i>
                    </button>
                    <button className="btn-update" title="Update Status">
                      <i className="fas fa-sync-alt"></i>
                    </button>
                    <button className="btn-details" title="View Details">
                      <i className="fas fa-info-circle"></i>
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

export default Deliveries;