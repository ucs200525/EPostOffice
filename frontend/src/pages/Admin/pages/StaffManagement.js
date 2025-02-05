import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminComponents.css';

const StaffManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editStaff, setEditStaff] = useState(null);
  const [staffList, setStaffList] = useState([
    { id: 1, name: 'John Smith', email: 'john@epost.com', role: 'Counter Staff', status: 'Active', joinDate: '2023-01-15' },
    { id: 2, name: 'Mary Johnson', email: 'mary@epost.com', role: 'Delivery Staff', status: 'Active', joinDate: '2023-02-20' }
  ]);

  const handleAddEdit = (staff = null) => {
    setEditStaff(staff);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setStaffList(staffList.filter(staff => staff.id !== id));
    }
  };

  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterRole === 'all' || staff.role === filterRole)
  );

  return (
    <div className="admin-dashboard">
      <AdminNavbar />
      <div className="dashboard-content">
        <div className="header-actions">
          <h2>Staff Management</h2>
          <button className="admin-btn" onClick={() => handleAddEdit()}>Add New Staff</button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search staff..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="filter-dropdown"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="Counter Staff">Counter Staff</option>
            <option value="Delivery Staff">Delivery Staff</option>
          </select>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(staff => (
              <tr key={staff.id}>
                <td>{staff.id}</td>
                <td>{staff.name}</td>
                <td>{staff.email}</td>
                <td>{staff.role}</td>
                <td>
                  <span className={`status-badge ${staff.status.toLowerCase()}`}>
                    {staff.status}
                  </span>
                </td>
                <td>{staff.joinDate}</td>
                <td className="table-actions">
                  <button className="btn-view">View</button>
                  <button className="btn-edit" onClick={() => handleAddEdit(staff)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(staff.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{editStaff ? 'Edit Staff' : 'Add New Staff'}</h3>
              <form className="staff-form">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" defaultValue={editStaff?.name} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" defaultValue={editStaff?.email} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select defaultValue={editStaff?.role || 'Counter Staff'}>
                    <option value="Counter Staff">Counter Staff</option>
                    <option value="Delivery Staff">Delivery Staff</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Save</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
