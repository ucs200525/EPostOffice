import React, { useState } from 'react';
import styles from '../styles/ContactSupport.module.css';

const ContactSupport = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setSubmitStatus('sending');
      // Simulate API call
      setTimeout(() => {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }, 1500);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Contact Support</h1>
      
      <div className={styles.contactInfo}>
        <div className={styles.infoCard}>
          <h3>Customer Service Hours</h3>
          <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
          <p>Saturday: 9:00 AM - 1:00 PM</p>
          <p>Sunday: Closed</p>
        </div>
        
        <div className={styles.infoCard}>
          <h3>Emergency Contact</h3>
          <p>Phone: 1-800-123-4567</p>
          <p>Email: emergency@epostoffice.com</p>
        </div>
      </div>

      <form className={styles.contactForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? styles.errorInput : ''}
          />
          {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? styles.errorInput : ''}
          />
          {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={errors.subject ? styles.errorInput : ''}
          />
          {errors.subject && <span className={styles.errorMessage}>{errors.subject}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            className={errors.message ? styles.errorInput : ''}
          ></textarea>
          {errors.message && <span className={styles.errorMessage}>{errors.message}</span>}
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={submitStatus === 'sending'}
        >
          {submitStatus === 'sending' ? 'Sending...' : 'Send Message'}
        </button>

        {submitStatus === 'success' && (
          <div className={styles.successMessage}>
            Thank you for your message! We will get back to you soon.
          </div>
        )}
      </form>
    </div>
  );
};

export default ContactSupport;