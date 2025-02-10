import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaGlobe, FaMapMarkedAlt, FaTruck } from 'react-icons/fa';
import styles from './styles/SendPackage.module.css';

const SendPackage = () => {
  const navigate = useNavigate();

  const shippingOptions = [
    {
      title: 'Domestic Shipping',
      icon: <FaTruck />,
      description: 'Send packages anywhere within the country',
      features: [
        'Fast delivery within 2-3 business days',
        'Real-time tracking',
        'Door-to-door service',
        'Insurance coverage available'
      ],
      route: '/send-package/domestic'
    },
    {
      title: 'International Shipping',
      icon: <FaGlobe />,
      description: 'Ship your packages worldwide with reliable tracking',
      features: [
        'Worldwide delivery service',
        'Customs documentation assistance',
        'Package insurance available',
        'Multiple shipping speeds'
      ],
      route: '/send-package/international'
    }
  ];

  return (
    <div className={styles.sendPackageContainer}>
      <div className={styles.header}>
        <FaBox className={styles.headerIcon} />
        <h1>Send a Package</h1>
        <p>Choose your shipping type to get started</p>
      </div>

      <div className={styles.optionsContainer}>
        {shippingOptions.map((option, index) => (
          <div 
            key={index}
            className={styles.optionCard}
            onClick={() => navigate(option.route)}
          >
            <div className={styles.optionIcon}>
              {option.icon}
            </div>
            <h2>{option.title}</h2>
            <p>{option.description}</p>
            <ul className={styles.featuresList}>
              {option.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            <button className={styles.selectButton}>
              Select {option.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SendPackage;
