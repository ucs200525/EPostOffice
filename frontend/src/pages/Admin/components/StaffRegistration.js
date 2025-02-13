import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash, FaIdCard } from 'react-icons/fa';
import axios from 'axios';

const StaffRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    staffId: '',
    department: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/register-staff`,
        {
          ...formData,
          role: 'staff' // Explicitly set role as staff
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('Staff member registered successfully!');
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          address: '',
          staffId: '',
          department: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-registration">
      <h2>Register New Staff Member</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="input-group">
            <FaIdCard className="input-icon" />
            <input
              type="text"
              name="staffId"
              value={formData.staffId}
              onChange={handleChange}
              placeholder="Staff ID"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="input-group">
            <FaPhone className="input-icon" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            <option value="delivery">Delivery</option>
            <option value="sorting">Sorting</option>
            <option value="customer-service">Customer Service</option>
          </select>
        </div>

        <div className="form-group">
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            required
            className="address-input"
          />
        </div>

        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Staff Member'}
        </button>
      </form>
    </div>
  );
};

export default StaffRegistration;
