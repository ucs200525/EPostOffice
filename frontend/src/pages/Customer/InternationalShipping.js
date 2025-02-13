import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaWeightHanging, FaRuler, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import styles from './styles/Shipping.module.css';

const InternationalShipping = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState('');
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    packageType: 'standard',
    specialInstructions: '',
    destinationCountry: '',
    customsDeclaration: {
      itemDescription: '',
      value: '',
      category: ''
    }
  });

  useEffect(() => {
    fetchAddresses();
    fetchCountries();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses?userId=${user._id}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setAddresses(response.data.addresses || []);
      
      const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedDeliveryAddress(defaultAddress._id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/shipping/countries`);
      setCountries(response.data.countries);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeliveryAddress || !formData.destinationCountry) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const selectedAddress = addresses.find(addr => addr._id === selectedDeliveryAddress);
      
      const shippingDetails = {
        ...formData,
        pickupAddress: {
          streetAddress: user.address,
          city: user.city,
          state: user.state,
          postalCode: user.postalCode,
          country: 'India'
        },
        deliveryAddress: selectedAddress,
        type: 'international'
      };

      navigate('/shipping/confirmation', { state: { shippingDetails } });
    } catch (error) {
      console.error('Shipping submission failed:', error);
    }
  };

  return (
    <div className={styles.shippingContainer}>
      <h1>International Shipping</h1>
      <p>Send packages worldwide</p>

      <form onSubmit={handleSubmit} className={styles.shippingForm}>
        <div className={styles.formSection}>
          <h3><FaMapMarkerAlt /> Delivery Details</h3>
          
          {/* Pickup Address Display */}
          <div className={styles.pickupAddress}>
            <h4>Pickup Address</h4>
            <div className={styles.addressDisplay}>
              <p>{user.address}</p>
              <p>{user.city}, {user.state}</p>
              <p>{user.postalCode}</p>
              <p>India</p>
            </div>
          </div>

          {/* Delivery Address Section */}
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

            {/* Destination Country Selection */}
            <div className={styles.formGroup}>
              <label><FaGlobe /> Destination Country</label>
              <select
                value={formData.destinationCountry}
                onChange={(e) => setFormData({...formData, destinationCountry: e.target.value})}
                required
              >
                <option value="">Select country</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
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

        {/* Customs Declaration */}
        <div className={styles.formSection}>
          <h3>Customs Declaration</h3>
          <div className={styles.formGroup}>
            <label>Item Description</label>
            <textarea
              value={formData.customsDeclaration.itemDescription}
              onChange={(e) => setFormData({
                ...formData,
                customsDeclaration: {
                  ...formData.customsDeclaration,
                  itemDescription: e.target.value
                }
              })}
              required
              placeholder="Detailed description of items"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Declared Value (USD)</label>
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
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Category</label>
            <select
              value={formData.customsDeclaration.category}
              onChange={(e) => setFormData({
                ...formData,
                customsDeclaration: {
                  ...formData.customsDeclaration,
                  category: e.target.value
                }
              })}
              required
            >
              <option value="">Select category</option>
              <option value="gift">Gift</option>
              <option value="documents">Documents</option>
              <option value="commercial">Commercial Goods</option>
              <option value="sample">Sample</option>
            </select>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Calculate & Proceed
        </button>
      </form>
    </div>
  );
};

export default InternationalShipping;
