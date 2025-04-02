import React, { useState } from 'react';
import styles from '../styles/PostalCalculator.module.css';

const PostalCalculator = () => {
  const [formData, setFormData] = useState({
    location: 'domestic',
    serviceType: 'basic_letter',
    weight: '',
    height: '',
    width: '',
    length: ''
  });

  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const LIMITS = {
    weight: { min: 0.1, max: 20 },
    height: { min: 1, max: 100 },
    width: { min: 1, max: 100 },
    length: { min: 1, max: 100 }
  };

  const PACKAGE_TYPES = {
    domestic: {
      basic_letter: { 
        label: 'Basic Letter', 
        base: 50, 
        maxWeight: 0.1,
        dimensions: '21×15×1'
      },
      standard_parcel: { 
        label: 'Standard Parcel', 
        base: 150, 
        maxWeight: 1,
        dimensions: '30×20×10'
      },
      express_parcel: { 
        label: 'Express Parcel', 
        base: 300, 
        maxWeight: 5,
        dimensions: '40×30×20'
      },
      premium_parcel: { 
        label: 'Premium Parcel', 
        base: 600, 
        maxWeight: 10,
        dimensions: '50×40×30'
      },
      bulk_shipment: { 
        label: 'Bulk Shipment', 
        base: 1200, 
        maxWeight: 20,
        dimensions: '70×50×40'
      }
    },
    international: {
      basic_intl: { 
        label: 'Basic International', 
        base: 250, 
        maxWeight: 0.1,
        dimensions: '21×15×1'
      },
      standard_intl: { 
        label: 'Standard International', 
        base: 800, 
        maxWeight: 1,
        dimensions: '30×20×10'
      },
      express_intl: { 
        label: 'Express International', 
        base: 2000, 
        maxWeight: 5,
        dimensions: '40×30×20'
      },
      premium_intl: { 
        label: 'Premium International', 
        base: 4000, 
        maxWeight: 10,
        dimensions: '50×40×30'
      },
      bulk_intl: { 
        label: 'Bulk International', 
        base: 9000, 
        maxWeight: 20,
        dimensions: '70×50×40'
      }
    }
  };

  const validateInput = (name, value) => {
    const numValue = parseFloat(value);
    if (LIMITS[name]) {
      if (numValue < LIMITS[name].min) {
        return `Minimum ${name} should be ${LIMITS[name].min}`;
      }
      if (numValue > LIMITS[name].max) {
        return `Maximum ${name} should be ${LIMITS[name].max}`;
      }
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'location') {
      const firstServiceType = Object.keys(PACKAGE_TYPES[value])[0];
      setFormData(prev => ({
        ...prev,
        location: value,
        serviceType: firstServiceType
      }));
      return;
    }

    if (name in LIMITS) {
      const error = validateInput(name, value);
      if (error) {
        setError(error);
        return;
      }
    }

    setError('');
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculatePrice = () => {
    try {
      if (!PACKAGE_TYPES[formData.location]) {
        throw new Error('Invalid location type');
      }

      const packageTypes = PACKAGE_TYPES[formData.location];
      if (!packageTypes[formData.serviceType]) {
        formData.serviceType = Object.keys(packageTypes)[0];
      }

      const selectedPackage = packageTypes[formData.serviceType];
      let totalCost = selectedPackage.base;

      const weight = parseFloat(formData.weight) || 0;
      const length = parseFloat(formData.length) || 0;
      const width = parseFloat(formData.width) || 0;
      const height = parseFloat(formData.height) || 0;

      const weightCost = weight * (formData.location === 'domestic' ? 80 : 300);
      const volume = (length * width * height) / 5000;
      const volumeCost = volume * (formData.location === 'domestic' ? 100 : 400);

      totalCost += weightCost + volumeCost;

      if (formData.location === 'international') {
        totalCost += totalCost * 0.15;
      }

      setResult({
        totalCost: totalCost.toFixed(2),
        breakdown: {
          base: selectedPackage.base,
          weightCost: weightCost.toFixed(2),
          volumeCost: volumeCost.toFixed(2),
          customsFee: formData.location === 'international' ? (totalCost * 0.15).toFixed(2) : 0
        }
      });
    } catch (error) {
      console.error('Price calculation error:', error);
      setError('Failed to calculate price. Please check your inputs.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculatePrice();
  };

  return (
    <div className={styles['calculator-container']}>
      <h2>Postal Price Calculator</h2>
      {error && <div className={styles['error-message']}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles['calculator-form']}>
        <div className={styles['form-group']}>
          <label>Location:</label>
          <select 
            name="location" 
            value={formData.location}
            onChange={handleInputChange}
          >
            <option value="domestic">Domestic</option>
            <option value="international">International</option>
          </select>
        </div>

        <div className={styles['form-group']}>
          <label>Package Type:</label>
          <select 
            name="serviceType" 
            value={formData.serviceType}
            onChange={handleInputChange}
          >
            {Object.entries(PACKAGE_TYPES[formData.location]).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className={styles['form-group']}>
          <label>Weight (kg) - Max {LIMITS.weight.max}kg:</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            step="0.1"
            min={LIMITS.weight.min}
            max={LIMITS.weight.max}
            required
          />
        </div>

        <div className={styles['dimensions-group']}>
          <div className={styles['form-group']}>
            <label>Length (cm) - Max {LIMITS.length.max}cm:</label>
            <input
              type="number"
              name="length"
              value={formData.length}
              onChange={handleInputChange}
              min={LIMITS.length.min}
              max={LIMITS.length.max}
              required
            />
          </div>

          <div className={styles['form-group']}>
            <label>Width (cm) - Max {LIMITS.width.max}cm:</label>
            <input
              type="number"
              name="width"
              value={formData.width}
              onChange={handleInputChange}
              min={LIMITS.width.min}
              max={LIMITS.width.max}
              required
            />
          </div>

          <div className={styles['form-group']}>
            <label>Height (cm) - Max {LIMITS.height.max}cm:</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              min={LIMITS.height.min}
              max={LIMITS.height.max}
              required
            />
          </div>
        </div>

        <button type="submit" className={styles['calculate-btn']} disabled={!!error}>
          Calculate Price
        </button>

        <div className={styles['info-section']}>
          <h3>Service Information</h3>
          <ul>
            <li>Basic Letter: Up to 0.1kg</li>
            <li>Standard Parcel: 0.1-1kg</li>
            <li>Express Parcel: 1-5kg</li>
            <li>Premium Parcel: 5-10kg</li>
            <li>Bulk Shipment: 10-20kg</li>
          </ul>
          
          <h3>Weight and Size Limits</h3>
          <ul>
            <li>Maximum weight: 20 kg</li>
            <li>Maximum dimensions: 100 cm × 100 cm × 100 cm</li>
            <li>Minimum dimensions: 10 cm × 7 cm</li>
          </ul>
        </div>

        {result && (
          <div className={styles.result}>
            <h3>Cost Breakdown:</h3>
            <div className={styles.breakdown}>
              <p>Base Rate: ₹{result.breakdown.base}</p>
              <p>Weight Charges: ₹{result.breakdown.weightCost}</p>
              <p>Volume Charges: ₹{result.breakdown.volumeCost}</p>
              {formData.location === 'international' && <p>Customs Fee: ₹{result.breakdown.customsFee}</p>}
              <h4>Total Cost: ₹{result.totalCost}</h4>
            </div>
            <div className={styles.notes}>
              <p>* Prices are approximate and may vary based on exact destination</p>
              <p>* International shipments may incur additional customs duties</p>
            </div>
          </div>
        )}

        <div className={styles.packageInfo}>
          <h3>Package Types and Limits</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Weight Limit</th>
                <th>Dimensions</th>
                <th>Base Cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(PACKAGE_TYPES[formData.location]).map(([key, info]) => (
                <tr key={key}>
                  <td>{info.label}</td>
                  <td>{info.maxWeight} kg</td>
                  <td>{info.dimensions} cm</td>
                  <td>₹{info.base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
};

export default PostalCalculator;