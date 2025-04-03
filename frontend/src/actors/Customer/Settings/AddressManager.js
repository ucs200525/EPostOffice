import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import styles from './styles/AddressManager.module.css';
import Notification from '../../../components/Notification';

const AddressManager = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState({ pickup: null, delivery: [] });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  const [addressForm, setAddressForm] = useState({
    label: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    type: '',
    isDefault: false
  });

  useEffect(() => {
    if (user?._id) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${user?._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setAddresses({
          pickup: response.data.data.pickup,
          delivery: response.data.data.delivery
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to fetch addresses: ' + (error.response?.data?.message || error.message)
      });
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${user?._id}`;
      const method = editingAddress ? 'put' : 'post';
      const endpoint = editingAddress ? `/${addressForm.type}` : '';
      
      const response = await axios[method](
        url + endpoint,
        addressForm,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          params: editingAddress ? { addressId: editingAddress._id } : undefined
        }
      );

      if (response.data.success) {
        await fetchAddresses();
        setNotification({
          show: true,
          type: 'success',
          message: `Address ${editingAddress ? 'updated' : 'added'} successfully`
        });
        handleFormReset();
      }
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: error.response?.data?.message || `Failed to ${editingAddress ? 'update' : 'add'} address`
      });
    }
  };

  const handleDeleteAddress = async (addressId, type) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${user?._id}/${type}`,
        {
          params: { addressId },
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success) {
        await fetchAddresses();
        setNotification({
          show: true,
          type: 'success',
          message: 'Address deleted successfully'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete address'
      });
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      ...address,
      type: address.type || 'delivery'
    });
    setShowAddressForm(true);
  };

  const handleFormReset = () => {
    setAddressForm({
      label: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      type: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const renderAddressForm = () => (
    <form onSubmit={handleAddressSubmit} className={styles.addressForm}>
      <div className={styles.formGroup}>
        <label>Label (e.g., Home, Office)</label>
        <input
          type="text"
          value={addressForm.label}
          onChange={(e) => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Street Address</label>
        <input
          type="text"
          value={addressForm.streetAddress}
          onChange={(e) => setAddressForm(prev => ({ ...prev, streetAddress: e.target.value }))}
          required
        />
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>City</label>
          <input
            type="text"
            value={addressForm.city}
            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>State</label>
          <input
            type="text"
            value={addressForm.state}
            onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Postal Code</label>
          <input
            type="text"
            value={addressForm.postalCode}
            onChange={(e) => setAddressForm(prev => ({ ...prev, postalCode: e.target.value }))}
            required
          />
        </div>
        {!editingAddress && (
          <div className={styles.formGroup}>
            <label>Address Type</label>
            <select
              value={addressForm.type}
              onChange={(e) => setAddressForm(prev => ({ ...prev, type: e.target.value }))}
              required
              disabled={addresses.pickup && addressForm.type === 'pickup'}
            >
              <option value="">Select Type</option>
              {!addresses.pickup && <option value="pickup">Pickup</option>}
              <option value="delivery">Delivery</option>
            </select>
            {addresses.pickup && addressForm.type === 'pickup' && (
              <small className={styles.helperText}>You can only have one pickup address.</small>
            )}
          </div>
        )}
      </div>
      <div className={styles.formGroup}>
        <label>
          <input
            type="checkbox"
            checked={addressForm.isDefault}
            onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
          />
          Set as default address
        </label>
      </div>
      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          {editingAddress ? 'Update Address' : 'Add Address'}
        </button>
        <button type="button" onClick={handleFormReset} className={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </form>
  );

  const renderAddress = (address, isPickup = false) => (
    <div key={address._id} className={`${styles.addressCard} ${isPickup ? styles.pickupAddress : styles.deliveryAddress}`}>
      <div className={styles.addressHeader}>
        <h4>{address.label}</h4>
        <div className={styles.badges}>
          {address.isDefault && <span className={styles.defaultBadge}>Default</span>}
          <span className={isPickup ? styles.pickupBadge : styles.deliveryBadge}>
            {isPickup ? 'Pickup' : 'Delivery'}
          </span>
        </div>
      </div>
      <div className={styles.addressContent}>
        <p>{address.streetAddress}</p>
        <p>{`${address.city}, ${address.state} ${address.postalCode}`}</p>
        <p>{address.country}</p>
      </div>
      <div className={styles.addressActions}>
        <button 
          onClick={() => handleEditAddress(address)} 
          className={styles.editButton}
        >
          Edit
        </button>
        {(!isPickup || addresses.delivery.length > 0) && (
          <button 
            onClick={() => handleDeleteAddress(address._id, isPickup ? 'pickup' : 'delivery')}
            className={styles.deleteButton}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      {showAddressForm ? (
        renderAddressForm()
      ) : (
        <div className={styles.addressesContainer}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Pickup Address</h3>
              {!addresses.pickup && (
                <button 
                  onClick={() => {
                    setAddressForm(prev => ({ ...prev, type: 'pickup' }));
                    setShowAddressForm(true);
                  }}
                  className={styles.addButton}
                >
                  Add Pickup Address
                </button>
              )}
            </div>
            {addresses.pickup ? (
              <div className={styles.pickupAddressContainer}>
                {renderAddress(addresses.pickup, true)}
              </div>
            ) : (
              <p className={styles.noAddress}>No pickup address set. Add a pickup address to start sending packages.</p>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Delivery Addresses</h3>
              <button 
                onClick={() => {
                  setAddressForm(prev => ({ ...prev, type: 'delivery' }));
                  setShowAddressForm(true);
                }}
                className={styles.addButton}
              >
                Add Delivery Address
              </button>
            </div>
            <div className={styles.addressGrid}>
              {addresses.delivery?.length > 0 ? (
                addresses.delivery.map(address => renderAddress(address))
              ) : (
                <p className={styles.noAddress}>No delivery addresses added. Add at least one delivery address.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManager;
