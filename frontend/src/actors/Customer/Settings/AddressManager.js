import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { geocodeAddress } from '../../../utils/geocoding';
import axios from 'axios';
import { Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';

const AddressManager = ({ type }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      fetchAddresses();
    } else {
      setError('User authentication required');
    }
  }, [type, user]);

  const fetchAddresses = async () => {
    if (!user || !user._id) {
      setError('User authentication required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses`,
        { 
          params: { userId: user._id, type },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
        }
      );
      setAddresses(response.data.addresses || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const addressData = {
        ...formData,
        type
      };

      if (editingAddress) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${editingAddress._id}`,
          addressData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses`,
          addressData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
      }

      await fetchAddresses();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label || '',
      streetAddress: address.streetAddress || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'India',
      isDefault: address.isDefault || false
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      setLoading(true);
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${addressId}?userId=${user._id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      await fetchAddresses();
    } catch (error) {
      setError('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false
    });
    setEditingAddress(null);
    setShowForm(false);
  };
  return (
    <div className="address-manager">
      {error && <Alert variant="danger">{error}</Alert>}

      {!showForm ? (
        <>
          <Button
            variant="primary"
            className="mb-4"
            onClick={() => setShowForm(true)}
            disabled={type === 'pickup' && addresses.length > 0}
          >
            {type === 'pickup' ? 'Set Pickup Address' : 'Add New Address'}
          </Button>

          <ListGroup className="address-list">
            {addresses.map((address) => (
              <ListGroup.Item 
                key={address._id} 
                className="address-item p-4 mb-3 border rounded-3 position-relative"
                style={{
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderLeft: '4px solid #0d6efd'
                }}
              >
                <div className="d-flex justify-content-between align-items-start w-100">
                  <div className="address-content flex-grow-1 pe-4">
                    <div className="d-flex align-items-center mb-2">
                      <h5 className="mb-0 fw-semibold">{address.label}</h5>
                      {address.isDefault && (
                        <span className="badge bg-success ms-2 px-3 py-2" style={{ fontSize: '0.8rem' }}>
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mb-0 text-secondary d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2" style={{ color: '#6c757d' }} />
                      <span style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                        {address.streetAddress},<br />
                        {address.city}, {address.state} {address.postalCode}
                      </span>
                    </p>
                  </div>
                  <div className="address-actions d-flex gap-2 align-items-start">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="edit-btn p-2"
                      onClick={() => handleEdit(address)}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px'
                      }}
                    >
                      <FaEdit size="1.1em" />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="delete-btn p-2"
                      onClick={() => handleDelete(address._id)}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px'
                      }}
                    >
                      <FaTrash size="1.1em" />
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Label</Form.Label>
            <Form.Control
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Home, Office"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Street Address</Form.Label>
            <Form.Control
              type="text"
              value={formData.streetAddress}
              onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>State</Form.Label>
            <Form.Control
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Set as default address"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
            </Button>
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default AddressManager;
