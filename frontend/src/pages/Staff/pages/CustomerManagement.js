import React, { useState } from 'react';
import StaffNavbar from '../components/StaffNavbar';
import { Link } from 'react-router-dom';
import '../styles/StaffDashboard.css';

const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customers] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com', 
      status: 'Active',
      orders: 5,
      joinDate: '2024-01-15'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      status: 'Pending',
      orders: 3,
      joinDate: '2024-01-20'
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      email: 'mike@example.com', 
      status: 'Active',
      orders: 8,
      joinDate: '2024-01-10'
    }
  ]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="staff-dashboard">
      <StaffNavbar />
      <div className="staff-content">
        <div className="staff-header">
          <div className="header-left">
            <h1>Customer Management</h1>
            <p>Manage and monitor customer accounts</p>
          </div>
          <button className="action-btn">
            <i className="fas fa-plus"></i>
            Add New Customer
          </button>
        </div>

        <div className="filter-section">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="search"
              placeholder="Search customers..."
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
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>#{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>
                    <span className={`status-badge ${customer.status.toLowerCase()}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>{customer.orders}</td>
                  <td>{new Date(customer.joinDate).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <Link to={`/staff/customer/${customer.id}`} className="btn-view">
                      <i className="fas fa-eye"></i>
                    </Link>
                    <Link to={`/staff/verify-customer/${customer.id}`} className="btn-verify">
                      <i className="fas fa-check-circle"></i>
                    </Link>
                    <Link to={`/staff/modify-customer/${customer.id}`} className="btn-modify">
                      <i className="fas fa-edit"></i>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCustomers.length === 0 && (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <p>No customers found matching your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;
