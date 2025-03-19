import React, { useState, useEffect } from 'react';
import StaffNavbar from '../components/StaffNavbar';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import customerService from '../services/customerService';
import styles from '../styles/Orders.module.css';
import OrderDetailsModal from '../components/OrderDetailsModal';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderCustomer, setSelectedOrderCustomer] = useState(null);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');  // Debug log
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/staff/all`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Orders data:', data);  // Debug log
      
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await customerService.deleteCustomerOrder(orderId);
        toast.success('Order deleted successfully');
        fetchOrders(); // Refresh the list
      } catch (err) {
        toast.error('Failed to delete order');
        console.error(err);
      }
    }
  };

  const handleOrderClick = async (order) => {
    try {
      console.log('Fetching customer details for order:', order);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/staff/customers/${order.customerId}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Customer data:', data.customer); // Debug log
        setSelectedOrderCustomer(data.customer);
        setSelectedOrder(order);
      } else {
        toast.error('Failed to fetch customer details');
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast.error('Error loading customer information');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await customerService.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      // Refresh orders list
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update order status');
      console.error(err);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerId && order.customerId.toString().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || (order.status && order.status.toLowerCase() === filterStatus.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.ordersPage}>
      <StaffNavbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Order Management</h1>
            <p>View and manage all orders</p>
          </div>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Orders</span>
              <span className={styles.statValue}>{orders.length}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Pending</span>
              <span className={styles.statValue}>
                {orders.filter(order => order.status === 'pending').length}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>In Transit</span>
              <span className={styles.statValue}>
                {orders.filter(order => order.status === 'in_transit').length}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <input
              type="search"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.statusFilter}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading orders...</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr 
                    key={order._id} 
                    className={styles.orderRow}
                    onClick={() => handleOrderClick(order)}
                  >
                    <td>{order.trackingNumber}</td>
                    <td>{order.customerId}</td>
                    <td>{order.orderType}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>₹{order.totalAmount}</td>
                    <td className={styles.actions}>
                      <Link 
                        to={`/staff/order-assignment/${order.trackingNumber}`}
                        className={styles.manageButton}
                      >
                        Manage
                      </Link>
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            customer={selectedOrderCustomer}
            onClose={() => {
              setSelectedOrder(null);
              setSelectedOrderCustomer(null);
            }}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;
