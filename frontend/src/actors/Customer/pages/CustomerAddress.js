import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import styles from '../styles/CustomerAddress.module.css';
import Notification from '../../../components/Notification';

const CustomerAddress = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState({ pickup: null, delivery: [] });
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState({
        label: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        type: 'delivery',
        isDefault: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, [token]);

    const fetchAddresses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${user._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setAddresses(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch addresses');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch addresses';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!formData.label.trim()) return 'Address label is required';
        if (!formData.streetAddress.trim()) return 'Street address is required';
        if (!formData.city.trim()) return 'City is required';
        if (!formData.state.trim()) return 'State is required';
        if (!formData.postalCode.trim()) return 'Postal code is required';
        if (!formData.country.trim()) return 'Country is required';
        if (!['delivery', 'pickup'].includes(formData.type)) return 'Invalid address type';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            showNotification(validationError, 'error');
            return;
        }

        setLoading(true);
        try {
            const baseUrl = `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${user._id}`;
            let response;
            
            if (editMode) {
                // Fix: Send the correct address type in the URL and addressId in the body
                response = await axios.put(
                    `${baseUrl}/${formData.type}`,
                    {
                        ...formData,
                        addressId: formData._id // Include addressId in the body
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                response = await axios.post(
                    baseUrl,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            
            if (response.data.success) {
                showNotification(`Address ${editMode ? 'updated' : 'added'} successfully`, 'success');
                setShowForm(false);
                setEditMode(false);
                setFormData({
                    label: '',
                    streetAddress: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'India',
                    type: 'delivery',
                    isDefault: false
                });
                fetchAddresses();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || `Failed to ${editMode ? 'update' : 'add'} address`;
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (addressId, type) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        setLoading(true);
        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${user._id}/${type}`,
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    params: { addressId }
                }
            );
            
            if (response.data.success) {
                showNotification('Address deleted successfully', 'success');
                fetchAddresses();
            } else {
                throw new Error(response.data.message || 'Failed to delete address');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete address';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (address, type) => {
        console.log('Edit clicked:', address); // Add this debug log
        setFormData({
            _id: address._id,
            label: address.label || '',
            streetAddress: address.streetAddress || '',
            city: address.city || '',
            state: address.state || '',
            postalCode: address.postalCode || '',
            country: address.country || 'India',
            type: type,
            isDefault: address.isDefault || false
        });
        setEditMode(true);
        setShowForm(true);
    };

    const handleAddClick = () => {
        setFormData({
            label: '',
            streetAddress: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India',
            type: 'delivery',
            isDefault: false
        });
        setEditMode(false);
        setShowForm(true);
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    if (loading && !addresses.delivery.length && !addresses.pickup) {
        return <div className={styles.loading}>Loading addresses...</div>;
    }

    const renderAddress = (address, type) => (
        <div key={address._id} className={`${styles.addressCard} ${styles[`${type}Card`]}`}>
            <div className={styles.addressHeader}>
                <h3>{address.label || type}</h3>
                {address.isDefault && <span className={styles.defaultBadge}>Default</span>}
            </div>
            <div className={styles.addressDetails}>
                <p><FaMapMarkerAlt className={styles.icon} /> {address.streetAddress}</p>
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p>{address.country}</p>
            </div>
            <div className={styles.addressActions}>
                <button 
                    className={styles.editButton} 
                    onClick={() => handleEdit(address, type)}
                    disabled={loading}
                >
                    <FaEdit /> Edit
                </button>
                <button 
                    className={styles.deleteButton} 
                    onClick={() => handleDelete(address._id, type)}
                    disabled={loading}
                >
                    <FaTrash /> Delete
                </button>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Addresses</h1>
                {(!addresses.pickup || formData.type === 'delivery') && (
                    <button
                        className={styles.addButton}
                        onClick={handleAddClick}
                        disabled={loading}
                    >
                        <FaPlus /> Add New Address
                    </button>
                )}
            </div>

            {notification.show && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ show: false })}
                />
            )}

            {error && <div className={styles.error}>{error}</div>}

            {showForm && (
                <div className={styles.formContainer}>
                    <h2>{editMode ? 'Edit Address' : 'Add New Address'}</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Address Label</label>
                            <input
                                type="text"
                                value={formData.label}
                                onChange={(e) => setFormData({...formData, label: e.target.value})}
                                placeholder="e.g., Home, Office"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Street Address</label>
                            <input
                                type="text"
                                value={formData.streetAddress}
                                onChange={(e) => setFormData({...formData, streetAddress: e.target.value})}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>State</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Postal Code</label>
                                <input
                                    type="text"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Address Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    required
                                    disabled={loading}
                                >
                                    <option value="delivery">Delivery</option>
                                    <option value="pickup">Pickup</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                                    disabled={loading}
                                />
                                Set as default address
                            </label>
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" className={styles.submitButton} disabled={loading}>
                                {loading ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Address' : 'Add Address')}
                            </button>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => setShowForm(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.addressSections}>
                <div className={styles.addressSection}>
                    <h2>Pickup Address</h2>
                    {addresses.pickup ? (
                        renderAddress(addresses.pickup, 'pickup')
                    ) : (
                        <p className={styles.noAddress}>No pickup address set</p>
                    )}
                </div>

                <div className={styles.addressSection}>
                    <h2>Delivery Addresses</h2>
                    <div className={styles.addressGrid}>
                        {addresses.delivery && addresses.delivery.length > 0 ? (
                            addresses.delivery.map(address => renderAddress(address, 'delivery'))
                        ) : (
                            <p className={styles.noAddress}>No delivery addresses added</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerAddress;
