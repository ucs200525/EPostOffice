import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaWeightHanging, FaRuler, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import Notification from '../../../components/Notification';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import styles from '../styles/Shipping.module.css';

const InternationalShipping = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customerData, setCustomerData] = useState(null);
  const [addresses, setAddresses] = useState({
    pickup: null,
    delivery: []
  });
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState('');
  const [formData, setFormData] = useState({
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    packageType: 'standard_intl',
    specialInstructions: '',
    customsDeclaration: {
      contents: '',
      value: '',
      currency: 'USD',
      purpose: 'gift'
    }
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  const PACKAGE_TYPES = {
    basic_intl: { label: 'Basic International', maxWeight: 0.1 },
    standard_intl: { label: 'Standard International', maxWeight: 1 },
    express_intl: { label: 'Express International', maxWeight: 5 },
    premium_intl: { label: 'Premium International', maxWeight: 10 },
    bulk_intl: { label: 'Bulk International', maxWeight: 20 }
  };

  const validateWeight = (weight, packageType) => {
    const maxWeight = PACKAGE_TYPES[packageType].maxWeight;
    return weight <= maxWeight;
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

  // Fetch addresses function
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!customerData?.id) {
        setNotification({
          show: true,
          type: 'error',
          message: 'Please log in to continue'
        });
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${customerData.id}`,
          {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }
        );

        if (response.data.success) {
          setAddresses({
            pickup: response.data.data.pickup,
            delivery: response.data.data.delivery || []
          });

          // Set default delivery address if available
          const defaultDelivery = response.data.data.delivery?.find(addr => addr.isDefault);
          if (defaultDelivery) {
            setSelectedDeliveryAddress(defaultDelivery._id);
          }
        }
      } catch (error) {
        setNotification({
          show: true,
          type: 'error',
          message: 'Failed to fetch addresses'
        });
      } finally {
        setLoading(false);
      }
    };

    if (customerData?.id) {
      fetchAddresses();
    }
  }, [customerData?.id]);

  // Format address helper
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.streetAddress}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDeliveryAddress) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please select a delivery address'
      });
      return;
    }

    if (!validateWeight(parseFloat(formData.weight), formData.packageType)) {
      setNotification({
        show: true,
        type: 'error',
        message: `Maximum weight for ${PACKAGE_TYPES[formData.packageType].label} is ${PACKAGE_TYPES[formData.packageType].maxWeight}kg`
      });
      return;
    }

    try {
      const selectedAddress = addresses.delivery.find(addr => addr._id === selectedDeliveryAddress);
      
      const shippingDetails = {
        ...formData,
        pickupAddress: addresses.pickup,
        deliveryAddress: selectedAddress
      };

      navigate('/shipping/international/confirmation', { state: { shippingDetails } });
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to process shipping details'
      });
    }
  };

  return (
    <div className={styles.shippingContainer}>
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
          actionButton={
            !addresses.pickup && (
              <button
                onClick={() => navigate('/settings')}
                className={styles.actionButton}
              >
                Add Address
              </button>
            )
          }
        />
      )}

      <div className={styles.shippingHeader}>
        <h1>International Shipping</h1>
        <p>Send packages worldwide with tracking and insurance</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.shippingForm}>
        {/* Address Section */}
        <div className={styles.addressSection}>
          {/* Pickup Address */}
          <div className={styles.pickupAddress}>
            <h3><FaMapMarkerAlt /> Pickup Address</h3>
            {addresses.pickup ? (
              <div className={styles.addressCard}>
                <div className={styles.addressHeader}>
                  <span className={styles.addressLabel}>{addresses.pickup.label}</span>
                  {addresses.pickup.isDefault && (
                    <span className={styles.defaultBadge}>Default</span>
                  )}
                </div>
                <p>{formatAddress(addresses.pickup)}</p>
              </div>
            ) : (
              <div className={styles.noAddress}>
                <p>No pickup address set</p>
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className={styles.addAddressButton}
                >
                  Add Pickup Address
                </button>
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className={styles.deliveryAddress}>
            <h3><FaMapMarkerAlt /> Delivery Address</h3>
            {addresses.delivery.length > 0 ? (
              <select
                value={selectedDeliveryAddress}
                onChange={(e) => setSelectedDeliveryAddress(e.target.value)}
                className={styles.addressSelect}
                required
              >
                <option value="">Select delivery address</option>
                {addresses.delivery.map(addr => (
                  <option key={addr._id} value={addr._id}>
                    {addr.label} - {formatAddress(addr)}
                  </option>
                ))}
              </select>
            ) : (
              <div className={styles.noAddress}>
                <p>No delivery addresses added</p>
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className={styles.addAddressButton}
                >
                  Add Delivery Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Package Details */}
        <div className={styles.formSection}>
          <h3><FaBox /> Package Details</h3>
          <div className={styles.formGroup}>
            <label>Package Type</label>
            <select
              value={formData.packageType}
              onChange={(e) => setFormData({...formData, packageType: e.target.value})}
              required
            >
              {Object.entries(PACKAGE_TYPES).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <small className={styles.helperText}>
              Max weight: {PACKAGE_TYPES[formData.packageType].maxWeight}kg
            </small>
          </div>

          <div className={styles.formGroup}>
            <label><FaWeightHanging /> Weight (kg)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              placeholder="Enter package weight"
              step="0.1"
              min="0.1"
              max={PACKAGE_TYPES[formData.packageType].maxWeight}
              required
            />
          </div>

          <div className={styles.dimensionsGroup}>
            <label><FaRuler /> Dimensions (cm)</label>
            <div className={styles.dimensionsInputs}>
              <input
                type="number"
                placeholder="Length"
                value={formData.dimensions.length}
                onChange={(e) => setFormData({
                  ...formData,
                  dimensions: {...formData.dimensions, length: e.target.value}
                })}
              />
              <input
                type="number"
                placeholder="Width"
                value={formData.dimensions.width}
                onChange={(e) => setFormData({
                  ...formData,
                  dimensions: {...formData.dimensions, width: e.target.value}
                })}
              />
              <input
                type="number"
                placeholder="Height"
                value={formData.dimensions.height}
                onChange={(e) => setFormData({
                  ...formData,
                  dimensions: {...formData.dimensions, height: e.target.value}
                })}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Declared Value ($)</label>
            <input
              type="number"
              value={formData.declaredValue}
              onChange={(e) => setFormData({...formData, declaredValue: e.target.value})}
              placeholder="Enter declared value"
            />
          </div>
        </div>

        {/* Customs Declaration Section */}
        <div className={styles.customsSection}>
          <h3><FaGlobe /> Customs Declaration</h3>
          <div className={styles.formGroup}>
            <label>Contents Description</label>
            <textarea
              value={formData.customsDeclaration.contents}
              onChange={(e) => setFormData({
                ...formData,
                customsDeclaration: {
                  ...formData.customsDeclaration,
                  contents: e.target.value
                }
              })}
              placeholder="Describe the contents of your package"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Declared Value</label>
            <div className={styles.currencyInput}>
              <input
                type="number"
                value={formData.customsDeclaration.value}
                onChange={(e) => setFormData({
                  ...formData,
                  customsDeclaration: {
                    ...formData.customsDeclaration,
                    value: e.target.value
                  }
                })}
                placeholder="Enter declared value"
                required
              />
              <select
                value={formData.customsDeclaration.currency}
                onChange={(e) => setFormData({
                  ...formData,
                  customsDeclaration: {
                    ...formData.customsDeclaration,
                    currency: e.target.value
                  }
                })}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Purpose of Shipment</label>
            <select
              value={formData.customsDeclaration.purpose}
              onChange={(e) => setFormData({
                ...formData,
                customsDeclaration: {
                  ...formData.customsDeclaration,
                  purpose: e.target.value
                }
              })}
              required
            >
              <option value="gift">Gift</option>
              <option value="commercial">Commercial</option>
              <option value="sample">Sample</option>
              <option value="documents">Documents</option>
              <option value="return">Return</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          Calculate & Proceed
        </button>
      </form>
    </div>
  );
};

export default InternationalShipping;
