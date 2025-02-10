import React from 'react';
import styles from './Notification.module.css';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Notification = ({ message, type = 'info', onClose, actionButton }) => {
  const icons = {
    success: <FaCheckCircle />,
    warning: <FaExclamationTriangle />,
    error: <FaExclamationTriangle />,
    info: <FaInfoCircle />
  };

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.content}>
        <span className={styles.icon}>{icons[type]}</span>
        <p>{message}</p>
      </div>
      <div className={styles.actions}>
        {actionButton}
        <button onClick={onClose} className={styles.closeButton}>
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Notification;
