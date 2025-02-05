import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';

const ServicesManagement = () => {
  const [services] = useState([
    { id: 1, name: 'Express Delivery', price: 500, status: 'Active' },
    { id: 2, name: 'Regular Post', price: 100, status: 'Active' },
    { id: 3, name: 'International Shipping', price: 1500, status: 'Active' }
  ]);

  return (
    <div className="admin-dashboard">
      <AdminNavbar />
      <div className="dashboard-content">
        <div className="header-actions">
          <h2>Services Management</h2>
          <button className="admin-btn">Add New Service</button>
        </div>
        <div className="services-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Service Name</th>
                <th>Price (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id}>
                  <td>{service.id}</td>
                  <td>{service.name}</td>
                  <td>{service.price}</td>
                  <td>{service.status}</td>
                  <td>
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
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

export default ServicesManagement;
