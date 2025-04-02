import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import styles from '../styles/CustomerEdit.module.css';

const CustomerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/customers/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setCustomer(response.data.customer);
    } catch (error) {
      toast.error('Failed to fetch customer details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/customers/${id}`,
        customer,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success('Customer updated successfully');
      navigate('/admin/staff');
    } catch (error) {
      toast.error('Failed to update customer');
      console.error(error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Customer not found</div>;

  return (
    <div className={styles.container}>
      <h2>Edit Customer</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Phone:</label>
          <input
            type="tel"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Status:</label>
          <select
            value={customer.status}
            onChange={(e) => setCustomer({ ...customer, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => navigate('/admin/staff')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerEdit;
