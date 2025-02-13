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
        `http://localhost:4000/api/customer/pickup-location?userId=${user._id}`,
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
        `http://localhost:4000/api/customer/pickup-location`,
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

      {/* Form Modal */}
      {showForm && (
        <div className={styles.modal}>
          {/* Form implementation similar to ManageAddresses but for single location */}
        </div>
      )}
    </div>
  );
};

export default ManagePickupLocation;
