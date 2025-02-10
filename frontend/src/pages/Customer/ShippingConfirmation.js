import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBox, FaMoneyBillWave, FaTruck, FaCheckCircle } from 'react-icons/fa';
import styles from './styles/ShippingConfirmation.module.css';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ShippingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState({
    baseRate: 0,
    serviceFee: 0,
    total: 0
  });
  const shippingDetails = location.state?.shippingDetails;

  useEffect(() => {
    if (!shippingDetails) {
      navigate('/send-package');
      return;
    }
    calculateShippingCost();
  }, [shippingDetails]);

  const calculateShippingCost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4000/api/shipping/calculate', 
        shippingDetails,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setCostBreakdown(response.data.cost);
      } else {
        setError('Failed to calculate shipping cost');
      }
    } catch (err) {
      setError('Error calculating shipping cost: ' + err.message);
    }
  };

  const handleConfirmShipping = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
          const response = await axios.post(
            'http://localhost:4000/api/shipping/create',
            {
              ...shippingDetails,
              userId: user._id,
              cost: costBreakdown.total
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
    
          if (response.data.success) {
            navigate('/shipping-success');
          } else {
            setError('Failed to create shipping order');
          }
        } catch (err) {
          setError('Error creating shipping order: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
    
      return (
        <div className={styles.container}>
          <h1>Confirm Your Shipment</h1>
        
        <div className={styles.shipmentDetails}>
          <div className={styles.section}>
            <h2><FaBox /> Package Details</h2>
            <div className={styles.detailsGrid}>
              <div className={styles.detail}>
                <span>Package Type:</span>
                <strong>{shippingDetails.packageType}</strong>
              </div>
              <div className={styles.detail}>
                <span>Weight:</span>
                <strong>{shippingDetails.weight} kg</strong>
              </div>
              <div className={styles.detail}>
                <span>Dimensions:</span>
                <strong>
                  {shippingDetails.dimensions.length} × {shippingDetails.dimensions.width} × {shippingDetails.dimensions.height} cm
                </strong>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2><FaTruck /> Delivery Information</h2>
            <div className={styles.detailsGrid}>
              <div className={styles.detail}>
                <span>From:</span>
                <strong>{shippingDetails.senderAddress}</strong>
              </div>
              <div className={styles.detail}>
                <span>To:</span>
                <strong>{shippingDetails.receiverAddress}</strong>
              </div>
              {shippingDetails.destinationCountry && (
                <div className={styles.detail}>
                  <span>Country:</span>
                  <strong>{shippingDetails.destinationCountry}</strong>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2><FaMoneyBillWave /> Cost Breakdown</h2>
            <div className={styles.costBreakdown}>
              <div className={styles.costItem}>
                <span>Base Rate:</span>
                <strong>${costBreakdown.baseRate.toFixed(2)}</strong>
              </div>
              <div className={styles.costItem}>
                <span>Service Fee:</span>
                <strong>${costBreakdown.serviceFee.toFixed(2)}</strong>
              </div>
              <div className={`${styles.costItem} ${styles.total}`}>
                <span>Total Cost:</span>
                <strong>${costBreakdown.total.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button 
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            Modify Details
          </button>
          <button
            className={styles.confirmButton}
            onClick={handleConfirmShipping}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm & Pay'}
            {!loading && <FaCheckCircle />}
          </button>
        </div>
      </div>
  );
};

export default ShippingConfirmation;
