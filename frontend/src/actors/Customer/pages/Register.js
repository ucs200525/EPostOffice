import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import styles from '../styles/Register.module.css';
import LocationPicker from '../../../components/LocationPicker';
import Toast from '../../../components/Toast';

const Register = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });
  const [showMap, setShowMap] = useState(false);

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
    return newErrors;
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'password':
        return value.length < 8 ? 'Password must be at least 8 characters' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

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

  const handleLocationClick = () => {
    setShowMap(!showMap);
    if (!showMap) {
      setManualAddress(false);
    }
  };

  const handleLocationSelect = ({ address, coordinates }) => {
    setFormData((prev) => ({
      ...prev,
      address: address,
      coordinates: coordinates,
    }));
    setShowMap(false);
    setManualAddress(false);
  };

  const handleAddressChange = async (e) => {
    const address = e.target.value;
    setFormData((prev) => ({ ...prev, address }));
  };

  const getPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password)
    };
    return Object.values(checks).filter(Boolean).length;
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
        setShowToast({
          show: true,
          message: 'Registration successful!',
          type: 'success'
        });
        navigate('/', {
          state: { message: 'Registration successful! Please login.' },
        });
      }
    } catch (err) {
      setShowToast({
        show: true,
        message: 'Registration failed',
        type: 'error'
      });
      setErrors({ submit: 'Registration failed. Please try again.' });
    }
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const result = await googleLogin();
      if (result.success) {
        setShowToast({
          show: true,
          message: 'Registration with Google successful!',
          type: 'success'
        });
        navigate('/login', {
          state: { message: 'Registration successful! Please login.' },
        });
      }
    } catch (err) {
      setShowToast({
        show: true,
        message: 'Registration with Google failed',
        type: 'error'
      });
      setErrors({ submit: 'Registration with Google failed. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create Account</h2>
          <p>Join EPostOffice to access all services</p>
        </div>

        {errors.submit && <div className={styles.errorMessage}>{errors.submit}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <button
            type="button"
            onClick={handleGoogleRegister}
            className={`${styles.button} ${styles.googleButton}`}
            disabled={loading}
          >
            <i className="fa-brands fa-google"></i>
            Sign up with Google
          </button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <FaUser className={styles.icon} />
              <input
                type="text"
                name="name"
                className={styles.input}
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full Name"
              />
            </div>
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <FaEnvelope className={styles.icon} />
              <input
                type="email"
                name="email"
                className={styles.input}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
              />
            </div>
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <div className={styles.inputGroup}>
                <FaLock className={styles.icon} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={styles.input}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {formData.password && (
                <div className={styles.passwordStrength}>
                  <div className={`strength-bar strength-${getPasswordStrength(formData.password)}`} />
                </div>
              )}
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.inputGroup}>
                <FaLock className={styles.icon} />
                <input
                  type="password"
                  name="confirmPassword"
                  className={styles.input}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                />
              </div>
              {errors.confirmPassword && (
                <span className={styles.errorText}>{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.locationGroup}`}>
            <div className={styles.inputGroup}>
              <FaMapMarkerAlt className={styles.icon} />
              <textarea
                name="address"
                value={formData.address}
                onChange={manualAddress ? handleAddressChange : undefined}
                placeholder="Address"
                readOnly={!manualAddress}
                className={`${styles.input} ${formData.address ? 'has-value' : ''}`}
              />
            </div>
            
            <div className={styles.locationActions}>
              <button
                type="button"
                className={styles.locationToggle}
                onClick={handleLocationClick}
              >
                {showMap ? 'Hide Map' : 'Pick Location on Map'}
              </button>
            </div>

            {showMap && (
              <div className={`${styles.mapContainer} fade-in`}>
                <LocationPicker onLocationSelect={handleLocationSelect} />
                <button 
                  type="button" 
                  className={styles.closeMap}
                  onClick={() => setShowMap(false)}
                >
                  &times;
                </button>
              </div>
            )}
            
            {errors.address && (
              <span className={styles.errorText}>{errors.address}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <FaPhone className={styles.icon} />
              <input
                type="tel"
                name="phone"
                className={styles.input}
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
              />
            </div>
            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className={styles.loginPrompt}>
          <p>
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
      <Toast {...showToast} onClose={() => setShowToast({ show: false })} />
    </div>
  );
};

export default Register;