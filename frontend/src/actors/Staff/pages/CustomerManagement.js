import React, { useState, useEffect } from 'react';
import StaffNavbar from '../components/StaffNavbar';
import { Link } from 'react-router-dom';
import customerService from '../services/customerService';
import { toast } from 'react-toastify';
import styles from '../styles/CustomerManagement.module.css';

const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomers();
      setCustomers(response.customers);
      setError(null);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // Set up real-time updates
    const updateInterval = setInterval(fetchCustomers, 30000); // Refresh every 30 seconds
    return () => clearInterval(updateInterval);
  }, []);

  const handleStatusUpdate = async (customerId, newStatus) => {
    try {
      await customerService.updateCustomerStatus(customerId, newStatus);
      toast.success('Customer status updated successfully');
      fetchCustomers(); // Refresh the list
    } catch (err) {
      toast.error('Failed to update customer status');
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      (customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       customer.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || (customer.status || 'pending').toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles["staff-dashboard"]}>
      <StaffNavbar />
      <div className={styles["staff-content"]}>
        <div className={styles["staff-header"]}>
          <div className={styles["header-left"]}>
            <h1>Customer Management</h1>
            <p>Manage and monitor customer accounts</p>
          </div>
          <button className={styles["action-btn"]}>
            <i className="fas fa-plus"></i>
            Add New Customer
          </button>
        </div>

        <div className={styles["filter-section"]}>
          <div className={styles["search-bar"]}>
            <input
              type="search"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles["search-input"]}
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles["status-filter"]}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className={styles["loading-spinner"]}>Loading customers...</div>
        ) : error ? (
          <div className={styles["error-message"]}>{error}</div>
        ) : (
          <div className={styles["table-container"]}>
            <table className={styles["staff-table"]}>
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
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles["no-results"]}>No customers found</td>
                  </tr>
                ) : (
                  filteredCustomers.map(customer => (
                    <tr key={customer._id}>
                      <td>{customer._id}</td>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>
                        <select
                          value={customer.status || 'pending'}
                          onChange={(e) => handleStatusUpdate(customer._id, e.target.value)}
                          className={`${styles["status-badge"]} ${styles[(customer.status || 'pending').toLowerCase()]}`}
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td>{customer.orderCount || 0}</td>
                      <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                      <td className={styles["action-buttons"]}>
                        <Link to={`/staff/customer/${customer._id}`} className={styles["btn-view"]}>
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;
