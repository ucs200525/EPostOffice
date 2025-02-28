import React, { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';
import { FaMoneyBillWave, FaPiggyBank, FaExchangeAlt, FaReceipt, FaShieldAlt, FaStar } from 'react-icons/fa';
import axios from 'axios';

const Dashboard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [financialData, setFinancialData] = useState({
        accountBalance: 0,
        pendingTransactions: [],
        recentTransactions: [],
        savingsSchemes: []
    });

    const [moneyOrderForm, setMoneyOrderForm] = useState({
        amount: '',
        recipientName: '',
        recipientAddress: '',
        purpose: ''
    });

    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [feedbackStatus, setFeedbackStatus] = useState({
        loading: false,
        error: null,
        success: false
    });

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/postal-finance/dashboard', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setFinancialData(response.data);
            setError(null);
        } catch (err) {
            
            console.error('Financial data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMoneyOrderSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/postal-finance/money-order', moneyOrderForm, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            // Reset form and refresh data
            setMoneyOrderForm({ amount: '', recipientName: '', recipientAddress: '', purpose: '' });
            fetchFinancialData();
        } catch (err) {
            setError('Money order processing failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setFeedbackStatus({ loading: true, error: null, success: false });

        try {
            // Validate input
            if (!rating) {
                throw new Error('Please select a rating');
            }
            if (feedback.length < 10) {
                throw new Error('Feedback must be at least 10 characters long');
            }

            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/feedback`,
                { rating, feedback },
                {
                    headers: { 
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setFeedbackStatus({
                loading: false,
                error: null,
                success: true
            });

            // Reset form
            setFeedback('');
            setRating(0);

            // Show success message
            setTimeout(() => {
                setFeedbackStatus(prev => ({ ...prev, success: false }));
            }, 3000);

        } catch (error) {
            setFeedbackStatus({
                loading: false,
                error: error.response?.data?.message || error.message,
                success: false
            });
        }
    };

    if (loading) return <div className={styles['loading-spinner']}>Processing...</div>;
    if (error) return <div className={styles['error-message']}>{error}</div>;

    return (
        <div className={styles['financial-dashboard']}>
            <section className={styles['security-info']}>
                <FaShieldAlt className={styles['security-icon']} />
                <div className={styles['security-message']}>
                    Your session is secure. Last login: {new Date().toLocaleString()}
                </div>
            </section>

            <section className={styles['account-summary']}>
                <h2>Account Overview</h2>
                <div className={styles['balance-card']}>
                    <FaPiggyBank className={styles['balance-icon']} />
                    <div className={styles['balance-info']}>
                        <h3>Current Balance</h3>
                        <h2>₹{financialData.accountBalance.toFixed(2)}</h2>
                    </div>
                </div>
            </section>

            <section className={styles['money-order-section']}>
                <h2>Create Money Order</h2>
                <form onSubmit={handleMoneyOrderSubmit} className={styles['money-order-form']}>
                    <div className={styles['form-grid']}>
                        <div className={styles['form-group']}>
                            <label>Amount (₹)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="50000"
                                value={moneyOrderForm.amount}
                                onChange={(e) => setMoneyOrderForm({
                                    ...moneyOrderForm,
                                    amount: e.target.value
                                })}
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Recipient Name</label>
                            <input
                                type="text"
                                required
                                value={moneyOrderForm.recipientName}
                                onChange={(e) => setMoneyOrderForm({
                                    ...moneyOrderForm,
                                    recipientName: e.target.value
                                })}
                            />
                        </div>
                        <div className={`${styles['form-group']} ${styles['full-width']}`}>
                            <label>Recipient Address</label>
                            <textarea
                                required
                                value={moneyOrderForm.recipientAddress}
                                onChange={(e) => setMoneyOrderForm({
                                    ...moneyOrderForm,
                                    recipientAddress: e.target.value
                                })}
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Purpose</label>
                            <select
                                required
                                value={moneyOrderForm.purpose}
                                onChange={(e) => setMoneyOrderForm({
                                    ...moneyOrderForm,
                                    purpose: e.target.value
                                })}
                            >
                                <option value="">Select Purpose</option>
                                <option value="family">Family Support</option>
                                <option value="education">Education</option>
                                <option value="business">Business</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className={styles['submit-button']}>Process Money Order</button>
                </form>
            </section>

            <section className={styles['savings-schemes']}>
                <h2>Available Savings Schemes</h2>
                <div className={styles['schemes-grid']}>
                    {financialData.savingsSchemes.map((scheme, index) => (
                        <div key={index} className={styles['scheme-card']}>
                            <h3>{scheme.name}</h3>
                            <p>{scheme.description}</p>
                            <ul className={styles['scheme-details']}>
                                <li>Interest Rate: {scheme.interestRate}%</li>
                                <li>Term: {scheme.term}</li>
                                <li>Min. Deposit: ₹{scheme.minimumDeposit}</li>
                            </ul>
                            <button className={styles['scheme-button']}>Apply Now</button>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles['recent-transactions']}>
                <h2>Recent Transactions</h2>
                <div className={styles['transaction-list']}>
                    {financialData.recentTransactions.map((transaction, index) => (
                        <div key={index} className={styles['transaction-item']}>
                            <FaExchangeAlt className={styles['transaction-icon']} />
                            <div className={styles['transaction-details']}>
                                <h4>{transaction.type}</h4>
                                <p>{transaction.description}</p>
                                <span className={styles['transaction-time']}>{new Date(transaction.timestamp).toLocaleString()}</span>
                            </div>
                            <div className={`${styles['transaction-amount']} ${transaction.amount < 0 ? styles['debit'] : styles['credit']}`}>
                                ₹{Math.abs(transaction.amount).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles['feedback-section']}>
                <h2>Your Feedback Matters</h2>
                <form onSubmit={handleFeedbackSubmit} className={styles['feedback-form']}>
                    <div className={styles['rating-stars']}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                                key={`star-${star}`}
                                className={`${styles['star']} ${star <= rating ? styles['active'] : ''}`}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your experience with us... (minimum 10 characters)"
                        disabled={feedbackStatus.loading}
                        minLength={10}
                        maxLength={500}
                        required
                    />
                    {feedbackStatus.error && (
                        <div className={styles['error-message']}>{feedbackStatus.error}</div>
                    )}
                    {feedbackStatus.success && (
                        <div className={styles['success-message']}>
                            Thank you for your feedback!
                        </div>
                    )}
                    <button 
                        type="submit" 
                        className={styles['submit-button']}
                        disabled={feedbackStatus.loading}
                    >
                        {feedbackStatus.loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default Dashboard;
