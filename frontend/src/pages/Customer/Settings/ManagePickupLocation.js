import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { FaMapMarkerAlt } from 'react-icons/fa';
import styles from './styles/ManagePickupLocation.module.css';

const ManagePickupLocation = () => {
  const { user } = useAuth();
  const [pickupLocation, setPickupLocation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [locationForm, setLocationForm] = useState({
    label: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  useEffect(() => {
    fetchPickupLocation();
  }, [user]);

  const fetchPickupLocation = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/pickup-location?userId=${user._id}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setPickupLocation(response.data.pickupLocation);
    } catch (error) {
      console.error('Failed to fetch pickup location:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/pickup-location`,
        locationForm,
        {
          params: { userId: user._id },
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      fetchPickupLocation();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to update pickup location:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Pickup Location</h2>
      {pickupLocation ? (
        <div className={styles.locationCard}>
          <div className={styles.locationInfo}>
            <h3>{pickupLocation.label}</h3>
            <p><FaMapMarkerAlt /> {pickupLocation.streetAddress}</p>
            <p>{pickupLocation.city}, {pickupLocation.state} {pickupLocation.postalCode}</p>
            <p>{pickupLocation.country}</p>
          </div>
          <button 
            className={styles.editButton}
            onClick={() => {
              setLocationForm(pickupLocation);
              setShowForm(true);
            }}
          >
            Edit Location
          </button>
        </div>
      ) : (
        <button 
          className={styles.addButton}
          onClick={() => setShowForm(true)}
        >
          Set Pickup Location
        </button>
      )}

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="label">Location Label</label>
                <input
                  type="text"
                  id="label"
                  value={locationForm.label}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Home, Office, etc."
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="streetAddress">Street Address</label>
                <input
                  type="text"
                  id="streetAddress"
                  value={locationForm.streetAddress}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, streetAddress: e.target.value }))}
                  placeholder="Enter street address"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  value={locationForm.city}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  value={locationForm.state}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="Enter state"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  value={locationForm.postalCode}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="Enter postal code"
                  required
                />
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.saveButton}>Save Location</button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowForm(false);
                    setLocationForm({
                      label: '',
                      streetAddress: '',
                      city: '',
                      state: '',
                      postalCode: '',
                      country: 'India'
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePickupLocation;
