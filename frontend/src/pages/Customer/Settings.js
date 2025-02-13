import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import './styles/Settings.css';
import { useDarkMode } from '../../context/DarkModeContext';
import { Tabs } from 'antd';
import ManageAddresses from './Settings/ManageAddresses';
import ManagePickupLocation from './Settings/ManagePickupLocation';
// import 'antd/dist/antd.css'; // Add this line for antd styles

const { TabPane } = Tabs;

const Settings = () => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notifications: false,
        language: 'en',
        darkMode: false,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(true);
    const [showAlert, setShowAlert] = useState({ show: false, variant: 'success', message: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchUserData();
        // Sync dark mode state with form data
        setFormData(prev => ({
            ...prev,
            darkMode: isDarkMode
        }));
    }, [isDarkMode]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:4000/api/user/settings`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const userData = response.data;
            setFormData(prev => ({
                ...prev,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                notifications: userData.notifications || false,
                language: userData.language || 'en',
                darkMode: userData.darkMode || false
            }));
        } catch (error) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: 'Error loading user data. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = 'Invalid email address';
        }
        if (formData.phone && !formData.phone.match(/^\+?[\d\s-]{10,}$/)) {
            newErrors.phone = 'Invalid phone number';
        }
        
        // Password validation
        if (formData.newPassword) {
            if (formData.newPassword.length < 8) {
                newErrors.newPassword = 'Password must be at least 8 characters';
            }
            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        if (name === 'darkMode') {
            toggleDarkMode(); // Use context's toggle function
        }
        
        setFormData(prevState => ({
            ...prevState,
            [name]: newValue
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const applyDarkMode = (isDark) => {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', isDark);
    };

    const applyLanguage = (lang) => {
        localStorage.setItem('language', lang);
        // Implement language change logic here
        // You might want to use i18n library for proper implementation
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await axios.put(
                `http://localhost:4000/api/user/settings`,
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    notifications: formData.notifications,
                    language: formData.language,
                    darkMode: formData.darkMode
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                setShowAlert({
                    show: true,
                    variant: 'success',
                    message: 'Settings saved successfully!'
                });
            }
        } catch (error) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: error.response?.data?.message || 'Error saving settings. Please try again.'
            });
        } finally {
            setLoading(false);
            setTimeout(() => setShowAlert(prev => ({ ...prev, show: false })), 3000);
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <Container className="settings-container my-4">
            {showAlert.show && (
                <Alert variant={showAlert.variant} onClose={() => setShowAlert(prev => ({ ...prev, show: false }))} dismissible>
                    {showAlert.message}
                </Alert>
            )}
            
            <h2 className="mb-4">Settings</h2>
            
            <Tabs defaultActiveKey="1">
                <TabPane tab="Delivery Addresses" key="1">
                    <ManageAddresses />
                </TabPane>
                <TabPane tab="Pickup Location" key="2">
                    <ManagePickupLocation />
                </TabPane>
            </Tabs>
        </Container>
    );
};

export default Settings;
