import React from 'react';
import styles from '../styles/HelpCenter.module.css';

const HelpCenter = () => {
  const faqs = [
    {
      question: 'How do I track my package?',
      answer: 'You can track your package using the Track & Trace feature with your tracking number.'
    },
    {
      question: 'What shipping options are available?',
      answer: 'We offer both domestic and international shipping services with various delivery speeds.'
    },
    {
      question: 'How do I calculate shipping costs?',
      answer: 'Use our Postal Calculator tool to estimate shipping costs based on weight and destination.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit cards, debit cards, and digital payment methods.'
    }
  ];

  const guides = [
    {
      title: 'Shipping Guide',
      description: 'Learn how to properly package and ship your items.'
    },
    {
      title: 'International Shipping',
      description: 'Understanding customs, duties, and international shipping requirements.'
    },
    {
      title: 'Returns Process',
      description: 'Step-by-step guide for handling returns and refunds.'
    }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Help Center</h1>
      
      <section className={styles.faqSection}>
        <h2>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <h3 className={styles.question}>{faq.question}</h3>
              <p className={styles.answer}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.guidesSection}>
        <h2>Helpful Guides</h2>
        <div className={styles.guidesList}>
          {guides.map((guide, index) => (
            <div key={index} className={styles.guideItem}>
              <h3 className={styles.guideTitle}>{guide.title}</h3>
              <p className={styles.guideDescription}>{guide.description}</p>
              <button className={styles.readMoreButton}>Read More</button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.additionalHelp}>
        <h2>Need More Help?</h2>
        <p>Can't find what you're looking for? Contact our support team for assistance.</p>
        <button className={styles.contactButton} onClick={() => window.location.href = '/customer/contact-support'}>
          Contact Support
        </button>
      </section>
    </div>
  );
};

export default HelpCenter;