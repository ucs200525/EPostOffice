import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import styles from '../styles/Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        if (result.redirectToAddress) {
          navigate('/customer/address');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Failed to log in');
      }
    } catch (error) {
      setError('Failed to log in');
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await googleLogin();
      if (result.success) {
        if (result.redirectToAddress) {
          navigate('/customer/address');
        } else {
          navigate('/customer/home');
        }
      } else {
        setError(result.error || 'Failed to log in with Google');
      }
    } catch (error) {
      setError('Failed to log in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Customer Login</h2>
          <p>Welcome back! Please login to your account.</p>
        </div>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formOptions}>
            <label className={styles.rememberMe}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className={styles.forgotPassword}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            Log In
          </button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <button
            type="button"
            className={`${styles.button} ${styles.googleButton}`}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>
        </form>

        <div className={styles.registerPrompt}>
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
