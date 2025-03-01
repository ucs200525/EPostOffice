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
        isPickupAddress: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAddresses(response.data);
        } catch (error) {
            showNotification('Failed to fetch addresses', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                isPickupAddress: false
            });
            fetchAddresses();
        } catch (error) {
            showNotification('Failed to add address', 'error');
        }
    };

    const handleDelete = async (addressId) => {
        try {
            await axios.delete(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${addressId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showNotification('Address deleted successfully', 'success');
            fetchAddresses();
        } catch (error) {
            showNotification('Failed to delete address', 'error');
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Addresses</h1>
                <button
                    className={styles.addButton}
                    onClick={() => setShowForm(true)}
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
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>State</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                                    required
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
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={formData.isPickupAddress}
                                    onChange={(e) => setFormData({...formData, isPickupAddress: e.target.checked})}
                                />
                                Set as pickup address
                            </label>
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" className={styles.submitButton}>Save Address</button>
                            <button 
                                type="button" 
                                className={styles.cancelButton}
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.addressGrid}>
                {addresses.map((address) => (
                    <div key={address._id} className={styles.addressCard}>
                        <div className={styles.addressHeader}>
                            <FaMapMarkerAlt className={styles.icon} />
                            {address.isPickupAddress && (
                                <span className={styles.pickupBadge}>Pickup Address</span>
                            )}
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
        </div>
    );
};

export default CustomerAddress;
