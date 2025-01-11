import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import '../styles/Settings.css';
import { useDarkMode } from '../context/DarkModeContext';



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
        // Set initial dark mode state from context
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
        
        setFormData(prevState => ({
            ...prevState,
            [name]: newValue
        }));

        // Use context's toggle for dark mode
        if (name === 'darkMode') {
            toggleDarkMode();
        }
        if (name === 'language') {
            applyLanguage(value);
        }

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
            
            <Form onSubmit={handleSubmit}>
                <Card className="mb-4">
                    <Card.Header>
                        <h4>Profile Settings</h4>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.firstName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.firstName}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.lastName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.lastName}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                isInvalid={!!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                isInvalid={!!errors.phone}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.phone}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Card.Body>
                </Card>

                <Card className="mb-4">
                    <Card.Header>
                        <h4>Change Password</h4>
                    </Card.Header>
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                isInvalid={!!errors.currentPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.currentPassword}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                isInvalid={!!errors.newPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.newPassword}
                            </Form.Control.Feedback>
                            <div className="password-requirements">
                                Password must be at least 8 characters long
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                isInvalid={!!errors.confirmPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.confirmPassword}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Card.Body>
                </Card>

                <Card className="mb-4">
                    <Card.Header>
                        <h4>Preferences</h4>
                    </Card.Header>
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="notifications"
                                label="Enable Email Notifications"
                                checked={formData.notifications}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Language</Form.Label>
                            <Form.Select
                                name="language"
                                value={formData.language}
                                onChange={handleInputChange}
                            >
                                <option value="en">English</option>
                                <option value="fr">French</option>
                                <option value="es">Spanish</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                name="darkMode"
                                label="Dark Mode"
                                checked={formData.darkMode}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>

                <div className="d-grid gap-2">
                    <Button 
                        variant="primary" 
                        type="submit" 
                        size="lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Saving...
                            </>
                        ) : 'Save Settings'}
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default Settings;
