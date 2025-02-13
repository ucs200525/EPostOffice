import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';
import '../styles/StaffManagement.css';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/staff-list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setStaffList(response.data.staffList);
      }
    } catch (err) {
      setError('Failed to fetch staff list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-management">
      <div className="header">
        <h1>Staff Management</h1>
        <Link to="/admin/staff/register" className="add-staff-btn">
          <FaUserPlus /> Add New Staff
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading staff list...</div>
      ) : (
        <div className="staff-list">
          {staffList.length === 0 ? (
            <div className="no-staff">
              <p>No staff members found.</p>
              <Link to="/admin/staff/register">Register your first staff member</Link>
            </div>
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff._id}>
                    <td>{staff.staffId}</td>
                    <td>{staff.name}</td>
                    <td>{staff.email}</td>
                    <td>{staff.department}</td>
                    <td>{staff.phone}</td>
                    <td className="actions">
                      <button className="edit-btn" title="Edit">
                        <FaEdit />
                      </button>
                      <button className="delete-btn" title="Delete">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
