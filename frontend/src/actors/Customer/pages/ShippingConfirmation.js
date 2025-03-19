import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Add this import
import { FaMapMarkerAlt, FaBox, FaGlobe, FaCheckCircle } from 'react-icons/fa';
import styles from '../styles/ShippingConfirmation.module.css';
import Notification from '../../../components/Notification';
import axios from 'axios';

const ShippingConfirmation = () => {
  const { user } = useAuth(); // Add this line
  const location = useLocation();
  const navigate = useNavigate();
  const { shippingDetails } = location.state || {};
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => {
    if (user) {
      setCustomerData(user);
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setCustomerData(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (customerData?.id) {
      fetchWalletBalance();
    }
  }, [customerData?.id]);

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/${customerData.id}/wallet`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setWalletBalance(response.data.balance);
      }
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to fetch wallet balance'
      });
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.streetAddress}, ${address.city}, ${address.state} ${address.postalCode}`;
  };

  const calculateTotal = () => {
    const weight = parseFloat(shippingDetails.weight) || 0;
    const basePrice = 50 * 83; // Fixed base price in INR
    const weightCharge = weight * (10 * 83); // Weight charge per kg in INR
    const insuranceCharge = shippingDetails.customsDeclaration?.value 
      ? parseFloat(shippingDetails.customsDeclaration.value) * 83 * 0.01
      : 0;
    
    return Number((basePrice + weightCharge + insuranceCharge).toFixed(2));
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    try {
      const weight = parseFloat(shippingDetails.weight) || 0;
      const basePrice = Number((50 * 83).toFixed(2));
      const weightCharge = Number((weight * 10 * 83).toFixed(2));
      const insuranceCharge = shippingDetails.customsDeclaration?.value 
        ? Number((parseFloat(shippingDetails.customsDeclaration.value) * 83 * 0.01).toFixed(2))
        : 0;
      const totalAmount = Number((basePrice + weightCharge + insuranceCharge).toFixed(2));

      // Create order with proper numeric values
      const orderResponse = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/orders/create/${customerData.id}`,
        {
          customerId: customerData.id,
          totalAmount: totalAmount,
          pickupAddress: shippingDetails.pickupAddress,
          deliveryAddress: shippingDetails.deliveryAddress,
          packageDetails: {
            type: shippingDetails.packageType,
            weight: weight,
            dimensions: {
              length: parseFloat(shippingDetails.dimensions.length) || 0,
              width: parseFloat(shippingDetails.dimensions.width) || 0,
              height: parseFloat(shippingDetails.dimensions.height) || 0
            },
            specialInstructions: shippingDetails.specialInstructions
          },
          orderType: shippingDetails.customsDeclaration ? 'international' : 'domestic',
          cost: {
            basePrice: basePrice,
            weightCharge: weightCharge,
            insuranceCharge: insuranceCharge,
            total: totalAmount
          }
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create order');
      }

      // Process payment after order creation
      const paymentResponse = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/payForOrder`,
        { 
          customerId: customerData.id,
          orderId: orderResponse.data.orderId,
          amount: totalAmount
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!paymentResponse.data.success) {
        throw new Error('Payment failed');
      }

      setNotification({
        show: true,
        type: 'success',
        message: 'Order created successfully!'
      });
      
      navigate('/shipping/success', { 
        state: { 
          trackingNumber: orderResponse.data.trackingNumber,
          shipmentDetails: shippingDetails,
          paymentAmount: totalAmount,
          orderId: orderResponse.data.orderId
        }
      });

    } catch (error) {
      console.error('Error processing order:', error);
      setNotification({
        show: true,
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to process order'
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
              {shippingDetails.pickupAddress ? (
                <div className={styles.addressCard}>
                  <div className={styles.addressHeader}>
                    <span className={styles.addressLabel}>
                      {shippingDetails.pickupAddress.label || 'Pickup Location'}
                    </span>
                    {shippingDetails.pickupAddress.isDefault && (
                      <span className={styles.defaultBadge}>Default</span>
                    )}
                  </div>
                  <p>{formatAddress(shippingDetails.pickupAddress)}</p>
                </div>
              ) : (
                <div className={styles.noAddress}>
                  <p>No pickup address available</p>
                </div>
              )}
            </div>

            <div className={styles.section}>
              <h2><FaMapMarkerAlt /> Delivery Address</h2>
              <div className={styles.addressCard}>
                <div className={styles.addressHeader}>
                  <span className={styles.addressLabel}>
                    {shippingDetails.deliveryAddress.label || 'Delivery Location'}
                  </span>
                  {shippingDetails.deliveryAddress.isDefault && (
                    <span className={styles.defaultBadge}>Default</span>
                  )}
                </div>
                <p>{formatAddress(shippingDetails.deliveryAddress)}</p>
              </div>
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
                <span>₹{(50 * 83).toFixed(2)}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Weight Charge</span>
                <span>₹{(Number(shippingDetails.weight) * 10 * 83).toFixed(2)}</span>
              </div>
              {shippingDetails.customsDeclaration && (
                <div className={styles.priceRow}>
                  <span>Insurance (1%)</span>
                  <span>₹{(Number(shippingDetails.customsDeclaration.value) * 83 * 0.01).toFixed(2)}</span>
                </div>
              )}
              <div className={`${styles.priceRow} ${styles.total}`}>
                <span>Total</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div className={styles.walletBalance}>
                <span>Wallet Balance:</span>
                <span>₹{walletBalance.toFixed(2)}</span>
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
