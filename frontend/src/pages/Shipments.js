import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Shipments.css';
import { 
    FaBox, FaShippingFast, FaSearch, FaPlus, 
    FaMapMarkerAlt, FaTruck, FaClock, FaCheckCircle,
    FaExclamationCircle, FaFilter
} from 'react-icons/fa';

const Shipments = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shipments, setShipments] = useState([]);
    const [showNewPackageModal, setShowNewPackageModal] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackedPackage, setTrackedPackage] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [newPackage, setNewPackage] = useState({
        type: 'document',
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        recipientName: '',
        recipientPhone: '',
        recipientAddress: '',
        serviceType: 'standard',
        fragile: false,
        insurance: false
    });

    useEffect(() => {
        if (user) {
            fetchShipments();
        }
    }, [user]);

    const fetchShipments = async () => {
        try {
            const response = await axios.get(
                `http://localhost:4000/api/packages/${user.id}/shipments`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );
            setShipments(response.data.shipments);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch shipments');
            setLoading(false);
        }
    };

    const handleTrackPackage = async () => {
        try {
            const response = await axios.get(
                `http://localhost:4000/api/packages/track/${trackingNumber}`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );
            setTrackedPackage(response.data.package);
        } catch (err) {
            setError('Package not found');
        }
    };

    const handleSendPackage = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:4000/api/packages/send',
                {
                    ...newPackage,
                    senderId: user.id
                },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );
            setShipments([...shipments, response.data.package]);
            setShowNewPackageModal(false);
            setNewPackage({
                type: 'document',
                weight: '',
                dimensions: { length: '', width: '', height: '' },
                recipientName: '',
                recipientPhone: '',
                recipientAddress: '',
                serviceType: 'standard',
                fragile: false,
                insurance: false
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send package');
        }
    };

    const calculateShippingCost = () => {
        const baseRate = newPackage.serviceType === 'express' ? 50 : 30;
        const weightRate = parseFloat(newPackage.weight) * 2;
        const insuranceRate = newPackage.insurance ? 20 : 0;
        const fragileRate = newPackage.fragile ? 15 : 0;
        return baseRate + weightRate + insuranceRate + fragileRate;
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#ffc107',
            'in_transit': '#17a2b8',
            'delivered': '#28a745',
            'cancelled': '#dc3545'
        };
        return colors[status] || '#6c757d';
    };

    const filteredShipments = shipments.filter(shipment => {
        const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
        const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            shipment.recipientName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="shipments-container">
            <section className="tracking-section">
                <h2><FaSearch /> Track Package</h2>
                <div className="tracking-form">
                    <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number"
                    />
                    <button onClick={handleTrackPackage}>Track</button>
                </div>
                {trackedPackage && (
                    <div className="tracking-result">
                        <h3>Package Status</h3>
                        <div className="tracking-timeline">
                            {trackedPackage.trackingHistory.map((event, index) => (
                                <div key={index} className="timeline-event">
                                    <div className="event-icon">
                                        {event.status === 'delivered' ? <FaCheckCircle /> : <FaClock />}
                                    </div>
                                    <div className="event-details">
                                        <h4>{event.status}</h4>
                                        <p>{event.location}</p>
                                        <small>{new Date(event.timestamp).toLocaleString()}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <section className="shipments-section">
                <div className="section-header">
                    <h2><FaShippingFast /> My Shipments</h2>
                    <button 
                        className="new-package-btn"
                        onClick={() => setShowNewPackageModal(true)}
                    >
                        <FaPlus /> New Package
                    </button>
                </div>

                <div className="shipments-controls">
                    <div className="search-box">
                        <FaSearch />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search shipments..."
                        />
                    </div>
                    <div className="filter-box">
                        <FaFilter />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="shipments-list">
                    {filteredShipments.map(shipment => (
                        <div key={shipment._id} className="shipment-card">
                            <div className="shipment-header">
                                <div className="tracking-number">
                                    #{shipment.trackingNumber}
                                </div>
                                <div 
                                    className="status-badge"
                                    style={{ backgroundColor: getStatusColor(shipment.status) }}
                                >
                                    {shipment.status}
                                </div>
                            </div>
                            <div className="shipment-details">
                                <div className="detail-item">
                                    <FaBox />
                                    <span>{shipment.type}</span>
                                </div>
                                <div className="detail-item">
                                    <FaMapMarkerAlt />
                                    <span>{shipment.recipientAddress}</span>
                                </div>
                                <div className="detail-item">
                                    <FaTruck />
                                    <span>{shipment.serviceType}</span>
                                </div>
                            </div>
                            <div className="shipment-footer">
                                <small>Created: {new Date(shipment.createdAt).toLocaleDateString()}</small>
                                <button 
                                    onClick={() => setTrackingNumber(shipment.trackingNumber)}
                                    className="track-btn"
                                >
                                    Track
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {showNewPackageModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Send New Package</h2>
                        <button 
                            className="close-btn"
                            onClick={() => setShowNewPackageModal(false)}
                        >
                            ×
                        </button>
                        <form onSubmit={handleSendPackage}>
                            <div className="form-group">
                                <label>Package Type</label>
                                <select
                                    value={newPackage.type}
                                    onChange={(e) => setNewPackage({
                                        ...newPackage,
                                        type: e.target.value
                                    })}
                                >
                                    <option value="document">Document</option>
                                    <option value="parcel">Parcel</option>
                                    <option value="heavy_goods">Heavy Goods</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Weight (kg)</label>
                                <input
                                    type="number"
                                    value={newPackage.weight}
                                    onChange={(e) => setNewPackage({
                                        ...newPackage,
                                        weight: e.target.value
                                    })}
                                    step="0.1"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Length (cm)</label>
                                    <input
                                        type="number"
                                        value={newPackage.dimensions.length}
                                        onChange={(e) => setNewPackage({
                                            ...newPackage,
                                            dimensions: {
                                                ...newPackage.dimensions,
                                                length: e.target.value
                                            }
                                        })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Width (cm)</label>
                                    <input
                                        type="number"
                                        value={newPackage.dimensions.width}
                                        onChange={(e) => setNewPackage({
                                            ...newPackage,
                                            dimensions: {
                                                ...newPackage.dimensions,
                                                width: e.target.value
                                            }
                                        })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Height (cm)</label>
                                    <input
                                        type="number"
                                        value={newPackage.dimensions.height}
                                        onChange={(e) => setNewPackage({
                                            ...newPackage,
                                            dimensions: {
                                                ...newPackage.dimensions,
                                                height: e.target.value
                                            }
                                        })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Recipient Name</label>
                                <input
                                    type="text"
                                    value={newPackage.recipientName}
                                    onChange={(e) => setNewPackage({
                                        ...newPackage,
                                        recipientName: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Recipient Phone</label>
                                <input
                                    type="tel"
                                    value={newPackage.recipientPhone}
                                    onChange={(e) => setNewPackage({
                                        ...newPackage,
                                        recipientPhone: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Recipient Address</label>
                                <textarea
                                    value={newPackage.recipientAddress}
                                    onChange={(e) => setNewPackage({
                                        ...newPackage,
                                        recipientAddress: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Service Type</label>
                                <select
                                    value={newPackage.serviceType}
                                    onChange={(e) => setNewPackage({
                                        ...newPackage,
                                        serviceType: e.target.value
                                    })}
                                >
                                    <option value="standard">Standard</option>
                                    <option value="express">Express</option>
                                </select>
                            </div>

                            <div className="form-row checkboxes">
                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={newPackage.fragile}
                                            onChange={(e) => setNewPackage({
                                                ...newPackage,
                                                fragile: e.target.checked
                                            })}
                                        />
                                        Fragile
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={newPackage.insurance}
                                            onChange={(e) => setNewPackage({
                                                ...newPackage,
                                                insurance: e.target.checked
                                            })}
                                        />
                                        Insurance
                                    </label>
                                </div>
                            </div>

                            <div className="estimated-cost">
                                Estimated Cost: ${calculateShippingCost()}
                            </div>

                            <button type="submit" className="submit-btn">
                                Send Package
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shipments;
