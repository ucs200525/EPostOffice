import { useEffect, useState } from "react";
import styles from './IPCheckWrapper.module.css';

const IPCheckWrapper = ({ children }) => {
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const checkAccess = async () => {
      const allowedIPs = process.env.REACT_APP_ALLOWED_IPS?.split(',') || [];

      try {
        const response = await fetch("https://api4.ipify.org?format=json");
        if (!response.ok) {
          throw new Error('Failed to fetch IP address');
        }
        
        const data = await response.json();
        setAccess(allowedIPs.includes(data.ip));
      } catch (err) {
        setError(err.message);
        setAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) {
    return <div className={styles.container}>
      <h1>Verifying Access...</h1>
      <div className={styles.loader}></div>
    </div>;
  }

  if (error) {
    return <div className={styles.container}>
      <h1>Access Error</h1>
      <p>{error}</p>
    </div>;
  }

  if (!access) {
    return <div className={styles.container}>
      <h1>Access Denied</h1>
      <p>You are not authorized to access this application.</p>
    </div>;
  }

  return children;
};

export default IPCheckWrapper;
