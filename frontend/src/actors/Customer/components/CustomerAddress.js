import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import AddressForm from './AddressForm';

const CustomerAddress = () => {
    const [addresses, setAddresses] = useState({ pickup: null, delivery: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addressType, setAddressType] = useState(null);
    const { user } = useAuth();

    const fetchAddresses = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses?userId=${userId}`,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );

            if (response.data.success) {
                const pickupAddress = response.data.addresses.find(addr => addr.type === 'pickup');
                const deliveryAddresses = response.data.addresses.filter(addr => addr.type === 'delivery');
                
                setAddresses({
                    pickup: pickupAddress || null,
                    delivery: deliveryAddresses || []
                });
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching addresses:', err);
            setError('Failed to load addresses. Please try again.');
            setAddresses({ pickup: null, delivery: [] });
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = (type) => {
        setAddressType(type);
        setShowAddForm(true);
    };

    const handleSaveAddress = async (newAddress) => {
        await fetchAddresses(); // Refresh the addresses list
        setShowAddForm(false);
        setAddressType(null);
    };

    const handleDeleteAddress = async (addressId, type) => {
        try {
            const userId = localStorage.getItem('userId');
            await axios.delete(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${addressId}?userId=${userId}&type=${type}`,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            await fetchAddresses(); // Refresh the addresses list
        } catch (err) {
            console.error('Error deleting address:', err);
            setError('Failed to delete address. Please try again.');
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchAddresses();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center p-5">
                <Spinner animation="border" />
            </div>
        );
    }

    const renderAddress = (address) => (
        <div className="address-details">
            <p className="mb-1"><strong>{address.label}</strong></p>
            <p className="mb-1">{address.streetAddress}</p>
            <p className="mb-1">{address.city}, {address.state}</p>
            <p className="mb-1">{address.postalCode}</p>
            <p className="mb-3">{address.country}</p>
            <div className="d-flex gap-2">
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteAddress(address._id, address.type)}
                >
                    Delete
                </Button>
            </div>
        </div>
    );

    return (
        <div className="customer-addresses">
            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
            
            {/* Pickup Address */}
            <Card className="mb-4">
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Pickup Address</h5>
                        {!addresses.pickup && (
                            <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => handleAddAddress('pickup')}
                            >
                                Add Pickup Address
                            </Button>
                        )}
                    </div>
                </Card.Header>
                <Card.Body>
                    {addresses.pickup ? (
                        renderAddress(addresses.pickup)
                    ) : (
                        <p className="text-muted mb-0">No pickup address set</p>
                    )}
                </Card.Body>
            </Card>

            {/* Delivery Addresses */}
            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Delivery Addresses</h5>
                        <Button 
                            variant="primary"
                            size="sm" 
                            onClick={() => handleAddAddress('delivery')}
                        >
                            Add Delivery Address
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {addresses.delivery.length > 0 ? (
                        <div className="delivery-addresses-grid">
                            {addresses.delivery.map((address) => (
                                <div key={address._id} className="mb-4">
                                    {renderAddress(address)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted mb-0">No delivery addresses added</p>
                    )}
                </Card.Body>
            </Card>

            {showAddForm && (
                <AddressForm
                    type={addressType}
                    onClose={() => {
                        setShowAddForm(false);
                        setAddressType(null);
                    }}
                    onSave={handleSaveAddress}
                />
            )}
        </div>
    );
};

export default CustomerAddress;
