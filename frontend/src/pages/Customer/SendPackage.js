import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaGlobe } from 'react-icons/fa';
import styles from './styles/SendPackage.module.css';

const SendPackage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1>Choose Shipping Type</h1>
      
      <div className={styles.options}>
        <div 
          className={styles.option} 
          onClick={() => navigate('/send-package/domestic')}
        >
          <FaTruck />
          <h2>Domestic Shipping</h2>
          <p>Send within India</p>
        </div>

        <div 
          className={styles.option}
          onClick={() => navigate('/send-package/international')}
        >
          <FaGlobe />
          <h2>International Shipping</h2>
          <p>Send worldwide</p>
        </div>
      </div>
    </div>
  );
};

export default SendPackage;
