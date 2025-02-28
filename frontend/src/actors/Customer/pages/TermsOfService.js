import React from 'react';
import styles from '../styles/TermsOfService.module.css';

const TermsOfService = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Terms of Service</h1>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using the EPost Office services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
        </section>

        <section className={styles.section}>
          <h2>2. Service Description</h2>
          <p>EPost Office provides postal and shipping services, including but not limited to:</p>
          <ul>
            <li>Domestic shipping services</li>
            <li>International shipping services</li>
            <li>Package tracking</li>
            <li>Postal calculations</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. User Responsibilities</h2>
          <p>As a user of our services, you agree to:</p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Maintain the security of your account</li>
            <li>Not use the service for any illegal purposes</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Shipping and Delivery</h2>
          <p>We strive to provide reliable shipping services, however:</p>
          <ul>
            <li>Delivery times are estimates and not guaranteed</li>
            <li>We are not responsible for delays beyond our control</li>
            <li>Shipping costs are calculated based on weight, size, and destination</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Privacy and Data Protection</h2>
          <p>We are committed to protecting your privacy. Our collection and use of your personal information is governed by our Privacy Policy.</p>
        </section>

        <section className={styles.section}>
          <h2>6. Liability</h2>
          <p>Our liability is limited to the extent permitted by law. We are not responsible for:</p>
          <ul>
            <li>Indirect or consequential losses</li>
            <li>Loss or damage due to incorrect address information</li>
            <li>Delays caused by customs or other regulatory bodies</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>7. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.</p>
        </section>

        <div className={styles.lastUpdated}>
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;