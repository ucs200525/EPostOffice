import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { geocodeAddress } from '../../../utils/geocoding';
import axios from 'axios';

const AddressManager = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`/api/customer/${user.id}/addresses/delivery`);
      if (response.data.success) {
        setAddresses(response.data.addresses);
      }
    } catch (error) {
      setNotification({
        show: true,
        message: 'Failed to fetch addresses',
        type: 'error'
      });
    }
  };
  const handleAddAddress = async (addressData) => {
    try {
      const coordinates = await geocodeAddress(addressData.fullAddress);
      const response = await axios.post(`/api/customer/${user.id}/addresses`, {
        ...addressData,
        coordinates
      });

      if (response.data.success) {
        setAddresses([...addresses, response.data.address]);
        setNotification({
          show: true,
          message: 'Address added successfully',
          type: 'success'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: 'Failed to add address',
        type: 'error'
      });
    }
  };
  const handleUpdateAddress = async (addressId, addressData) => {
    try {
      const coordinates = await geocodeAddress(addressData.fullAddress);
      const response = await axios.put(`/api/customer/${user.id}/addresses/${addressId}`, {
        ...addressData,
        coordinates
      });

      if (response.data.success) {
        const updatedAddresses = addresses.map(addr =>
          addr._id === addressId ? response.data.address : addr
        );
        setAddresses(updatedAddresses);
        setNotification({
          show: true,
          message: 'Address updated successfully',
          type: 'success'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: 'Failed to update address',
        type: 'error'
      });
    }
  };
  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await axios.delete(`/api/customer/${user.id}/addresses/delivery/${addressId}`);
      if (response.data.success) {
        const updatedAddresses = addresses.filter(addr => addr._id !== addressId);
        setAddresses(updatedAddresses);
        setNotification({
          show: true,
          message: 'Address deleted successfully',
          type: 'success'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: 'Failed to delete address',
        type: 'error'
      });
    }
  };
  return (
    <div className="address-manager">
      <h2>Manage Addresses</h2>
      {/* Address list and form components will be added here */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
