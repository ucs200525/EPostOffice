import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const AddressForm = ({ type, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        addressLabel: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        type: type || 'delivery'
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        // Check if any required field is empty
        const requiredFields = {
            addressLabel: 'Label',
            address: 'Street Address',
            city: 'City',
            state: 'State',
            pincode: 'Postal Code',
            country: 'Country'
        };

        for (const [field, fieldName] of Object.entries(requiredFields)) {
            if (!formData[field]?.trim()) {
                setError(`${fieldName} is required`);
                return false;
            }
        }
        if (formData.pincode.length !== 6 || !/^\d+$/.test(formData.pincode)) {
            setError('Please enter a valid 6-digit postal code');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            const userId = localStorage.getItem('userId');
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses?userId=${userId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                onSave(response.data.address);
                onClose();
            } else {
                setError(response.data.message || 'Failed to save address');
            }
        } catch (err) {
            console.error('Error saving address:', err);
            setError(err.response?.data?.message || 'Failed to save address. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={true} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{type === 'pickup' ? 'Add Pickup Address' : 'Add Delivery Address'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Label</Form.Label>
                        <Form.Control
                            type="text"
                            name="addressLabel"
                            value={formData.addressLabel}
                            onChange={handleChange}
                            placeholder="e.g., Home, Office"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Street Address</Form.Label>
                        <Form.Control
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Street address"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="State"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="6-digit postal code"
                            maxLength={6}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            disabled
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Address'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddressForm;
