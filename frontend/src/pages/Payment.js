import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Payment.css';
import { 
    FaWallet, 
    FaHistory, 
    FaPlusCircle, 
    FaMoneyBill, 
    FaClock,
    FaArrowUp,
    FaArrowDown
} from 'react-icons/fa';

const Payment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [walletBalance, setWalletBalance] = useState(20);
    const [transactions, setTransactions] = useState([]);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [activeOrders, setActiveOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [pickupDetails, setPickupDetails] = useState({
        date: '',
        time: '',
        address: '',
        description: ''
    });
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');

    useEffect(() => {
        if (user) {
            Promise.all([
                fetchWalletBalance(),
                fetchTransactions(),
                fetchActiveOrders()
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
                `http://localhost:4000/api/customer/${user.id}/wallet`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );
            setWalletBalance(response.data.balance);
        } catch (err) {
            throw new Error('Failed to fetch wallet balance');
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(
                `http://localhost:4000/api/customer/${user.id}/transactions`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );
            setTransactions(response.data.transactions);
        } catch (err) {
            throw new Error('Failed to fetch transactions');
        }
    };

    const fetchActiveOrders = async () => {
        try {
            const response = await axios.get(
                `http://localhost:4000/api/customer/${user.id}/orders?status=active`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );
            setActiveOrders(response.data.orders);
        } catch (err) {
            throw new Error('Failed to fetch active orders');
        }
    };

    const handleTopUp = async () => {
        try {
            const amount = parseFloat(topUpAmount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            const response = await axios.post(
                `http://localhost:4000/api/customer/topup`,
                {
                    customerId: user.id,
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

    const handlePayOrder = async (orderId) => {
        try {
            const order = activeOrders.find(o => o._id === orderId);
            if (!order) throw new Error('Order not found');

            const response = await axios.post(
                `http://localhost:4000/api/customer/payForOrder`,
                {
                    customerId: user.id,
                    orderId,
                    amount: order.totalAmount
                },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );

            setWalletBalance(response.data.newBalance);
            await Promise.all([
                fetchTransactions(),
                fetchActiveOrders()
            ]);
            setSelectedOrder(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handlePlanPickup = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `http://localhost:4000/api/customer/planPickup`,
                {
                    customerId: user.id,
                    pickupDetails,
                    amount: 50 // Fixed amount for pickup service
                },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );

            setWalletBalance(response.data.newBalance);
            await fetchTransactions();
            setPickupDetails({
                date: '',
                time: '',
                address: '',
                description: ''
            });
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="payment-container">
            <section className="wallet-section">
                <div className="wallet-card">
                    <FaWallet className="wallet-icon" />
                    <h2>Wallet Balance</h2>
                    <div className="balance-amount">${walletBalance.toFixed(2)}</div>
                    <button 
                        className="top-up-btn"
                        onClick={() => setShowTopUpModal(true)}
                    >
                        <FaPlusCircle /> Top Up Wallet
                    </button>
                </div>
            </section>

            <section className="transactions-section">
                <h2><FaHistory /> Transaction History</h2>
                <div className="transactions-list">
                    {transactions.map(transaction => (
                        <div 
                            key={transaction._id} 
                            className={`transaction-item ${transaction.type.toLowerCase()}`}
                        >
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
                    ))}
                </div>
            </section>

            <section className="active-orders-section">
                <h2><FaMoneyBill /> Pay for Orders</h2>
                <div className="orders-list">
                    {activeOrders.map(order => (
                        <div key={order._id} className="order-item">
                            <div className="order-details">
                                <h3>Order #{order._id.slice(-6)}</h3>
                                <p>Amount: ${order.totalAmount.toFixed(2)}</p>
                            </div>
                            <button 
                                onClick={() => handlePayOrder(order._id)}
                                disabled={walletBalance < order.totalAmount}
                            >
                                Pay Now
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="pickup-section">
                <h2><FaClock /> Plan Pickup</h2>
                <form onSubmit={handlePlanPickup} className="pickup-form">
                    <input
                        type="date"
                        value={pickupDetails.date}
                        onChange={e => setPickupDetails({...pickupDetails, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                    <select
                        value={pickupDetails.time}
                        onChange={e => setPickupDetails({...pickupDetails, time: e.target.value})}
                        required
                    >
                        <option value="">Select Time</option>
                        <option value="morning">Morning (9 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 3 PM)</option>
                        <option value="evening">Evening (3 PM - 6 PM)</option>
                    </select>
                    <input
                        type="text"
                        value={pickupDetails.address}
                        onChange={e => setPickupDetails({...pickupDetails, address: e.target.value})}
                        placeholder="Pickup Address"
                        required
                    />
                    <textarea
                        value={pickupDetails.description}
                        onChange={e => setPickupDetails({...pickupDetails, description: e.target.value})}
                        placeholder="Description (optional)"
                    />
                    <button 
                        type="submit"
                        disabled={walletBalance < 50 || !pickupDetails.address.trim()}
                    >
                        Schedule Pickup ($50)
                    </button>
                </form>
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
                            required
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
