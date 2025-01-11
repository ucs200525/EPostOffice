import React, { useState } from 'react';
import { FaSearch, FaBox, FaTruck, FaMapMarkerAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import './TrackTrace.css';

const TrackTrace = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mock tracking data - Replace with actual API call
    const handleTracking = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mock data - replace with actual API response
            setTrackingResult({
                trackingNumber: trackingNumber,
                status: 'In Transit',
                estimatedDelivery: '2024-02-20',
                sender: {
                    name: 'John Doe',
                    location: 'New York, NY'
                },
                recipient: {
                    name: 'Jane Smith',
                    location: 'Los Angeles, CA'
                },
                timeline: [
                    {
                        status: 'Package Delivered',
                        location: 'Los Angeles, CA',
                        timestamp: '2024-02-20 14:30',
                        completed: false
                    },
                    {
                        status: 'Out for Delivery',
                        location: 'Los Angeles Distribution Center',
                        timestamp: '2024-02-20 08:15',
                        completed: false
                    },
                    {
                        status: 'Arrived at Distribution Center',
                        location: 'Los Angeles, CA',
                        timestamp: '2024-02-19 23:45',
                        completed: true
                    },
                    {
                        status: 'In Transit',
                        location: 'Chicago, IL',
                        timestamp: '2024-02-18 15:20',
                        completed: true
                    },
                    {
                        status: 'Package Picked Up',
                        location: 'New York, NY',
                        timestamp: '2024-02-17 09:00',
                        completed: true
                    }
                ]
            });
        } catch (err) {
            setError('Unable to track package. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Package Picked Up':
                return <FaBox />;
            case 'In Transit':
                return <FaTruck />;
            case 'Out for Delivery':
                return <FaMapMarkerAlt />;
            case 'Package Delivered':
                return <FaCheckCircle />;
            default:
                return <FaClock />;
        }
    };

    return (
        <div className="track-trace-container">
            <div className="track-trace-header">
                <h1>Track Your Package</h1>
                <p>Enter your tracking number to get real-time updates</p>
            </div>

            <form onSubmit={handleTracking} className="tracking-form">
                <div className="search-box">
                    <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number"
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Tracking...' : <><FaSearch /> Track</>}
                    </button>
                </div>
            </form>

            {error && <div className="error-message">{error}</div>}

            {trackingResult && (
                <div className="tracking-result">
                    <div className="tracking-summary">
                        <div className="summary-header">
                            <h2>Tracking Number: {trackingResult.trackingNumber}</h2>
                            <span className={`status-badge ${trackingResult.status.toLowerCase().replace(' ', '-')}`}>
                                {trackingResult.status}
                            </span>
                        </div>

                        <div className="delivery-info">
                            <div className="estimated-delivery">
                                <h3>Estimated Delivery</h3>
                                <p>{new Date(trackingResult.estimatedDelivery).toLocaleDateString()}</p>
                            </div>
                            <div className="shipment-details">
                                <div className="sender-info">
                                    <h4>From</h4>
                                    <p>{trackingResult.sender.name}</p>
                                    <p>{trackingResult.sender.location}</p>
                                </div>
                                <div className="recipient-info">
                                    <h4>To</h4>
                                    <p>{trackingResult.recipient.name}</p>
                                    <p>{trackingResult.recipient.location}</p>
                                </div>
                            </div>
                        </div>

                        <div className="tracking-timeline">
                            <h3>Tracking History</h3>
                            <div className="timeline">
                                {trackingResult.timeline.map((event, index) => (
                                    <div key={index} className={`timeline-item ${event.completed ? 'completed' : ''}`}>
                                        <div className="timeline-icon">
                                            {getStatusIcon(event.status)}
                                        </div>
                                        <div className="timeline-content">
                                            <h4>{event.status}</h4>
                                            <p>{event.location}</p>
                                            <span className="timestamp">{event.timestamp}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackTrace;
