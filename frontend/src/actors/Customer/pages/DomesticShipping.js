import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaWeightHanging, FaRuler, FaMapMarkerAlt } from 'react-icons/fa';
import Notification from '../../../components/Notification';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import styles from '../styles/Shipping.module.css';

const DomesticShipping = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState({
    pickup: null,
    delivery: []
  });
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState('');
  const [formData, setFormData] = useState({
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    packageType: 'standard',
    specialInstructions: ''
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?._id) {
        setNotification({
          show: true,
          type: 'error',
          message: 'Please log in to continue'
        });
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${user._id}`,
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

    fetchAddresses();
  }, [user]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.streetAddress}, ${address.city}, ${address.state} ${address.postalCode}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDeliveryAddress) {
      alert('Please select a delivery address');
      return;
    }

    try {
      const selectedAddress = addresses.delivery.find(addr => addr._id === selectedDeliveryAddress);
      
      const shippingDetails = {
        ...formData,
        pickupAddress: {
          streetAddress: user.address, // Use user's default address as pickup
          city: user.city,
          state: user.state,
          postalCode: user.postalCode,
          country: 'India'
        },
        deliveryAddress: selectedAddress
      };

      navigate('/shipping/confirmation', { state: { shippingDetails } });
    } catch (error) {
      console.error('Shipping submission failed:', error);
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
        <h1>Domestic Shipping</h1>
        <p>Send packages anywhere within the country</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.shippingForm}>
        <div className={styles.addressSection}>
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

        <div className={styles.formSection}>
          <h3><FaBox /> Package Details</h3>
          <div className={styles.formGroup}>
            <label>Package Type</label>
            <select
              value={formData.packageType}
              onChange={(e) => setFormData({...formData, packageType: e.target.value})}
            >
              <option value="standard">Standard Package</option>
              <option value="fragile">Fragile</option>
              <option value="document">Document</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label><FaWeightHanging /> Weight (kg)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              placeholder="Enter package weight"
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
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label>Special Instructions</label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
              placeholder="Any special handling instructions?"
            />
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Calculate & Proceed
        </button>
      </form>
    </div>
  );
};

export default DomesticShipping;