import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login ,role} = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (result.success && result.user && result.user.role) {
        // Handle navigation based on user role
        const userRole = result.user.role.toLowerCase();
        switch(userRole) {
          case 'admin':
            console.log('Redirecting to admin dashboard');
            navigate('/admin');
            break;
          case 'staff':
            console.log('Redirecting to staff dashboard');
            navigate('/staff');
            break;
          case 'customer':
            console.log('Redirecting to customer dashboard');
            navigate('/');
            break;
          default:
            console.log('Unknown role, redirecting to home');
            navigate('/');
        }
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your account</p>
        </div>

        <div className="role-buttons">
         
          {/* <button 
            className="role-button staff"
            onClick={() => handleRoleButtonClick('staff')}
          >
            Staff Login
          </button>
          <button 
            className="role-button admin"
            onClick={() => handleRoleButtonClick('admin')}
          >
            Admin Login
          </button> */}
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Remember me
            </label>
            <a href="/forgot-password" className="forgot-password">
              Forgot Password?
            </a>
          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="register-prompt">
          <p>Don't have an account? <a href="/register">Register now</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;