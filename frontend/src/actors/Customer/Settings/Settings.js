import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import './styles/Settings.css';
import ManagePickupLocation from './ManagePickupLocation';

const Settings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState({ show: false, variant: 'success', message: '' });
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });
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

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/profile`,
                profile,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setShowAlert({
                show: true,
                variant: 'success',
                message: 'Profile updated successfully!'
            });
        } catch (error) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: 'Failed to update profile. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/notifications`,
                notifications,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setShowAlert({
                show: true,
                variant: 'success',
                message: 'Notification preferences updated successfully!'
            });
        } catch (error) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: 'Failed to update notification preferences. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
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
            await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/password`,
                {
                    currentPassword: password.currentPassword,
                    newPassword: password.newPassword
                },
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
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
        } catch (error) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: 'Failed to update password. Please check your current password and try again.'
            });
        } finally {
            setLoading(false);
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
            
            <Row>
                <Col md={6} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Profile Information</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleProfileUpdate}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                        required
                                    />
                                </Form.Group>
                                <Button type="submit" variant="primary">Update Profile</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Notification Preferences</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleNotificationUpdate}>
                                <Form.Check
                                    type="switch"
                                    id="email-notifications"
                                    label="Email Notifications"
                                    checked={notifications.emailNotifications}
                                    onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                                    className="mb-3"
                                />
                                <Form.Check
                                    type="switch"
                                    id="sms-notifications"
                                    label="SMS Notifications"
                                    checked={notifications.smsNotifications}
                                    onChange={(e) => setNotifications(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                                    className="mb-3"
                                />
                                <Form.Check
                                    type="switch"
                                    id="order-updates"
                                    label="Order Updates"
                                    checked={notifications.orderUpdates}
                                    onChange={(e) => setNotifications(prev => ({ ...prev, orderUpdates: e.target.checked }))}
                                    className="mb-3"
                                />
                                <Form.Check
                                    type="switch"
                                    id="promotional-emails"
                                    label="Promotional Emails"
                                    checked={notifications.promotionalEmails}
                                    onChange={(e) => setNotifications(prev => ({ ...prev, promotionalEmails: e.target.checked }))}
                                    className="mb-3"
                                />
                                <Button type="submit" variant="primary">Save Preferences</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Change Password</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handlePasswordChange}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Current Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password.currentPassword}
                                        onChange={(e) => setPassword(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password.newPassword}
                                        onChange={(e) => setPassword(prev => ({ ...prev, newPassword: e.target.value }))}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password.confirmPassword}
                                        onChange={(e) => setPassword(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        required
                                    />
                                </Form.Group>
                                <Button type="submit" variant="primary">Change Password</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Pickup Location Settings</Card.Header>
                        <Card.Body>
                            <ManagePickupLocation />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Settings;
