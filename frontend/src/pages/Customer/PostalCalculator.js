import React, { useState } from 'react';
import './PostalCalculator.css';

const PostalCalculator = () => {
  const [formData, setFormData] = useState({
    location: 'domestic',
    serviceType: 'normal',
    weight: '',
    height: '',
    width: '',
    length: ''
  });

  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Define limits
  const LIMITS = {
    weight: { min: 0.1, max: 30 },
    height: { min: 1, max: 150 },
    width: { min: 1, max: 150 },
    length: { min: 1, max: 150 }
  };

  // Service types with their multipliers
  const SERVICE_TYPES = {
    normal: { label: 'Normal Delivery', multiplier: 1 },
    speed: { label: 'Speed Post', multiplier: 1.5 },
    express: { label: 'Express Delivery', multiplier: 2 },
    premium: { label: 'Premium Express', multiplier: 2.5 },
    overnight: { label: 'Overnight Delivery', multiplier: 3 }
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
    let basePrice = formData.location === 'domestic' ? 50 : 200;
    
    const serviceMultiplier = SERVICE_TYPES[formData.serviceType].multiplier;
    const weightPrice = parseFloat(formData.weight) * 10;
    
    const volume = (parseFloat(formData.length) * parseFloat(formData.width) * 
                   parseFloat(formData.height)) / 1000;
    const volumePrice = volume * 5;
    
    const totalPrice = (basePrice + weightPrice + volumePrice) * serviceMultiplier;
    
    setResult(totalPrice.toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculatePrice();
  };

  return (
    <div className="calculator-container">
      <h2>Postal Price Calculator</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="calculator-form">
        <div className="form-group">
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

        <div className="form-group">
          <label>Service Type:</label>
          <select 
            name="serviceType" 
            value={formData.serviceType}
            onChange={handleInputChange}
          >
            {Object.entries(SERVICE_TYPES).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
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

        <div className="dimensions-group">
          <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
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

        <button type="submit" className="calculate-btn" disabled={!!error}>
          Calculate Price
        </button>
      </form>

      {result && (
        <div className="result">
          <h3>Estimated Price:</h3>
          <p className="price">Rs. {result}</p>
        </div>
      )}
    </div>
  );
};

export default PostalCalculator;