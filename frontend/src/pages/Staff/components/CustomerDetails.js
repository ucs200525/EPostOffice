import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    address: '123 Main St',
    phone: '1234567890',
    orders: [
      { id: 1, date: '2023-11-01', status: 'Delivered' },
      { id: 2, date: '2023-11-05', status: 'Processing' }
    ]
  });

  return (
    <div className="customer-details">
      <h2>Customer Details</h2>
      <div className="customer-info">
        <div className="info-section">
          <h3>Personal Information</h3>
          <p><strong>Name:</strong> {customer.name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.phone}</p>
          <p><strong>Address:</strong> {customer.address}</p>
        </div>
        <div className="order-history">
          <h3>Order History</h3>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.date}</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
