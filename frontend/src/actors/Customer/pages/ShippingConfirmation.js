import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBox, FaGlobe, FaCheckCircle } from 'react-icons/fa';
import styles from '../styles/ShippingConfirmation.module.css';
import Notification from '../../../components/Notification';

const ShippingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { shippingDetails } = location.state || {};
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    
    const addressParts = [
      address.streetAddress,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ];
  
    // Filter out undefined or empty values and join with commas
    return addressParts.filter(part => part && part.trim()).join(', ') || 'Address incomplete';
  };

  const calculateTotal = () => {
    // Implement your pricing logic here
    const basePrice = 50;
    const weightPrice = shippingDetails.weight * 10;
    const insurancePrice = shippingDetails.customsDeclaration?.value * 0.01 || 0;
    return basePrice + weightPrice + insurancePrice;
  };

  const handleConfirm = async () => {
    try {
      // Add your API call to save the shipment here
      setNotification({
        show: true,
        type: 'success',
        message: 'Shipment created successfully!'
      });
      setTimeout(() => {
        navigate('/shipments');
      }, 2000);
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to create shipment. Please try again.'
      });
    }
  };

  if (!shippingDetails) {
    return (
      <div className={styles.errorContainer}>
        <h2>No shipping details found</h2>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.confirmationContainer}>
        <div className={styles.confirmationCard}>
          {notification.show && (
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification({ ...notification, show: false })}
            />
          )}

          <div className={styles.confirmationHeader}>
            <FaCheckCircle className={styles.confirmationIcon} />
            <h1>Confirm Your Shipment</h1>
            <p>Please review your shipping details</p>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.section}>
              <h2><FaMapMarkerAlt /> Pickup Address</h2>
              <div className={styles.addressBox}>
                {shippingDetails.pickupAddress ? (
                  <>
                    <p className={styles.addressLabel}>{shippingDetails.pickupAddress.label || 'Pickup Location'}</p>
                    <p className={styles.addressText}>{formatAddress(shippingDetails.pickupAddress)}</p>
                  </>
                ) : (
                  <p className={styles.noAddress}>No pickup address available</p>
                )}
              </div>
            </div>

            <div className={styles.addressSection}>
              <h3><FaMapMarkerAlt /> Delivery Address</h3>
              <p>{formatAddress(shippingDetails.deliveryAddress)}</p>
            </div>

            <div className={styles.packageSection}>
              <h3><FaBox /> Package Details</h3>
              <p>Type: {shippingDetails.packageType}</p>
              <p>Weight: {shippingDetails.weight} kg</p>
              <p>Dimensions: {shippingDetails.dimensions.length}x{shippingDetails.dimensions.width}x{shippingDetails.dimensions.height} cm</p>
            </div>

            {shippingDetails.customsDeclaration && (
              <div className={styles.customsSection}>
                <h3><FaGlobe /> Customs Declaration</h3>
                <p>Contents: {shippingDetails.customsDeclaration.contents}</p>
                <p>Value: {shippingDetails.customsDeclaration.currency} {shippingDetails.customsDeclaration.value}</p>
                <p>Purpose: {shippingDetails.customsDeclaration.purpose}</p>
              </div>
            )}
          </div>

          <div className={styles.pricingSection}>
            <h3>Shipping Cost</h3>
            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>Base Price</span>
                <span>$50.00</span>
              </div>
              <div className={styles.priceRow}>
                <span>Weight Charge</span>
                <span>${(shippingDetails.weight * 10).toFixed(2)}</span>
              </div>
              {shippingDetails.customsDeclaration && (
                <div className={styles.priceRow}>
                  <span>Insurance (1%)</span>
                  <span>${(shippingDetails.customsDeclaration.value * 0.01).toFixed(2)}</span>
                </div>
              )}
              <div className={`${styles.priceRow} ${styles.total}`}>
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              Back
            </button>
            <button onClick={handleConfirm} className={styles.confirmButton}>
              Confirm & Pay
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippingConfirmation;
