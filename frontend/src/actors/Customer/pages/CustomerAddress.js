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
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        addressType: 'delivery'
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
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAddresses(response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch addresses';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!formData.street.trim()) return 'Street address is required';
        if (!formData.city.trim()) return 'City is required';
        if (!formData.state.trim()) return 'State is required';
        if (!formData.postalCode.trim()) return 'Postal code is required';
        if (!formData.country.trim()) return 'Country is required';
        if (!['delivery', 'pickup'].includes(formData.addressType)) return 'Invalid address type';
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
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showNotification('Address added successfully', 'success');
            setShowForm(false);
            setFormData({
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: '',
                addressType: 'delivery'
            });
            fetchAddresses();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add address';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        setLoading(true);
        try {
            await axios.delete(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${addressId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showNotification('Address deleted successfully', 'success');
            fetchAddresses();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete address';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    if (loading && !addresses.length) {
        return <div className={styles.loading}>Loading addresses...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Addresses</h1>
                <button
                    className={styles.addButton}
                    onClick={() => setShowForm(true)}
                    disabled={loading}
                >
                    <FaPlus /> Add New Address
                </button>
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
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Street Address</label>
                            <input
                                type="text"
                                value={formData.street}
                                onChange={(e) => setFormData({...formData, street: e.target.value})}
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
                                    pattern="[0-9]{5,6}"
                                    title="Postal code must be 5-6 digits"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Address Type</label>
                            <select
                                value={formData.addressType}
                                onChange={(e) => setFormData({...formData, addressType: e.target.value})}
                                required
                                className={styles.select}
                                disabled={loading}
                            >
                                <option value="delivery">Delivery Location</option>
                                <option value="pickup">Pickup Location</option>
                            </select>
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" className={styles.submitButton} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Address'}
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
                    <h2>Pickup Addresses</h2>
                    <div className={styles.addressGrid}>
                        {addresses.filter(address => address.addressType === 'pickup').map((address) => (
                            <div key={address._id} className={`${styles.addressCard} ${styles.pickupCard}`}>
                                <div className={styles.addressHeader}>
                                    <FaMapMarkerAlt className={styles.icon} />
                                    <span className={styles.addressTypeBadge}>Pickup Location</span>
                                </div>
                                <div className={styles.addressDetails}>
                                    <p>{address.street}</p>
                                    <p>{address.city}, {address.state} {address.postalCode}</p>
                                    <p>{address.country}</p>
                                </div>
                                <div className={styles.addressActions}>
                                    <button 
                                        className={styles.editButton}
                                        onClick={() => {/* TODO: Implement edit */}}
                                        disabled={loading}
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    <button 
                                        className={styles.deleteButton}
                                        onClick={() => handleDelete(address._id)}
                                        disabled={loading}
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.addressSection}>
                    <h2>Delivery Addresses</h2>
                    <div className={styles.addressGrid}>
                        {addresses.filter(address => address.addressType === 'delivery').map((address) => (
                            <div key={address._id} className={`${styles.addressCard} ${styles.deliveryCard}`}>
                                <div className={styles.addressHeader}>
                                    <FaMapMarkerAlt className={styles.icon} />
                                    <span className={styles.addressTypeBadge}>Delivery Location</span>
                                </div>
                                <div className={styles.addressDetails}>
                                    <p>{address.street}</p>
                                    <p>{address.city}, {address.state} {address.postalCode}</p>
                                    <p>{address.country}</p>
                                </div>
                                <div className={styles.addressActions}>
                                    <button 
                                        className={styles.editButton}
                                        onClick={() => {/* TODO: Implement edit */}}
                                        disabled={loading}
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    <button 
                                        className={styles.deleteButton}
                                        onClick={() => handleDelete(address._id)}
                                        disabled={loading}
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerAddress;
