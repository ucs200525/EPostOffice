import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBox, FaShippingFast, FaMoneyBill } from 'react-icons/fa';
import styles from '../styles/ServicesManagement.module.css';

const ServicesManagement = () => {
  const [services] = useState([
    {
      id: 1,
      name: 'Express Delivery',
      description: 'Next day delivery service',
      basePrice: 500,
      status: 'active'
    },
    {
      id: 2,
      name: 'Standard Post',
      description: '3-5 business days delivery',
      basePrice: 100,
      status: 'active'
    }
  ]);

  return (
    <div className={styles.servicesContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>Services Management</h1>
            <p>Manage postal and financial services</p>
          </div>
          <button className={styles.addServiceBtn}>
            <FaPlus /> Add New Service
          </button>
        </div>
      </div>

      <div className={styles.servicesGrid}>
        {services.map(service => (
          <div key={service.id} className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
              <h3 className={styles.serviceTitle}>
                <FaBox className={styles.serviceIcon} />
                {service.name}
              </h3>
            </div>
            <div className={styles.serviceContent}>
              <div className={styles.serviceInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Status</span>
                  <span className={`${styles.statusBadge} ${styles[service.status]}`}>
                    {service.status}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Base Price</span>
                  <span className={styles.infoValue}>₹{service.basePrice}</span>
                </div>
              </div>
              <div className={styles.serviceActions}>
                <button className={styles.editBtn}>
                  <FaEdit /> Edit
                </button>
                <button className={styles.deleteBtn}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesManagement;
