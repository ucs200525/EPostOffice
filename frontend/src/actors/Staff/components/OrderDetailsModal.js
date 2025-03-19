import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/OrderDetailsModal.module.css';

const OrderDetailsModal = ({ order, customer, onClose, onStatusUpdate }) => {
  if (!order) return null;

  // Helper function to format address
  const formatAddress = (addr) => {
    if (!addr) return 'No address available';
    const parts = [
      addr.streetAddress,
      addr.city,
      addr.state,
      addr.postalCode,
      addr.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Format dates safely
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleStatusChange = (newStatus) => {
    onStatusUpdate(order._id, newStatus);
  };

  // Get addresses from customer data
  const pickupAddr = customer?.pickupAddress || order.pickupAddress;
  const deliveryAddr = customer?.deliveryAddresses?.[0] || order.deliveryAddress;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Order Details</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalContent}>
          {/* Order Information Section */}
          <div className={styles.section}>
            <h3>Basic Information</h3>
            <div className={styles.gridInfo}>
              <div>
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
                <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Amount:</strong> ₹{order.totalAmount}</p>
              </div>
              <div>
                <p><strong>Order Type:</strong> {order.orderType}</p>
                <p><strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> 
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`${styles.statusSelect} ${styles[order.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="in_transit">In Transit</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </p>
              </div>
            </div>
          </div>

          {/* Package Details Section */}
          <div className={styles.section}>
            <h3>Package Details</h3>
            <div className={styles.gridInfo}>
              <div>
                <p><strong>Type:</strong> {order.packageDetails?.type}</p>
                <p><strong>Weight:</strong> {order.packageDetails?.weight} kg</p>
              </div>
              <div>
                <p><strong>Dimensions:</strong> 
                  {`${order.packageDetails?.dimensions?.length}x${order.packageDetails?.dimensions?.width}x${order.packageDetails?.dimensions?.height} cm`}
                </p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown Section */}
          <div className={styles.section}>
            <h3>Cost Breakdown</h3>
            <div className={styles.costGrid}>
              <p><strong>Base Price:</strong> ₹{order.cost?.basePrice}</p>
              <p><strong>Weight Charge:</strong> ₹{order.cost?.weightCharge}</p>
              <p><strong>Insurance:</strong> ₹{order.cost?.insuranceCharge}</p>
              <p><strong>Total:</strong> ₹{order.totalAmount}</p>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className={styles.section}>
            <h3>Customer Information</h3>
            <div className={styles.customerInfo}>
              <div>
                <p><strong>Name:</strong> {customer?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {customer?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {customer?.phone || 'N/A'}</p>
                {customer && (
                  <Link 
                    to={`/staff/customer/${customer._id}`}
                    className={styles.viewCustomerButton}
                  >
                    View Full Customer Profile
                  </Link>
                )}
              </div>
              <div>
                <p><strong>Wallet Balance:</strong> ₹{customer?.walletBalance || 0}</p>
                <p><strong>Total Orders:</strong> {customer?.orderCount || 0}</p>
                <p><strong>Customer Since:</strong> {customer?.createdAt ? formatDate(customer.createdAt) : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className={styles.addressSection}>
            <div className={styles.address}>
              <h3>Pickup Address</h3>
              <p>{formatAddress(order.pickupAddress)}</p>
            </div>
            <div className={styles.address}>
              <h3>Delivery Address</h3>
              <p>{formatAddress(order.shippingAddress)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
