import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import styles from '../styles/Payment.module.css';
import { 
    FaWallet, FaHistory, FaPlusCircle, FaArrowUp, 
    FaArrowDown, FaFilter, FaSort, FaSearch 
} from 'react-icons/fa';

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
    const [filteredTransactions, setFilteredTransactions] = useState([]);

    useEffect(() => {
        if (user) {
            Promise.all([
                fetchWalletBalance(),
                fetchTransactions()
            ]).then(() => setLoading(false))
              .catch(err => {
                  setError(err.message);
                  setLoading(false);
              });
        }
    }, [user]);

    const fetchWalletBalance = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/${user._id}/wallet`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );
            setWalletBalance(response.data.balance);
        } catch (err) {
            setError('Failed to fetch wallet balance');
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/${user._id}/transactions`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );
            setTransactions(response.data.transactions);
        } catch (err) {
            setError('Failed to fetch transactions');
        }
    };

    const handleTopUp = async () => {
        try {
            const amount = parseFloat(topUpAmount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/topup`,
                {
                    customerId: user._id,
                    amount,
                    paymentMethod
                },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );

            setWalletBalance(response.data.newBalance);
            await fetchTransactions();
            setShowTopUpModal(false);
            setTopUpAmount('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSort = () => {
        const sorted = [...filteredTransactions].sort((a, b) => {
            if (sortOrder === 'desc') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
        setFilteredTransactions(sorted);
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    };

    const handleFilter = (type) => {
        setFilterType(type);
        let filtered = [...transactions];
        
        if (type !== 'all') {
            filtered = filtered.filter(t => t.type === type);
        }

        if (searchTerm) {
            filtered = filtered.filter(t => 
                t.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredTransactions(filtered);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        let filtered = [...transactions];
        
        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }

        if (value) {
            filtered = filtered.filter(t => 
                t.description.toLowerCase().includes(value.toLowerCase())
            );
        }

        setFilteredTransactions(filtered);
    };

    useEffect(() => {
        if (transactions.length > 0) {
            handleFilter(filterType);
        }
    }, [transactions, filterType]);

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.payment_container}>
            <section className={styles.wallet_section}>
                <div className={styles.wallet_card}>
                    <FaWallet className={styles.wallet_icon} />
                    <h2>Wallet Balance</h2>
                    <div className={styles.balance_amount}>${walletBalance ? walletBalance.toFixed(2) : '0.00'}</div>
                    <button 
                        className={styles.top_up_btn}
                        onClick={() => setShowTopUpModal(true)}
                    >
                        <FaPlusCircle /> Top Up Wallet
                    </button>
                </div>
            </section>

            <section className={styles.transactions_section}>
                <div className={styles.transactions_header}>
                    <h2><FaHistory /> Transaction History</h2>
                    <div className={styles.transactions_controls}>
                        <div className={styles.search_box}>
                            <FaSearch className={styles.search_icon} />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <div className={styles.filter_controls}>
                            <button 
                                className={`${styles.filter_btn} ${filterType === 'all' ? styles.active : ''}`}
                                onClick={() => handleFilter('all')}
                            >
                                All
                            </button>
                            <button 
                                className={`${styles.filter_btn} ${filterType === 'credit' ? styles.active : ''}`}
                                onClick={() => handleFilter('credit')}
                            >
                                Credits
                            </button>
                            <button 
                                className={`${styles.filter_btn} ${filterType === 'debit' ? styles.active : ''}`}
                                onClick={() => handleFilter('debit')}
                            >
                                Debits
                            </button>
                            <button 
                                className={styles.sort_btn}
                                onClick={handleSort}
                            >
                                <FaSort /> {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.transactions_list}>
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(transaction => (
                            <div key={transaction._id} className={styles.transaction_item}>
                                {transaction.type === 'credit' ? 
                                    <FaArrowUp className={`${styles.transaction_icon} ${styles.credit}`} /> : 
                                    <FaArrowDown className={`${styles.transaction_icon} ${styles.debit}`} />
                                }
                                <div className={styles.transaction_details}>
                                    <h3>{transaction.description}</h3>
                                    <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className={styles.transaction_amount}>
                                    {transaction.type === 'credit' ? '+' : '-'}
                                    ${transaction.amount.toFixed(2)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.no_transactions}>
                            <p>No transactions found</p>
                        </div>
                    )}
                </div>
            </section>

            {showTopUpModal && (
                <div className={styles.modal}>
                    <div className={styles.modal_content}>
                        <h2>Top Up Wallet</h2>
                        <button className={styles.close_btn} onClick={() => setShowTopUpModal(false)}>×</button>
                        {error && <div className={styles.error_message}>{error}</div>}
                        <input
                            type="number"
                            value={topUpAmount}
                            onChange={e => setTopUpAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="1"
                            required
                        />
                        <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                        >
                            <option value="credit_card">Credit Card</option>
                            <option value="debit_card">Debit Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                        </select>
                        <button onClick={handleTopUp}>Confirm Top Up</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payment;
