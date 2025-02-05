import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Register.css';
import LocationPicker from '../../components/LocationPicker';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    coordinates: null,
    role: 'customer',
  });
  const [errors, setErrors] = useState({});
  const [manualAddress, setManualAddress] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phone.match(/^\d{10}$/)) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    // if (manualAddress && !isValidAddress(formData.address)) {
    //   newErrors.address = 'Address must include pincode, city, state, and area';
    // }
    return newErrors;
  };

  // const isValidAddress = (address) => {
  //   // const hasPincode = /\b\d{5,6}\b/.test(address);
  //   // const hasCity = /[a-zA-Z]+/.test(address); // Add more validation if needed
  //   // const hasState = /[a-zA-Z]+/.test(address);
  //   // return hasPincode && hasCity && hasState;
  // };

  const fetchCoordinates = async (address) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          address
        )}&key=YOUR_API_KEY`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        return { lat, lng };
      }
    } catch (err) {
      console.error('Error fetching coordinates:', err);
    }
    return null;
  };

  const handleLocationSelect = ({ address, coordinates }) => {
    setFormData((prev) => ({
      ...prev,
      address: address,
      coordinates: coordinates,
    }));
    setManualAddress(false);
  };

  const handleAddressChange = async (e) => {
    const address = e.target.value;
    setFormData((prev) => ({ ...prev, address }));
    // if (isValidAddress(address)) {
    //   const coordinates = await fetchCoordinates(address);
    //   setFormData((prev) => ({ ...prev, coordinates }));
    // }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        ...formData,
        role: 'customer',
      });
      if (result.success) {
        navigate('/login', {
          state: { message: 'Registration successful! Please login.' },
        });
      }
    } catch (err) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Join EPostOffice to access all services</p>
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Full Name"
              />
            </div>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Email Address"
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Password"
                />
              </div>
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm Password"
                />
              </div>
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <div className="input-group">
              <FaMapMarkerAlt className="input-icon" />
              <textarea
                name="address"
                value={formData.address}
                onChange={manualAddress ? handleAddressChange : undefined}
                placeholder="Address"
                readOnly={!manualAddress}
              />
            </div>
            <button
              type="button"
              onClick={() => setManualAddress(!manualAddress)}
            >
              {manualAddress
                ? 'Use Map to Add Address'
                : 'Type Address Manually'}
            </button>
            {!manualAddress && (
              <LocationPicker onLocationSelect={handleLocationSelect} />
            )}
            {errors.address && (
              <span className="error-text">{errors.address}</span>
            )}
          </div>

          <div className="form-group">
            <div className="input-group">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Phone Number"
              />
            </div>
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="login-prompt">
          <p>
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
