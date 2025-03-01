import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const AddressManager = ({ type = 'delivery' }) => {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingAddress, setEditingAddress] = useState(null);
    const [newAddress, setNewAddress] = useState({
        label: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isDefault: false,
        type: type // 'pickup' or 'delivery'
    });

    const fetchAddresses = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/${user.id}/addresses/${type}`,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            if (response.data.success) {
                if (type === 'pickup') {
                    setAddresses(response.data.address ? [response.data.address] : []);
                } else {
                    setAddresses(response.data.addresses || []);
                }
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAddress = async (e) => {
        e.preventDefault();
        if (!user?.id) return;
        setLoading(true);
        try {
            const addressData = {
                ...(editingAddress || newAddress),
                type // Ensure type is included
            };

            const endpoint = editingAddress?._id ?
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/${user.id}/addresses/${editingAddress._id}` :
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/${user.id}/addresses`;

            const method = editingAddress?._id ? 'put' : 'post';

            const response = await axios[method](endpoint, addressData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                fetchAddresses();
                resetForm();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error saving address:', error);
            setError(error.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!user?.id || !window.confirm('Are you sure you want to delete this address?')) return;
        
        setLoading(true);
        try {
            await axios.delete(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/${user.id}/addresses/${type}/${addressId}`,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            fetchAddresses();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete address');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (user?.id) fetchAddresses();
    }, [user?.id]);

    const resetForm = () => {
        setEditingAddress(null);
        setNewAddress({
            label: '',
            streetAddress: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            isDefault: false,
            type: type
        });
    };
    if (loading) return <Spinner animation="border" />;
    if (error) return <div className="text-danger">{error}</div>;

    return (
        <div>
            <Form onSubmit={handleSubmitAddress}>
                <Form.Group className="mb-3">
                    <Form.Label>Label</Form.Label>
                    <Form.Control
                        type="text"
                        value={editingAddress?.label || newAddress.label}
                        onChange={(e) => editingAddress ? 
                            setEditingAddress({...editingAddress, label: e.target.value}) :
                            setNewAddress({...newAddress, label: e.target.value})}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Street Address</Form.Label>
                    <Form.Control
                        type="text"
                        value={editingAddress?.streetAddress || newAddress.streetAddress}
                        onChange={(e) => editingAddress ?
                            setEditingAddress({...editingAddress, streetAddress: e.target.value}) :
                            setNewAddress({...newAddress, streetAddress: e.target.value})}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                        type="text"
                        value={editingAddress?.city || newAddress.city}
                        onChange={(e) => editingAddress ?
                            setEditingAddress({...editingAddress, city: e.target.value}) :
                            setNewAddress({...newAddress, city: e.target.value})}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                        type="text"
                        value={editingAddress?.state || newAddress.state}
                        onChange={(e) => editingAddress ?
                            setEditingAddress({...editingAddress, state: e.target.value}) :
                            setNewAddress({...newAddress, state: e.target.value})}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                        type="text"
                        value={editingAddress?.postalCode || newAddress.postalCode}
                        onChange={(e) => editingAddress ?
                            setEditingAddress({...editingAddress, postalCode: e.target.value}) :
                            setNewAddress({...newAddress, postalCode: e.target.value})}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                        type="text"
                        value={editingAddress?.country || newAddress.country}
                        onChange={(e) => editingAddress ?
                            setEditingAddress({...editingAddress, country: e.target.value}) :
                            setNewAddress({...newAddress, country: e.target.value})}
                        required
                    />
                </Form.Group>
                {/* Add other address fields similarly */}
                {/* City, State, Postal Code, Country */}

                <Form.Check 
                    type="switch"
                    id="default-address"
                    label="Set as default address"
                    checked={editingAddress?.isDefault || newAddress.isDefault}
                    onChange={(e) => editingAddress ?
                        setEditingAddress({...editingAddress, isDefault: e.target.checked}) :
                        setNewAddress({...newAddress, isDefault: e.target.checked})}
                />

                <div className="mt-3">
                    <Button type="submit" variant="primary" disabled={loading}>
                        {editingAddress ? 'Update' : 'Add'} Address
                    </Button>
                    {editingAddress && (
                        <Button variant="secondary" className="ms-2" onClick={resetForm}>
                            Cancel
                        </Button>
                    )}
                </div>
            </Form>

            <ListGroup className="mt-4">
                {addresses.filter(addr => addr.type === type).map(address => (
                    <ListGroup.Item key={address._id} className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6>{address.label} {address.isDefault && <Badge bg="success">Default</Badge>}</h6>
                            <p className="mb-0">
                                {address.streetAddress}, {address.city}, {address.state} {address.postalCode}, {address.country}
                            </p>
                        </div>
                        <div>
                            <Button variant="outline-primary" size="sm" className="me-2"
                                onClick={() => setEditingAddress(address)}>
                                Edit
                            </Button>
                            <Button variant="outline-danger" size="sm"
                                onClick={() => handleDeleteAddress(address._id)}>
                                Delete
                            </Button>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
};

export default AddressManager;
