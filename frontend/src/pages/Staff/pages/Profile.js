import React, { useState } from 'react';
import StaffNavbar from '../components/StaffNavbar';

const Profile = () => {
  const [staffInfo, setStaffInfo] = useState({
    name: 'Staff Member',
    email: 'staff@epost.com',
    employeeId: 'EMP001',
    department: 'Customer Service',
    joinDate: '2023-01-01'
  });

  return (
    <div className="staff-dashboard">
      <StaffNavbar />
      <div className="dashboard-content">
        <div className="profile-container">
          <h2>Staff Profile</h2>
          <div className="profile-info">
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="info-group">
                <label>Name:</label>
                <p>{staffInfo.name}</p>
              </div>
              <div className="info-group">
                <label>Email:</label>
                <p>{staffInfo.email}</p>
              </div>
              <div className="info-group">
                <label>Employee ID:</label>
                <p>{staffInfo.employeeId}</p>
              </div>
              <div className="info-group">
                <label>Department:</label>
                <p>{staffInfo.department}</p>
              </div>
              <div className="info-group">
                <label>Join Date:</label>
                <p>{staffInfo.joinDate}</p>
              </div>
            </div>
            <div className="profile-actions">
              <button className="action-btn">Update Profile</button>
              <button className="action-btn">Change Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
