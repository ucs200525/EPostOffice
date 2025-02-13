import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaWeightHanging, FaRuler, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import styles from './styles/Shipping.module.css';

const DomesticShipping = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState('');
  const [formData, setFormData] = useState({
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    packageType: 'standard',
    specialInstructions: ''
  });

  // Fetch saved delivery addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses?userId=${user._id}`,
          {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }
        );
        setAddresses(response.data.addresses || []);
        
        // Set default delivery address if exists
        const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedDeliveryAddress(defaultAddress._id);
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      }
    };

    if (user?._id) {
      fetchAddresses();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDeliveryAddress) {
      alert('Please select a delivery address');
      return;
    }

    try {
      const selectedAddress = addresses.find(addr => addr._id === selectedDeliveryAddress);
      
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
      <h1>Domestic Shipping</h1>
      <p>Send packages anywhere within the country</p>

      <form onSubmit={handleSubmit} className={styles.shippingForm}>
        <div className={styles.formSection}>
          <h3><FaMapMarkerAlt /> Delivery Details</h3>
          
          {/* Display user's default address as pickup location */}
          <div className={styles.pickupAddress}>
            <h4>Pickup Address</h4>
            <div className={styles.addressDisplay}>
              <p>{user.address}</p>
              <p>{user.city}, {user.state}</p>
              <p>{user.postalCode}</p>
            </div>
          </div>

          {/* Delivery address selector */}
          <div className={styles.deliveryAddress}>
            <h4>Select Delivery Address</h4>
            <select
              value={selectedDeliveryAddress}
              onChange={(e) => setSelectedDeliveryAddress(e.target.value)}
              required
            >
              <option value="">Choose delivery address</option>
              {addresses.map(addr => (
                <option key={addr._id} value={addr._id}>
                  {addr.label} - {addr.streetAddress}, {addr.city}
                </option>
              ))}
            </select>
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
