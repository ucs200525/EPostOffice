import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StaffNavbar from '../components/StaffNavbar';
import styles from '../styles/OrderAssignment.module.css';

const OrderAssignment = () => {
    const [order, setOrder] = useState(null);
    const [currentStatus, setCurrentStatus] = useState('pending');
    const { trackingNumber } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'package_picked_up', label: 'Package Picked Up' },
        { value: 'in_transit', label: 'In Transit' },
        { value: 'out_for_delivery', label: 'Out for Delivery' },
        { value: 'delivered', label: 'Delivered' }
    ];

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:4000/api/orders/track/${trackingNumber}`);
            const data = await response.json();
            
            if (data.success) {
                setOrder(data.tracking);
                setCurrentStatus(data.tracking.status);
            } else {
                setError(data.message || 'Failed to load order details');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (newStatus) => {
        try {
            const response = await fetch(`http://localhost:4000/api/orders/status/${trackingNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus
                })
            });

            const data = await response.json();
            if (data.success) {
                setCurrentStatus(newStatus);
                fetchOrderDetails(); // Refresh order details
            } else {
                setError(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Failed to update status');
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [trackingNumber]);

    if (loading) return <div className={styles.loading}>Loading order details...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!order) return <div className={styles.error}>Order not found</div>;

    return (
        <div className={styles.container}>
            <StaffNavbar />
            {order && (
                <>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Order Assignment</h2>
                    </div>
                    
                    <div className={styles.tracking_info}>
                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Tracking Number:</span>
                            <span>{order.trackingNumber}</span>
                        </div>
                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Current Status:</span>
                            <span>{currentStatus}</span>
                        </div>
                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Current Location:</span>
                            <span>{order.currentLocation}</span>
                        </div>
                    </div>

                    <div className={styles.status_buttons}>
                        {statusOptions.map((status) => (
                            <button
                                key={status.value}
                                className={`${styles.status_btn} ${currentStatus.toLowerCase() === status.value ? styles.active : ''}`}
                                onClick={() => updateOrderStatus(status.value)}
                                disabled={currentStatus.toLowerCase() === status.value}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>

                    <div className={styles.delivery_info}>
                        <h3>Delivery Information</h3>
                        <p><strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                        <p><strong>Order Type:</strong> {order.orderDetails.orderType}</p>
                        <p><strong>Total Amount:</strong> ₹{order.orderDetails.totalAmount}</p>
                        <p><strong>Progress:</strong> {Math.round(order.progress)}%</p>
                    </div>

                    <div className={styles.address_info}>
                        <h3>Addresses</h3>
                        <div className={styles.address_grid}>
                            <div className={styles.pickup_address}>
                                <h4>Pickup Address</h4>
                                <p>{order.addresses.pickup.street}</p>
                                <p>{order.addresses.pickup.city}, {order.addresses.pickup.state}</p>
                                <p>{order.addresses.pickup.pincode}</p>
                            </div>
                            <div className={styles.delivery_address}>
                                <h4>Delivery Address</h4>
                                <p>{order.addresses.delivery.street}</p>
                                <p>{order.addresses.delivery.city}, {order.addresses.delivery.state}</p>
                                <p>{order.addresses.delivery.pincode}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.tracking_history}>
                        <h3>Tracking History</h3>
                        <div className={styles.progress_container}>
                            <div className={styles.progress_bar}>
                                <div 
                                    className={styles.progress_fill} 
                                    style={{ width: `${order.progress}%` }}
                                />
                            </div>
                            <div className={styles.progress_labels}>
                                <span>Order Created</span>
                                <span>Picked Up</span>
                                <span>In Transit</span>
                                <span>Out for Delivery</span>
                                <span>Delivered</span>
                            </div>
                        </div>
                        <div className={styles.history_timeline}>
                            {order.history.map((event, index) => (
                                <div 
                                    key={index} 
                                    className={`${styles.history_event} ${
                                        event.status === currentStatus ? styles.active : ''
                                    }`}
                                >
                                    <p className={styles.event_status}>{event.status}</p>
                                    <p className={styles.event_location}>{event.location}</p>
                                    <p className={styles.event_time}>
                                        {new Date(event.timestamp).toLocaleString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default OrderAssignment;
