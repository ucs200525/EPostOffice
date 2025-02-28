import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from '../styles/Login.module.css';
import { FaGoogle } from 'react-icons/fa';
import Notification from '../../../components/Notification';

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin, role } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };
  const handleRoleButtonClick = (role) => {
    switch(role) {
      case 'admin':
        navigate('/admin/login');
        break;
      case 'staff':
        navigate('/staff/login');
        break;
      default:
        // Stay on current page for customer login
        break;
    }
  };
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
  
    try {
      const result = await googleLogin();
      if (result.success && result.user && result.user.role) {
        const userRole = result.user.role.toLowerCase();
        switch(userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'staff':
            navigate('/staff');
            break;
          case 'customer':
            navigate('/');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setNotification({
        show: true,
        message: 'Google login failed. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const result = await login(formData.email, formData.password, formData.rememberMe);
      console.log('Login result:', result);
      
      if (result.success && result.user && result.user.role) {
        // Handle navigation based on user role
        const userRole = result.user.role.toLowerCase();
        setNotification({
          show: true,
          message: `Welcome back! Redirecting to ${userRole} dashboard...`,
          type: 'success'
        });
        setTimeout(() => {
          switch(userRole) {
            case 'admin':
              navigate('/admin');
              break;
            case 'staff':
              navigate('/staff');
              break;
            case 'customer':
              navigate('/');
              break;
            default:
              navigate('/');
          }
        }, 1500);
      } else {
        setNotification({
        show: true,
        message: result.error || 'Invalid credentials',
        type: 'error'
      });
      }
    } catch (err) {
      console.error('Login error:', err);
      setNotification({
        show: true,
        message: 'Login failed. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Welcome Back</h2>
          <p>Sign in to access your account</p>
        </div>
  
        <div className={styles.roleButtons}>
          <button 
            className={`${styles.roleButton} ${styles.roleButtonStaff}`}
            onClick={() => handleRoleButtonClick('staff')}
          >
            Staff Login
          </button>
          <button 
            className={`${styles.roleButton} ${styles.roleButtonAdmin}`}
            onClick={() => handleRoleButtonClick('admin')}
          >
            Admin Login
          </button>
        </div>
  
        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ show: false })}
          />
        )}
  
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                className={styles.input}
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
              />
            </div>
          </div>
  
          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <FaLock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={styles.input}
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
  
          <div className={styles.formOptions}>
            <label className={styles.rememberMe}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Remember me
            </label>
            <a href="/forgot-password" className={styles.forgotPassword}>
              Forgot Password?
            </a>
          </div>
  
          <button 
            type="submit" 
            className={styles.button} 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
  
          <div className={styles.divider}>
            <span>or</span>
          </div>
  
          <button
            type="button"
            onClick={handleGoogleLogin}
            className={`${styles.button} ${styles.googleButton}`}
            disabled={loading}
          >
            <i className="fa-brands fa-google"></i>
            Sign in with Google
          </button>
          
        </form>
  
        <div className={styles.registerPrompt}>
          <p>Don't have an account? <a href="/register">Register now</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;