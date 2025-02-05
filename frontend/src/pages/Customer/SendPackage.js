import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './SendPackage.css';
import { FaBox, FaMapMarkerAlt, FaTruck, FaMoneyBill } from 'react-icons/fa';
import { useShipments } from '../../context/ShipmentContext';

const SendPackage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [packageDetails, setPackageDetails] = useState({
        type: '',
        weight: '',
        dimensions: {
            length: '',
            width: '',
            height: ''
        },
        recipientName: '',
        recipientPhone: '',
        recipientAddress: '',
        serviceType: 'standard', // standard or express
        fragile: false,
        insurance: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [estimatedCost, setEstimatedCost] = useState(null);
    const { addShipment } = useShipments();

    const packageTypes = [
        'Document',
        'Small Package',
        'Medium Package',
        'Large Package',
        'Extra Large Package'
    ];

    const calculateCost = () => {
        let baseCost = 0;
        switch(packageDetails.type) {
            case 'Document': baseCost = 10; break;
            case 'Small Package': baseCost = 20; break;
            case 'Medium Package': baseCost = 35; break;
            case 'Large Package': baseCost = 50; break;
            case 'Extra Large Package': baseCost = 75; break;
            default: baseCost = 0;
        }

        // Add weight cost
        const weightCost = parseFloat(packageDetails.weight) * 0.5;

        // Service type multiplier
        const serviceMultiplier = packageDetails.serviceType === 'express' ? 1.5 : 1;

        // Additional services
        const insuranceCost = packageDetails.insurance ? 10 : 0;
        const fragileCost = packageDetails.fragile ? 5 : 0;

        return (baseCost + weightCost + insuranceCost + fragileCost) * serviceMultiplier;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setPackageDetails(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setPackageDetails(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Update estimated cost when relevant fields change
        if (['type', 'weight', 'serviceType', 'insurance', 'fragile'].includes(name)) {
            setEstimatedCost(calculateCost());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const finalCost = calculateCost();
            const response = await axios.post(
                'http://localhost:4000/api/packages/send',
                {
                    ...packageDetails,
                    senderId: user.id,
                    estimatedCost: finalCost,
                    weight: parseFloat(packageDetails.weight),
                    dimensions: {
                        length: parseFloat(packageDetails.dimensions.length),
                        width: parseFloat(packageDetails.dimensions.width),
                        height: parseFloat(packageDetails.dimensions.height)
                    }
                },
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );

            if (response.data.success) {
                addShipment(response.data.package);
                navigate('/shipments');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send package');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="send-package-container">
            <div className="package-form-card">
                <h1><FaBox /> Send a Package</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h2><FaBox /> Package Details</h2>
                        <select
                            name="type"
                            value={packageDetails.type}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Package Type</option>
                            {packageTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <input
                            type="number"
                            name="weight"
                            placeholder="Weight (kg)"
                            value={packageDetails.weight}
                            onChange={handleInputChange}
                            required
                        />

                        <div className="dimensions-group">
                            <input
                                type="number"
                                name="dimensions.length"
                                placeholder="Length (cm)"
                                value={packageDetails.dimensions.length}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="number"
                                name="dimensions.width"
                                placeholder="Width (cm)"
                                value={packageDetails.dimensions.width}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="number"
                                name="dimensions.height"
                                placeholder="Height (cm)"
                                value={packageDetails.dimensions.height}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h2><FaMapMarkerAlt /> Recipient Details</h2>
                        <input
                            type="text"
                            name="recipientName"
                            placeholder="Recipient Name"
                            value={packageDetails.recipientName}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="tel"
                            name="recipientPhone"
                            placeholder="Recipient Phone"
                            value={packageDetails.recipientPhone}
                            onChange={handleInputChange}
                            required
                        />
                        <textarea
                            name="recipientAddress"
                            placeholder="Recipient Address"
                            value={packageDetails.recipientAddress}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-section">
                        <h2><FaTruck /> Shipping Options</h2>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="serviceType"
                                    value="standard"
                                    checked={packageDetails.serviceType === 'standard'}
                                    onChange={handleInputChange}
                                />
                                Standard Delivery
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="serviceType"
                                    value="express"
                                    checked={packageDetails.serviceType === 'express'}
                                    onChange={handleInputChange}
                                />
                                Express Delivery
                            </label>
                        </div>

                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="fragile"
                                    checked={packageDetails.fragile}
                                    onChange={handleInputChange}
                                />
                                Fragile Package
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="insurance"
                                    checked={packageDetails.insurance}
                                    onChange={handleInputChange}
                                />
                                Insurance
                            </label>
                        </div>
                    </div>

                    {estimatedCost && (
                        <div className="cost-estimate">
                            <h2><FaMoneyBill /> Estimated Cost</h2>
                            <div className="estimated-amount">
                                ${estimatedCost.toFixed(2)}
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SendPackage;
