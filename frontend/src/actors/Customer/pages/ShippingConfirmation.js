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

  const PACKAGE_PRICING = {
    domestic: {
      basic_letter: { base: 50, maxWeight: 0.1 },
      standard_parcel: { base: 150, maxWeight: 1 },
      express_parcel: { base: 300, maxWeight: 5 },
      premium_parcel: { base: 600, maxWeight: 10 },
      bulk_shipment: { base: 1200, maxWeight: 20 }
    },
    international: {
      basic_intl: { base: 250, maxWeight: 0.1 },
      standard_intl: { base: 800, maxWeight: 1 },
      express_intl: { base: 2000, maxWeight: 5 },
      premium_intl: { base: 4000, maxWeight: 10 },
      bulk_intl: { base: 9000, maxWeight: 20 }
    }
  };

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
    const orderType = shippingDetails.packageType.includes('_intl') ? 'international' : 'domestic';
    const pricing = PACKAGE_PRICING[orderType][shippingDetails.packageType];
    
    if (!pricing) {
      console.error('Invalid package type');
      return 0;
    }

    const weight = parseFloat(shippingDetails.weight) || 0;
    const basePrice = pricing.base;
    const weightCharge = weight * (orderType === 'international' ? 300 : 80);
    const volume = shippingDetails.dimensions ? 
      (shippingDetails.dimensions.length * shippingDetails.dimensions.width * shippingDetails.dimensions.height) / 5000 : 0;
    const volumeCharge = volume * (orderType === 'international' ? 400 : 100);
    const insuranceCharge = shippingDetails.customsDeclaration?.value 
      ? parseFloat(shippingDetails.customsDeclaration.value) * 0.01
      : 0;
    const internationalCharge = orderType === 'international' ? basePrice * 0.15 : 0;
    
    return Number((basePrice + weightCharge + volumeCharge + insuranceCharge + internationalCharge).toFixed(2));
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    try {
      const orderType = shippingDetails.packageType.includes('_intl') ? 'international' : 'domestic';
      const pricing = PACKAGE_PRICING[orderType][shippingDetails.packageType];
      
      if (!pricing) {
        throw new Error('Invalid package type');
      }

      const totalAmount = calculateTotal();

      // Check if wallet balance is sufficient
      if (walletBalance < totalAmount) {
        setNotification({
          show: true,
          type: 'error',
          message: `Insufficient funds. Your wallet balance (₹${walletBalance.toFixed(2)}) is less than the order total (₹${totalAmount.toFixed(2)}). Please add funds to continue.`
        });
        return;
      }

      const weight = parseFloat(shippingDetails.weight) || 0;
      const basePrice = pricing.base;
      const weightCharge = weight * (orderType === 'international' ? 300 : 80);
      const volume = shippingDetails.dimensions ? 
        (shippingDetails.dimensions.length * shippingDetails.dimensions.width * shippingDetails.dimensions.height) / 5000 : 0;
      const volumeCharge = volume * (orderType === 'international' ? 400 : 100);
      const insuranceCharge = shippingDetails.customsDeclaration?.value 
        ? Number((parseFloat(shippingDetails.customsDeclaration.value) * 0.01).toFixed(2))
        : 0;
      const internationalCharge = orderType === 'international' ? basePrice * 0.15 : 0;

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
          orderType: orderType,
          cost: {
            basePrice: basePrice,
            weightCharge: weightCharge,
            volumeCharge: volumeCharge,
            insuranceCharge: insuranceCharge,
            internationalCharge: internationalCharge,
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
        // If payment fails, show error and don't proceed
        throw new Error(paymentResponse.data.message || 'Payment failed');
      }

      setNotification({
        show: true,
        type: 'success',
        message: 'Order created successfully!'
      });
      
      // Update wallet balance after successful payment
      setWalletBalance(prev => prev - totalAmount);
      
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
              {(() => {
                const orderType = shippingDetails.packageType.includes('_intl') ? 'international' : 'domestic';
                const pricing = PACKAGE_PRICING[orderType][shippingDetails.packageType];
                const weight = parseFloat(shippingDetails.weight) || 0;
                const basePrice = pricing.base;
                const weightCharge = weight * (orderType === 'international' ? 300 : 80);
                const volume = shippingDetails.dimensions ? 
                  (shippingDetails.dimensions.length * shippingDetails.dimensions.width * shippingDetails.dimensions.height) / 5000 : 0;
                const volumeCharge = volume * (orderType === 'international' ? 400 : 100);
                const insuranceCharge = shippingDetails.customsDeclaration?.value 
                  ? parseFloat(shippingDetails.customsDeclaration.value) * 0.01 
                  : 0;
                const internationalCharge = orderType === 'international' ? basePrice * 0.15 : 0;

                return (
                  <>
                    <div className={styles.priceRow}>
                      <span>Base Price</span>
                      <span>₹{basePrice.toFixed(2)}</span>
                    </div>
                    <div className={styles.priceRow}>
                      <span>Weight Charge ({weight} kg)</span>
                      <span>₹{weightCharge.toFixed(2)}</span>
                    </div>
                    {volume > 0 && (
                      <div className={styles.priceRow}>
                        <span>Volume Charge</span>
                        <span>₹{volumeCharge.toFixed(2)}</span>
                      </div>
                    )}
                    {insuranceCharge > 0 && (
                      <div className={styles.priceRow}>
                        <span>Insurance (1%)</span>
                        <span>₹{insuranceCharge.toFixed(2)}</span>
                      </div>
                    )}
                    {internationalCharge > 0 && (
                      <div className={styles.priceRow}>
                        <span>International Handling</span>
                        <span>₹{internationalCharge.toFixed(2)}</span>
                      </div>
                    )}
                    <div className={`${styles.priceRow} ${styles.total}`}>
                      <span>Total</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
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
