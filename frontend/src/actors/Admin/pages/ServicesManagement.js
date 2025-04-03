import React, { useState } from 'react';
import styles from '../styles/ServicesManagement.module.css';

const ServicesManagement = () => {
  const [newService, setNewService] = useState({
    location: 'domestic',
    serviceCode: '',
    label: '',
    base: '',
    maxWeight: '',
    dimensions: ''
  });

  const PACKAGE_TYPES = {
    domestic: {
      basic_letter: { label: 'Basic Letter', base: 50, maxWeight: 0.1, dimensions: '21×15×1' },
      standard_parcel: { label: 'Standard Parcel', base: 150, maxWeight: 1, dimensions: '30×20×10' },
      express_parcel: { label: 'Express Parcel', base: 300, maxWeight: 5, dimensions: '40×30×20' },
      premium_parcel: { label: 'Premium Parcel', base: 600, maxWeight: 10, dimensions: '50×40×30' },
      bulk_shipment: { label: 'Bulk Shipment', base: 1200, maxWeight: 20, dimensions: '70×50×40' }
    },
    international: {
      basic_intl: { label: 'Basic International', base: 250, maxWeight: 0.1, dimensions: '21×15×1' },
      standard_intl: { label: 'Standard International', base: 800, maxWeight: 1, dimensions: '30×20×10' },
      express_intl: { label: 'Express International', base: 2000, maxWeight: 5, dimensions: '40×30×20' },
      premium_intl: { label: 'Premium International', base: 4000, maxWeight: 10, dimensions: '50×40×30' },
      bulk_intl: { label: 'Bulk International', base: 9000, maxWeight: 20, dimensions: '70×50×40' }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call to save new service
    console.log('New service:', newService);
    alert('Service added successfully!');
    setNewService({
      location: 'domestic',
      serviceCode: '',
      label: '',
      base: '',
      maxWeight: '',
      dimensions: ''
    });
  };

  return (
    <div className={styles.container}>
      <h2>Manage Postal Services</h2>
      
      <div className={styles.existingServices}>
        <h3>Current Services</h3>
        <div className={styles.locationTabs}>
          {Object.entries(PACKAGE_TYPES).map(([location, services]) => (
            <div key={location} className={styles.locationSection}>
              <h4>{location.charAt(0).toUpperCase() + location.slice(1)} Services</h4>
              <table className={styles.servicesTable}>
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Base Price (₹)</th>
                    <th>Max Weight (kg)</th>
                    <th>Dimensions (cm)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(services).map(([code, service]) => (
                    <tr key={code}>
                      <td>{service.label}</td>
                      <td>{service.base}</td>
                      <td>{service.maxWeight}</td>
                      <td>{service.dimensions}</td>
                      <td>
                        <button onClick={() => console.log('Edit', code)}>Edit</button>
                        <button onClick={() => console.log('Delete', code)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.addService}>
        <h3>Add New Service</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Location:</label>
            <select name="location" value={newService.location} onChange={handleInputChange}>
              <option value="domestic">Domestic</option>
              <option value="international">International</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Service Code:</label>
            <input
              type="text"
              name="serviceCode"
              value={newService.serviceCode}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Service Name:</label>
            <input
              type="text"
              name="label"
              value={newService.label}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Base Price (₹):</label>
            <input
              type="number"
              name="base"
              value={newService.base}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Max Weight (kg):</label>
            <input
              type="number"
              name="maxWeight"
              value={newService.maxWeight}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Dimensions (L×W×H cm):</label>
            <input
              type="text"
              name="dimensions"
              value={newService.dimensions}
              onChange={handleInputChange}
              placeholder="e.g., 30×20×10"
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Add Service
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServicesManagement;
