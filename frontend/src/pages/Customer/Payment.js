import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './Payment.css';
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

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="payment-container">
            <section className="wallet-section">
                <div className="wallet-card">
                    <FaWallet className="wallet-icon" />
                    <h2>Wallet Balance</h2>
                    <div className="balance-amount">${walletBalance ? walletBalance.toFixed(2) : '0.00'}</div>
                    <button 
                        className="top-up-btn"
                        onClick={() => setShowTopUpModal(true)}
                    >
                        <FaPlusCircle /> Top Up Wallet
                    </button>
                </div>
            </section>

            <section className="transactions-section">
                <div className="transactions-header">
                    <h2><FaHistory /> Transaction History</h2>
                    <div className="transactions-controls">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <div className="filter-controls">
                            <button 
                                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                                onClick={() => handleFilter('all')}
                            >
                                All
                            </button>
                            <button 
                                className={`filter-btn ${filterType === 'credit' ? 'active' : ''}`}
                                onClick={() => handleFilter('credit')}
                            >
                                Credits
                            </button>
                            <button 
                                className={`filter-btn ${filterType === 'debit' ? 'active' : ''}`}
                                onClick={() => handleFilter('debit')}
                            >
                                Debits
                            </button>
                            <button 
                                className="sort-btn"
                                onClick={handleSort}
                            >
                                <FaSort /> {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="transactions-list">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(transaction => (
                            <div key={transaction._id} className="transaction-item">
                                {transaction.type === 'credit' ? 
                                    <FaArrowUp className="transaction-icon credit" /> : 
                                    <FaArrowDown className="transaction-icon debit" />
                                }
                                <div className="transaction-details">
                                    <h3>{transaction.description}</h3>
                                    <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="transaction-amount">
                                    {transaction.type === 'credit' ? '+' : '-'}
                                    ${transaction.amount.toFixed(2)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-transactions">
                            <p>No transactions found</p>
                        </div>
                    )}
                </div>
            </section>

            {showTopUpModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Top Up Wallet</h2>
                        <button className="close-btn" onClick={() => setShowTopUpModal(false)}>×</button>
                        {error && <div className="error-message">{error}</div>}
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
