import React, { useState, useEffect } from 'react';
import { Container, Spinner, Row, Col } from 'react-bootstrap';
import Notification from '../../../components/Notification';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import styles from './styles/Settings.module.css';
import AddressManager from './AddressManager';

const AddressDisplay = ({ address, type, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    label: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
    type: type.toLowerCase(),
    _id: ''
  });

  // Add new state for handling new address form
  const [isAdding, setIsAdding] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    label: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
    type: type.toLowerCase()
  });

  // Initialize editForm when edit button is clicked
  const handleEditClick = () => {
    setEditForm({
      label: address.label || '',
      streetAddress: address.streetAddress || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'India',
      isDefault: address.isDefault || false,
      type: type.toLowerCase(),
      _id: address._id
    });
    setIsEditing(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit(editForm, editForm._id, type.toLowerCase());
    setIsEditing(false);
  };

  // Form for adding new address
  const renderAddressForm = (formData, setFormData, onSubmit, isNew = false) => {
    return (
      <div className={styles.addressCard}>
        <form onSubmit={onSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Label</label>
            <input
              className={styles.formControl}
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Street Address</label>
            <input
              className={styles.formControl}
              value={formData.streetAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, streetAddress: e.target.value }))}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>City</label>
            <input
              className={styles.formControl}
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>State</label>
            <input
              className={styles.formControl}
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Postal Code</label>
            <input
              className={styles.formControl}
              value={formData.postalCode}
              onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formCheck}>
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                className={styles.formCheckInput}
              />
              Set as default address
            </label>
          </div>
          <div className={styles.addressActions}>
            <button type="submit" className={styles.primaryButton}>
              {isNew ? 'Add Address' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => isNew ? setIsAdding(false) : setIsEditing(false)}
              className={styles.secondaryButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (!address) return null;

  if (isEditing) {
    return renderAddressForm(editForm, setEditForm, handleSubmit);
  }

  // Modify the no address section to show form when adding
  if (!address && isAdding) {
    return renderAddressForm(newAddressForm, setNewAddressForm, (e) => {
      e.preventDefault();
      onEdit(newAddressForm, null, type.toLowerCase());
      setIsAdding(false);
    }, true);
  }

  // Update the empty state render
  if (!address) {
    return (
      <div className={styles.noAddress}>
        <p>No {type.toLowerCase()} address set</p>
        <button 
          className={styles.addAddressButton}
          onClick={() => setIsAdding(true)}
        >
          + Add {type} Address
        </button>
      </div>
    );
  }

  return (
    <div className={styles.addressCard}>
      <div className={styles.addressHeader}>
        <h4 className={styles.addressLabel}>{address.label || type}</h4>
        {address.isDefault && <span className={styles.defaultBadge}>Default</span>}
      </div>
      <div className={styles.addressDetails}>
        <p className={styles.addressLine}>{address.streetAddress}</p>
        <p className={styles.addressLine}>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p className={styles.addressLine}>{address.country}</p>
      </div>
      <div className={styles.addressActions}>
        <button 
          onClick={handleEditClick}  // Changed from setIsEditing(true)
          className={`${styles.button} ${styles.secondaryButton}`}
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(address._id, type.toLowerCase())} 
          className={`${styles.button} ${styles.deleteButton}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

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
    const [addresses, setAddresses] = useState({
        pickup: null,
        delivery: []
    });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddressData, setNewAddressData] = useState({
        label: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        type: '',
        isDefault: false
    });

    // Fetch user profile data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/customer/settings`,
                    {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    }
                );
                setProfile(response.data.data);
            } catch (error) {
                setShowAlert({
                    show: true,
                    variant: 'danger',
                    message: 'Failed to fetch profile data'
                });
            }
        };
        if (user?.id) fetchUserData();
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${user?._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setAddresses({
                    pickup: response.data.data.pickup,
                    delivery: response.data.data.delivery
                });
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setShowAlert({
                show: true,
                variant: 'danger',
                message: 'Failed to fetch addresses: ' + (error.response?.data?.message || error.message)
            });
        }
    };

    const handleAddAddress = (type) => {
        setNewAddressData(prev => ({ ...prev, type }));
        setShowAddressForm(true);
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${user?._id}`,
                newAddressData,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            if (response.data.success) {
                await fetchAddresses();
                setShowAlert({
                    show: true,
                    variant: 'success',
                    message: 'Address added successfully'
                });
                setShowAddressForm(false);
                setNewAddressData({
                    label: '',
                    streetAddress: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'India',
                    type: '',
                    isDefault: false
                });
            }
        } catch (error) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: error.response?.data?.message || 'Failed to add address'
            });
        }
    };

    const handleEditAddress = async (address, addressId, addressType) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${user?._id}/${addressType}`,
                address,
                {
                    params: { addressId },
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            if (response.data.success) {
                await fetchAddresses();
                setShowAlert({
                    show: true,
                    variant: 'success',
                    message: 'Address updated successfully'
                });
            }
        } catch (error) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: 'Failed to update address'
            });
        }
    };

    const handleDeleteAddress = async (addressId, addressType) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses/${user?._id}/${addressType}`,
                {
                    params: { addressId },
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            
            if (response.data.success) {
                await fetchAddresses();
                setShowAlert({
                    show: true,
                    variant: 'success',
                    message: 'Address deleted successfully'
                });
            }
        } catch (error) {
            setShowAlert({
                show: true,
                variant: 'danger',
                message: error.response?.data?.message || 'Failed to delete address'
            });
        }
    };

    useEffect(() => {
        if (user?._id) {
            fetchAddresses();
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/settings`,
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
                message: error.response?.data?.message || 'Failed to update profile'
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
                                    <label className={styles.formLabel}>Email Notifications</label>
                                    <input
                                        className={styles.formControl}
                                        type="checkbox"
                                        checked={notifications.emailNotifications}
                                        onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>SMS Notifications</label>
                                    <input
                                        className={styles.formControl}
                                        type="checkbox"
                                        checked={notifications.smsNotifications}
                                        onChange={(e) => setNotifications(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Order Updates</label>
                                    <input
                                        className={styles.formControl}
                                        type="checkbox"
                                        checked={notifications.orderUpdates}
                                        onChange={(e) => setNotifications(prev => ({ ...prev, orderUpdates: e.target.checked }))}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Promotional Emails</label>
                                    <input
                                        className={styles.formControl}
                                        type="checkbox"
                                        checked={notifications.promotionalEmails}
                                        onChange={(e) => setNotifications(prev => ({ ...prev, promotionalEmails: e.target.checked }))}
                                    />
                                </div>
                                <button type="submit" className={styles.primaryButton}>
                                    Save Preferences
                                </button>
                            </form>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={6} className="mb-4">
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>Pickup Address</div>
                        <div className={styles.cardBody}>
                            {showAddressForm ? (
                                <form onSubmit={handleAddressSubmit} className={styles.addressForm}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Label</label>
                                        <input
                                            className={styles.formControl}
                                            type="text"
                                            value={newAddressData.label}
                                            onChange={(e) => setNewAddressData(prev => ({ 
                                                ...prev, 
                                                label: e.target.value 
                                            }))}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Street Address</label>
                                        <input
                                            className={styles.formControl}
                                            type="text"
                                            value={newAddressData.streetAddress}
                                            onChange={(e) => setNewAddressData(prev => ({ 
                                                ...prev, 
                                                streetAddress: e.target.value 
                                            }))}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>City</label>
                                        <input
                                            className={styles.formControl}
                                            type="text"
                                            value={newAddressData.city}
                                            onChange={(e) => setNewAddressData(prev => ({ 
                                                ...prev, 
                                                city: e.target.value 
                                            }))}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>State</label>
                                        <input
                                            className={styles.formControl}
                                            type="text"
                                            value={newAddressData.state}
                                            onChange={(e) => setNewAddressData(prev => ({ 
                                                ...prev, 
                                                state: e.target.value 
                                            }))}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Postal Code</label>
                                        <input
                                            className={styles.formControl}
                                            type="text"
                                            value={newAddressData.postalCode}
                                            onChange={(e) => setNewAddressData(prev => ({ 
                                                ...prev, 
                                                postalCode: e.target.value 
                                            }))}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formCheck}>
                                            <input
                                                type="checkbox"
                                                checked={newAddressData.isDefault}
                                                onChange={(e) => setNewAddressData(prev => ({ 
                                                    ...prev, 
                                                    isDefault: e.target.checked 
                                                }))}
                                                className={styles.formCheckInput}
                                            />
                                            Set as default address
                                        </label>
                                    </div>
                                    <div className={styles.addressActions}>
                                        <button type="submit" className={styles.primaryButton}>
                                            Add Address
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddressForm(false)}
                                            className={styles.secondaryButton}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : addresses.pickup ? (
                                <AddressDisplay
                                    address={addresses.pickup}
                                    type="Pickup"
                                    onEdit={handleEditAddress}
                                    onDelete={handleDeleteAddress}
                                />
                            ) : (
                                <div className={styles.noAddress}>
                                    <p>No pickup address set</p>
                                    <button 
                                        className={styles.addAddressButton}
                                        onClick={() => handleAddAddress('pickup')}
                                    >
                                        + Add Pickup Address
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </Col>

                <Col md={6} className="mb-4">
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>Delivery Addresses</div>
                        <div className={styles.cardBody}>
                            {addresses.delivery?.length > 0 ? (
                                addresses.delivery.map(address => (
                                  <AddressDisplay
                                    key={address._id}
                                    address={address}
                                    type="Delivery"
                                    onEdit={handleEditAddress}
                                    onDelete={handleDeleteAddress}
                                  />
                                ))
                              ) : (
                                <div className={styles.noAddress}>
                                  <p>No delivery addresses added</p>
                                  <button 
                                    className={styles.addAddressButton}
                                    onClick={() => handleAddAddress('delivery')}
                                  >
                                    + Add Delivery Address
                                  </button>
                                </div>
                              )}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={6} className="mb-4">
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>Change Password</div>
                        <div className={styles.cardBody}>
                            <form onSubmit={handlePasswordChange}>
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
                                    <label className={styles.formLabel}>Confirm New Password</label>
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