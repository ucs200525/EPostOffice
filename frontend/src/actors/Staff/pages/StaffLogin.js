import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from '../styles/StaffLogin.module.css';


const StaffLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success && result.user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        setError('Invalid staff credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.login_container}>
      <div className={styles.login_card}>
        <div className={styles.login_header}>
          <h2 className={styles.login_title}>Staff Portal</h2>
          <p className={styles.login_subtitle}>Staff Access Only</p>
        </div>

        {error && <div className={styles.error_message}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.form_group}>
            <div className={styles.form_input}>
              <FaEnvelope className={styles.input_icon} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Staff Email"
                required
              />
            </div>
          </div>

          <div className={styles.form_group}>
            <div className={styles.form_input}>
              <FaLock className={styles.input_icon} />
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
                className={styles.password_toggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submit_button} 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In as Staff'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffLogin;

