import React, { useEffect } from 'react';
// import './Toast.css';

const Toast = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`toast toast-${type}`}>
      {message}
      <button onClick={onClose}>&times;</button>
    </div>
  );
};

export default Toast;
