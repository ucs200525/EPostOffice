import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import StaffNavbar from '../components/StaffNavbar';
import OrderDetailsModal from '../components/OrderDetailsModal';
import customerService from '../services/customerService';
import styles from '../styles/CustomerDetails.module.css';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleDeleteCustomer = async () => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        await customerService.deleteCustomer(id);
        toast.success('Customer deleted successfully');
        navigate('/staff/customers');
      } catch (err) {
        toast.error('Failed to delete customer');
        console.error(err);
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await customerService.deleteCustomerOrder(orderId);
        toast.success('Order deleted successfully');
        // Refresh customer details to update the orders list
        const response = await customerService.getCustomerDetails(id);
        setCustomer(response.customer);
      } catch (err) {
        toast.error('Failed to delete order');
        console.error(err);
      }
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await customerService.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      // Refresh customer details
      const response = await customerService.getCustomerDetails(id);
      setCustomer(response.customer);
    } catch (err) {
      toast.error('Failed to update order status');
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const response = await customerService.getCustomerDetails(id);
        setCustomer(response.customer);
        setError(null);
      } catch (err) {
        setError('Failed to fetch customer details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading customer details...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!customer) return <div className={styles.error}>Customer not found</div>;

  return (
    <div className={styles.container}>
      <StaffNavbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Customer Details</h1>
          <button 
            onClick={handleDeleteCustomer}
            className={styles.deleteButton}
          >
            Delete Customer
          </button>
        </div>
        
        <div className={styles.card}>
          <h2>Personal Information</h2>
          <div className={styles.info}>
            <p><strong>Name:</strong> {customer.name}</p>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Status:</strong> 
              <span className={`${styles.status} ${styles[customer.status || 'pending']}`}>
                {customer.status || 'Pending'}
              </span>
            </p>
            <p><strong>Join Date:</strong> {new Date(customer.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Orders:</strong> {customer.orderCount}</p>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Recent Orders</h2>
          {customer.recentOrders?.length > 0 ? (
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customer.recentOrders.map(order => (
                  <tr 
                    key={order._id}
                    onClick={() => handleOrderClick(order)}
                    className={styles.orderRow}
                  >
                    <td>{order._id}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`${styles.status} ${styles[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>₹{order.totalAmount}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className={styles.deleteOrderButton}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          ) : (
            <p className={styles.noOrders}>No orders found</p>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}
    </div>
  );
};

export default CustomerDetails;
