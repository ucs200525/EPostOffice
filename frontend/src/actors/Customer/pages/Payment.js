import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import styles from '../styles/Payment.module.css';
import { 
    FaWallet, FaHistory, FaPlusCircle, FaArrowUp, 
    FaArrowDown, FaSort, FaSearch 
} from 'react-icons/fa';
import Notification from '../../../components/Notification';

const Payment = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState({
        show: false,
        type: '',
        message: ''
    });

    const [customerData, setCustomerData] = useState(null);

    const topUpOptions = [
        { amount: 100, label: '₹100' },
        { amount: 200, label: '₹200' },
        { amount: 500, label: '₹500' },
        { amount: 1000, label: '₹1,000' },
        { amount: 2000, label: '₹2,000' },
        { amount: 5000, label: '₹5,000' }
    ];

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
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/${customerData.id}/transactions`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
            );
            setTransactions(response.data.transactions);
        } catch (err) {
            setError('Failed to fetch transactions');
        } finally {
            setLoading(false);
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
                { customerId: customerData.id, amount, paymentMethod },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            if (response.data.success) {
                setWalletBalance(response.data.newBalance);
                fetchTransactions();
                setShowTopUpModal(false);
                setTopUpAmount('');
                setNotification({ show: true, type: 'success', message: 'Wallet topped up successfully!' });
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            setNotification({ show: true, type: 'error', message: err.message || 'Failed to top up wallet' });
        }
    };

    const handleSort = () => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    };

    const handleTopUpAmountSelect = (amount) => {
        setTopUpAmount(amount);
    };

    const handleCustomAmount = (e) => {
        const value = e.target.value;
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 10000)) {
            setTopUpAmount(value);
        }
    };

    const filteredTransactions = transactions
        .filter(t => (filterType === 'all' ? true : t.transactionType === filterType))
        .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => (sortOrder === 'desc' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)));

    return (
        <div className={styles.payment_container}>
            {notification.show && (
                <Notification type={notification.type} message={notification.message} onClose={() => setNotification({ ...notification, show: false })} />
            )}

            <section className={styles.wallet_section}>
                <div className={styles.wallet_card}>
                    <FaWallet className={styles.wallet_icon} />
                    <h2>Wallet Balance</h2>
                    <div className={styles.balance_amount}>${walletBalance.toFixed(2)}</div>
                    <button className={styles.top_up_btn} onClick={() => setShowTopUpModal(true)}>
                        <FaPlusCircle /> Top Up Wallet
                    </button>
                </div>
            </section>

            {showTopUpModal && (
                <div className={styles.modal}>
                    <div className={styles.modal_content}>
                        <button 
                            className={styles.close_btn}
                            onClick={() => setShowTopUpModal(false)}
                        >
                            ×
                        </button>
                        <h2>Top Up Wallet</h2>
                        
                        <div className={styles.amount_options}>
                            {topUpOptions.map((option) => (
                                <button
                                    key={option.amount}
                                    className={`${styles.amount_btn} ${
                                        parseInt(topUpAmount) === option.amount ? styles.selected : ''
                                    }`}
                                    onClick={() => handleTopUpAmountSelect(option.amount)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className={styles.custom_amount}>
                            <label>Or enter custom amount:</label>
                            <input
                                type="number"
                                value={topUpAmount}
                                onChange={handleCustomAmount}
                                placeholder="Enter amount (max ₹10,000)"
                                min="1"
                                max="10000"
                            />
                            <small>Maximum amount: ₹10,000</small>
                        </div>

                        <div className={styles.payment_methods}>
                            <h3>Select Payment Method</h3>
                            <div className={styles.payment_options}>
                                <label className={styles.payment_option}>
                                    <input
                                        type="radio"
                                        value="credit_card"
                                        checked={paymentMethod === 'credit_card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Credit Card</span>
                                </label>
                                <label className={styles.payment_option}>
                                    <input
                                        type="radio"
                                        value="debit_card"
                                        checked={paymentMethod === 'debit_card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Debit Card</span>
                                </label>
                                <label className={styles.payment_option}>
                                    <input
                                        type="radio"
                                        value="upi"
                                        checked={paymentMethod === 'upi'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>UPI</span>
                                </label>
                                <label className={styles.payment_option}>
                                    <input
                                        type="radio"
                                        value="net_banking"
                                        checked={paymentMethod === 'net_banking'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Net Banking</span>
                                </label>
                            </div>
                        </div>

                        <button
                            className={styles.proceed_btn}
                            onClick={handleTopUp}
                            disabled={!topUpAmount || parseInt(topUpAmount) <= 0}
                        >
                            Proceed to Pay ₹{topUpAmount || 0}
                        </button>
                    </div>
                </div>
            )}

            <section className={styles.transactions_section}>
                <div className={styles.transactions_header}>
                    <h2><FaHistory /> Transaction History</h2>
                    <div className={styles.transactions_controls}>
                        <div className={styles.search_box}>
                            <FaSearch className={styles.search_icon} />
                            <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <button className={styles.sort_btn} onClick={handleSort}>
                            <FaSort /> {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                        </button>
                    </div>
                </div>

                <div className={styles.transactions_list}>
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(transaction => (
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
                                    {transaction.transactionType === 'CREDIT' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.no_transactions}><p>No transactions found</p></div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Payment;
