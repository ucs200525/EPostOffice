import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import styles from './styles/ManageAddresses.module.css';
import { useAuth } from '../../../context/AuthContext';

const ManageAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses?userId=${user._id}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Fetched addresses:', response.data);
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setErrors({ fetch: 'Failed to load addresses' });
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (!addressForm.label.trim()) {
      newErrors.label = 'Label is required';
    }
    if (!addressForm.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }
    if (!addressForm.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!addressForm.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!addressForm.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{6}$/.test(addressForm.postalCode)) {
      newErrors.postalCode = 'Invalid postal code format';
    }
    if (!addressForm.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = editingAddress 
        ? `/api/customer/addresses/${editingAddress._id}`
        : '/api/customer/addresses';

      const response = await axios({
        method: editingAddress ? 'put' : 'post',
        url: `${process.env.REACT_APP_BACKEND_URL}${endpoint}`,
        params: { userId: user._id },
        data: addressForm,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Server response:', response.data);

      if (response.data.success) {
        await fetchAddresses();
        resetForm();
        setShowAddForm(false);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Save address error:', error.response || error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to save address'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${addressId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        fetchAddresses();
      } catch (error) {
        console.error('Failed to delete address:', error);
      }
    }
  };

  const resetForm = () => {
    setAddressForm({
      label: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddForm(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Manage Addresses</h1>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          <FaPlus /> Add New Address
        </button>
      </header>

      <div className={styles.addressList}>
        {addresses.map(address => (
          <div key={address._id} className={styles.addressCard}>
            <div className={styles.addressInfo}>
              <h3>
                {address.label}
                {address.isDefault && (
                  <span className={styles.defaultBadge}>
                    <FaCheck /> Default
                  </span>
                )}
              </h3>
              <p><FaMapMarkerAlt /> {address.streetAddress}</p>
              <p>{address.city}, {address.state} {address.postalCode}</p>
              <p>{address.country}</p>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.editButton}
                onClick={() => {
                  setEditingAddress(address);
                  setAddressForm(address);
                  setShowAddForm(true);
                }}
              >
                <FaEdit /> Edit
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(address._id)}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Label (e.g., Home, Office)*</label>
                <input
                  type="text"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                  className={errors.label ? styles.errorInput : ''}
                />
                {errors.label && <span className={styles.errorText}>{errors.label}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Street Address</label>
                <input
                  type="text"
                  value={addressForm.streetAddress}
                  onChange={(e) => setAddressForm({...addressForm, streetAddress: e.target.value})}
                  className={errors.streetAddress ? styles.errorInput : ''}
                  required
                />
                {errors.streetAddress && <span className={styles.errorText}>{errors.streetAddress}</span>}
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className={errors.city ? styles.errorInput : ''}
                    required
                  />
                  {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    className={errors.state ? styles.errorInput : ''}
                    required
                  />
                  {errors.state && <span className={styles.errorText}>{errors.state}</span>}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Postal Code</label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
                    className={errors.postalCode ? styles.errorInput : ''}
                    required
                  />
                  {errors.postalCode && <span className={styles.errorText}>{errors.postalCode}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>Country</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                    className={errors.country ? styles.errorInput : ''}
                    required
                  />
                  {errors.country && <span className={styles.errorText}>{errors.country}</span>}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                  />
                  Set as default address
                </label>
              </div>
              <div className={styles.modalActions}>
                <button 
                  type="submit" 
                  className={styles.saveButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingAddress ? 'Save Changes' : 'Add Address'}
                </button>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={resetForm}
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

export default ManageAddresses;
