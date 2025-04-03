import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import styles from '../styles/NewPayment.module.css';
import { FaWallet, FaHistory, FaPlusCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Notification from '../../../components/Notification';
import emailIcon from '../../../assets/send-email.png';

const NewPayment = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  const [customerData, setCustomerData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'customer',
    phone: '',
    walletBalance: 0,
    pickupAddress: {
      label: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      type: 'pickup',
      isDefault: false,
      _id: ''
    },
    deliveryAddresses: []
  });

  const [transactions, setTransactions] = useState([]);
  const [topUpAmount, setTopUpAmount] = useState('');
  const rechargeAmounts = [100, 500, 1000, 2000];
  const [activeRecharge, setActiveRecharge] = useState(1000);

  useEffect(() => {
    if (isAuthenticated && user) {
      setLoading(true);
      Promise.all([
        fetchProfile(),
        fetchWalletBalance(),
        fetchTransactions()
      ])
      .then(() => setLoading(false))
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (user) {
      setCustomerData(prev => ({
        ...prev,
        ...user,
        id: user._id
      }));
    } else {
      const userFromLocal = localStorage.getItem('user');
      if (userFromLocal) {
        try {
          const parsedUser = JSON.parse(userFromLocal);
          setCustomerData(prev => ({
            ...prev,
            ...parsedUser,
            id: parsedUser._id
          }));
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!user || !user._id) {
        console.log('No user ID available');
        return;
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/${user._id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setCustomerData(prev => ({
        ...prev,
        ...response.data.data,
        id: response.data.data._id
      }));
      setError(null);
    } catch (err) {
      console.error('Profile fetch failed:', err);
      setNotification({
        show: true,
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch profile'
      });
      setCustomerData(null);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!user || !user._id) return;

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/${user._id}/wallet`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setCustomerData(prev => ({
          ...prev,
          walletBalance: response.data.balance
        }));
      }
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      if (!user || !user._id) return;

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/${user._id}/transactions`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );

      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
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
        setCustomerData(prev => ({
          ...prev,
          walletBalance: response.data.newBalance
        }));
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
          <div className={styles.balance_amount}>₹{customerData.walletBalance.toFixed(2)}</div>
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
