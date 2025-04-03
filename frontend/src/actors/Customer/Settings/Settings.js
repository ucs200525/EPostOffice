import React, { useState, useEffect } from 'react';
import { Container, Spinner, Row, Col } from 'react-bootstrap';
import Notification from '../../../components/Notification';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './styles/Settings.module.css';

const Settings = () => {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [showAlert, setShowAlert] = useState({ show: false, variant: 'success', message: '' });
    const navigate = useNavigate();

    const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        smsNotifications: true,
        orderUpdates: true,
        promotionalEmails: false
    });
    const [password, setPassword] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            setLoading(true);
            Promise.all([
                fetchProfile(),
                fetchNotifications()
            ])
            .then(() => setLoading(false))
            .catch(err => {
                setShowAlert({
                    show: true,
                    variant: 'danger',
                    message: err.message
                });
                setLoading(false);
            });
        }
    }, [isAuthenticated, user]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!user || !user._id) {
                throw new Error('User not authenticated');
            }
            
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/profile/${user._id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (response.data.success) {
                const { name, email, phone } = response.data.data;
                setProfile({ name, email, phone });
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: err.message || 'Failed to fetch profile'
            });
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!user || !user._id) throw new Error('User not authenticated');

            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/notifications/${user._id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                // Set default values if data is missing
                const defaultSettings = {
                    emailNotifications: true,
                    smsNotifications: true,
                    orderUpdates: true,
                    promotionalEmails: false
                };
                setNotifications({
                    ...defaultSettings,
                    ...response.data.data
                });
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: err.message || 'Failed to fetch notification preferences'
            });
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/profile/${user._id}`,
                profile,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setShowAlert({
                    show: true,
                    variant: 'success',
                    message: 'Profile updated successfully!'
                });
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: error.message || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/notifications/${user._id}`,
                notifications,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setShowAlert({
                    show: true,
                    variant: 'success',
                    message: 'Notification preferences updated successfully!'
                });
                // Update local state with returned data
                if (response.data.data) {
                    setNotifications(response.data.data);
                }
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: error.message || 'Failed to update notification preferences'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (password.newPassword !== password.confirmPassword) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: 'New passwords do not match!'
            });
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/password/${user._id}`,
                {
                    currentPassword: password.currentPassword,
                    newPassword: password.newPassword
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setShowAlert({
                    show: true,
                    variant: 'success',
                    message: 'Password updated successfully!'
                });
                setPassword({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: error.message || 'Failed to update password'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingSpinner}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <Container className={styles.settingsContainer}>
            {showAlert.show && (
                <Notification
                    type={showAlert.variant}
                    message={showAlert.message}
                    onClose={() => setShowAlert(prev => ({ ...prev, show: false }))}
                />
            )}
            
            <Row>
                <Col md={6} className="mb-4">
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>Profile Information</div>
                        <div className={styles.cardBody}>
                            <form onSubmit={handleProfileUpdate}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Name</label>
                                    <input
                                        className={styles.formControl}
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Email</label>
                                    <input
                                        className={styles.formControl}
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Phone</label>
                                    <input
                                        className={styles.formControl}
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                        required
                                    />
                                </div>
                                <button type="submit" className={styles.primaryButton}>
                                    Update Profile
                                </button>
                            </form>
                        </div>
                    </div>
                </Col>

                <Col md={6} className="mb-4">
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>Notification Preferences</div>
                        <div className={styles.cardBody}>
                            <form onSubmit={handleNotificationUpdate}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        <input
                                            type="checkbox"
                                            className={styles.formControl}
                                            checked={notifications.emailNotifications}
                                            onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                                        />
                                        Email Notifications
                                    </label>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        <input
                                            type="checkbox"
                                            className={styles.formControl}
                                            checked={notifications.smsNotifications}
                                            onChange={(e) => setNotifications(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                                        />
                                        SMS Notifications
                                    </label>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        <input
                                            type="checkbox"
                                            className={styles.formControl}
                                            checked={notifications.orderUpdates}
                                            onChange={(e) => setNotifications(prev => ({ ...prev, orderUpdates: e.target.checked }))}
                                        />
                                        Order Updates
                                    </label>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        <input
                                            type="checkbox"
                                            className={styles.formControl}
                                            checked={notifications.promotionalEmails}
                                            onChange={(e) => setNotifications(prev => ({ ...prev, promotionalEmails: e.target.checked }))}
                                        />
                                        Promotional Emails
                                    </label>
                                </div>
                                <button type="submit" className={styles.primaryButton}>
                                    Update Preferences
                                </button>
                            </form>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>Password</div>
                        <div className={styles.cardBody}>
                            <form onSubmit={handlePasswordUpdate}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Current Password</label>
                                    <input
                                        className={styles.formControl}
                                        type="password"
                                        value={password.currentPassword}
                                        onChange={(e) => setPassword(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>New Password</label>
                                    <input
                                        className={styles.formControl}
                                        type="password"
                                        value={password.newPassword}
                                        onChange={(e) => setPassword(prev => ({ ...prev, newPassword: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Confirm Password</label>
                                    <input
                                        className={styles.formControl}
                                        type="password"
                                        value={password.confirmPassword}
                                        onChange={(e) => setPassword(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        required
                                    />
                                </div>
                                <button type="submit" className={styles.primaryButton}>
                                    Change Password
                                </button>
                            </form>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Settings;