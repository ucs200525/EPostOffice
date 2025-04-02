import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';
import styles from '../styles/StaffManagement.module.css';

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUserType, setFilterUserType] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/all-users`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (userId, newStatus, userType) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = userType === 'staff' ? 'staff' : 'customers';
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/${endpoint}/${userId}/status`,
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success('Status updated successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
      console.error(err);
    }
  };

  const handleDelete = async (userId, userType) => {
    try {
      if (!window.confirm('Are you sure you want to delete this user?')) {
        return;
      }

      const token = localStorage.getItem('token');
      const endpoint = userType === 'staff' ? 'staff' : 'customers';
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/${endpoint}/${userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
      console.error(err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || user.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesType = filterUserType === 'all' || user.userType === filterUserType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className={styles.staffManagement}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>User Management</h1>
          <p>Manage all users and staff accounts</p>
        </div>
        <Link to="/admin/staff/register" className={styles.addStaffBtn}>
          <FaUserPlus /> Add New Staff
        </Link>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.searchBar}>
          <input
            type="search"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select 
          value={filterUserType}
          onChange={(e) => setFilterUserType(e.target.value)}
          className={styles.typeFilter}
        >
          <option value="all">All Users</option>
          <option value="staff">Staff Only</option>
          <option value="customer">Customers Only</option>
        </select>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.statusFilter}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading users...</div>
      ) : (
        <div className={styles.staffList}>
          <table className={styles.staffTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className={styles.tableRow}>
                  <td>{user._id}</td>
                  <td>
                    <span className={`${styles.userType} ${styles[user.userType]}`}>
                      {user.userType}
                    </span>
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.department || 'N/A'}</td>
                  <td>
                    <select
                      value={user.status || 'pending'}
                      onChange={(e) => handleStatusUpdate(user._id, e.target.value, user.userType)}
                      className={`${styles.statusBadge} ${styles[user.status?.toLowerCase()]}`}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td className={styles.actions}>
                    <Link 
                      to={`/admin/${user.userType}/${user._id}/edit`} 
                      className={styles.editBtn}
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button 
                      className={styles.deleteBtn}
                      title="Delete"
                      onClick={() => handleDelete(user._id, user.userType)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
