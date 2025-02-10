import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBox, FaWeightHanging, FaRuler, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import styles from './styles/Shipping.module.css';

const DomesticShipping = () => {
  const navigate = useNavigate();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [formData, setFormData] = useState({
    senderAddress: '',
    receiverAddress: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    packageType: 'standard',
    specialInstructions: ''
  });

  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:4000/api/customer/addresses',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setSavedAddresses(response.data.addresses);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const handleAddressSelect = (addressId) => {
    const selected = savedAddresses.find(addr => addr._id === addressId);
    if (selected) {
      setSelectedAddress(addressId);
      setFormData(prev => ({
        ...prev,
        receiverAddress: `${selected.streetAddress}, ${selected.city}, ${selected.state} ${selected.postalCode}, ${selected.country}`
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to submit domestic shipping request
      navigate('/shipping/confirmation', { state: { shippingDetails: formData } });
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
          <div className={styles.formGroup}>
            <label>Pickup Address</label>
            <input
              type="text"
              value={formData.senderAddress}
              onChange={(e) => setFormData({...formData, senderAddress: e.target.value})}
              placeholder="Enter pickup address"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Delivery Address</label>
            <input
              type="text"
              value={formData.receiverAddress}
              onChange={(e) => setFormData({...formData, receiverAddress: e.target.value})}
              placeholder="Enter delivery address"
            />
          </div>
        </div>

        <div className={styles.addressSection}>
          <h3>Select Delivery Address</h3>
          <select
            value={selectedAddress}
            onChange={(e) => handleAddressSelect(e.target.value)}
          >
            <option value="">Choose an address</option>
            {savedAddresses.map(addr => (
              <option key={addr._id} value={addr._id}>
                {addr.label} - {addr.streetAddress}
              </option>
            ))}
          </select>
          <Link to="/settings/addresses" className={styles.manageAddressLink}>
            Manage Addresses
          </Link>
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
