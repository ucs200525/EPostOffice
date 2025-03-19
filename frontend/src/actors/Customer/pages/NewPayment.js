import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import styles from '../styles/NewPayment.module.css';
import { FaWallet, FaPlusCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Notification from '../../../components/Notification';
import emailIcon from '../../../assets/send-email.png'; // Add this line to import the email icon

const NewPayment = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [walletBalance, setWalletBalance] = useState(0);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [notification, setNotification] = useState({
        show: false,
        type: '',
        message: ''
    });
    const [transactions, setTransactions] = useState([]);
    const [customerData, setCustomerData] = useState(null);

    const rechargeAmounts = [100, 500, 1000, 2000];
    const [activeRecharge, setActiveRecharge] = useState(1000);

    useEffect(() => {
        if (user) {
            setCustomerData(user);
        } else {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setCustomerData(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Error parsing user from localStorage:', error);
                }
            }
        }
    }, [user]);

    useEffect(() => {
        if (customerData?.id) {
            fetchWalletBalance();
            fetchTransactions();
        }
    }, [customerData?.id]);

    const fetchWalletBalance = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/${customerData.id}/wallet`,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setWalletBalance(response.data.balance);
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            setNotification({
                show: true,
                type: 'error',
                message: err.message || 'Failed to fetch wallet balance'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');
            
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/${customerData.id}/transactions`,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success && Array.isArray(response.data.transactions)) {
                setTransactions(response.data.transactions);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setNotification({
                show: true,
                type: 'error',
                message: 'Failed to fetch transactions: ' + (err.response?.data?.message || err.message)
            });
        }
    };

    const handleTopUp = async () => {
        try {
            const amount = parseFloat(topUpAmount);
            if (isNaN(amount) || amount <= 0) {
                setNotification({ show: true, type: 'error', message: 'Enter a valid amount' });
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/wallet/topup`,
                { customerId: customerData.id, amount, paymentMethod: 'credit_card' },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            if (response.data.success) {
                setWalletBalance(response.data.newBalance);
                setNotification({ show: true, type: 'success', message: 'Wallet topped up successfully!' });
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            setNotification({ show: true, type: 'error', message: err.message || 'Failed to top up wallet' });
        }
    };

    const handleRechargeClick = (amount) => {
        setTopUpAmount(amount.toString());
        setActiveRecharge(amount);
    };

    const handleEmailRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/${customerData.id}/transactions/email`,
                {},
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            if (response.data.success) {
                setNotification({ show: true, type: 'success', message: 'Transaction history sent to your email!' });
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            setNotification({ show: true, type: 'error', message: err.message || 'Failed to send transaction history' });
        }
    };

    return (
        <div className={styles.payment_container}>
            {notification.show && (
                <Notification 
                    type={notification.type} 
                    message={notification.message} 
                    onClose={() => setNotification({ ...notification, show: false })} 
                />
            )}

            <section className={styles.wallet_section}>
                <div className={styles.wallet_content}>
                    <div className={styles.balance_label}>Balance</div>
                    <div className={styles.balance_amount}>₹{walletBalance.toFixed(2)}</div>
                    <FaWallet className={styles.wallet_icon} />
                </div>
            </section>

            <section className={styles.recharge_section}>
                <div className={styles.recharge_title}>Recharge Wallet</div>
                <div className={styles.recharge_input_group}>
                    <input 
                        type="number" 
                        className={styles.recharge_input} 
                        value={topUpAmount} 
                        onChange={(e) => setTopUpAmount(e.target.value)} 
                        placeholder="₹1000" 
                    />
                    <button className={styles.recharge_button} onClick={handleTopUp}>
                        Add money
                    </button>
                </div>
                <div className={styles.quick_recharge_buttons}>
                    {rechargeAmounts.map(amount => (
                        <button 
                            key={amount}
                            className={`${styles.quick_recharge_button} ${activeRecharge === amount ? styles.active : ''}`}
                            onClick={() => handleRechargeClick(amount)}
                        >
                            + ₹{amount}
                        </button>
                    ))}
                </div>
            </section>

            <section className={styles.transactions_section}>
                <div className={styles.transactions_title}>Wallet transactions</div>
                {transactions.length > 0 ? (
                    <div className={styles.transactions_list}>
                        {transactions.map(transaction => (
                            <div key={transaction._id} className={styles.transaction_item}>
                                {transaction.transactionType === 'CREDIT' ? 
                                    <FaArrowUp className={`${styles.transaction_icon} ${styles.credit}`} /> : 
                                    <FaArrowDown className={`${styles.transaction_icon} ${styles.debit}`} />
                                }
                                <div className={styles.transaction_details}>
                                    <h3>{transaction.description}</h3>
                                    <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className={styles.transaction_amount}>
                                    {transaction.transactionType === 'CREDIT' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.transactions_content}>
                        <p className={styles.no_transactions_text}>
                            No Wallet Transactions in last 3 months
                        </p>
                        <p className={styles.no_transactions_subtext}>
                            To get Wallet transaction history for the last 1 year, tap on the below button.
                        </p>
                        <button className={styles.email_button} onClick={handleEmailRequest}>
                            <img src={emailIcon} alt="Send Email" className={styles.email_icon} />
                            Get email now
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default NewPayment;
