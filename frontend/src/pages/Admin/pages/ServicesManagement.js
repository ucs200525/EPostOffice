import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import '../styles/ServicesAndReports.css';

const ServicesManagement = () => {
  const [services] = useState([
    {
      id: 1,
      name: 'Express Delivery',
      description: 'Next day delivery service',
      price: 500,
      status: 'active'
    },
    {
      id: 2,
      name: 'Standard Post',
      description: '3-5 business days delivery',
      price: 100,
      status: 'active'
    }
  ]);

  return (
    <div className="services-container">
      <div className="services-header">
        <h1>Services Management</h1>
        <button className="add-service-btn">
          <FaPlus /> Add New Service
        </button>
      </div>

      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-header">
              <h3>{service.name}</h3>
              <span className={`service-status status-${service.status}`}>
                {service.status}
              </span>
            </div>
            <p>{service.description}</p>
            <p className="service-price">₹{service.price}</p>
            <div className="service-actions">
              <button className="edit-btn"><FaEdit /> Edit</button>
              <button className="delete-btn"><FaTrash /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesManagement;
