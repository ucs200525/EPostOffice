import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaWeightHanging, FaRuler, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';
import styles from './styles/Shipping.module.css';

const InternationalShipping = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    senderAddress: '',
    receiverAddress: '',
    destinationCountry: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    packageType: 'standard',
    declaredValue: '',
    specialInstructions: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to submit international shipping request
      navigate('/shipping/confirmation', { state: { shippingDetails: formData } });
    } catch (error) {
      console.error('Shipping submission failed:', error);
    }
  };

  return (
    <div className={styles.shippingContainer}>
      <h1>International Shipping</h1>
      <p>Ship your packages worldwide with reliable tracking</p>

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
            <label><FaGlobe /> Destination Country</label>
            <select
              value={formData.destinationCountry}
              onChange={(e) => setFormData({...formData, destinationCountry: e.target.value})}
            >
              <option value="">Select Country</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              {/* Add more countries */}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Delivery Address</label>
            <input
              type="text"
              value={formData.receiverAddress}
              onChange={(e) => setFormData({...formData, receiverAddress: e.target.value})}
              placeholder="Enter international delivery address"
            />
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

export default InternationalShipping;
