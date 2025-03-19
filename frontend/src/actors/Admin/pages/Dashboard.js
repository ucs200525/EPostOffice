import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { fetchDashboardStats, fetchAnalytics } from '../../../services/dashboardService';
import styles from '../styles/DashboardAdmin.module.css';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        console.log("Current user:", user); // Add this line
        if (!user || user.role !== 'admin') {
            navigate('/admin/login');
        }
    }, [user, navigate]);

    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeCustomers: 0,
        totalStaff: 0,
        monthlyRevenue: 0,
        recentTransactions: [],
        orders: { total: 0, completed: 0, pending: 0 }
    });

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetchDashboardData(token);
    }, []);

    const fetchDashboardData = async (token) => {
        try {
            const [statsData, analyticsData] = await Promise.all([
                fetchDashboardStats(token),
                fetchAnalytics(token)
            ]);

            setStats(statsData.stats);
            updateChartData(analyticsData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const updateChartData = (analyticsData) => {
        setChartData({
            labels: analyticsData.labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: analyticsData.revenueData,
                    borderColor: '#4f46e5',
                    tension: 0.4
                },
                {
                    label: 'Orders',
                    data: analyticsData.orderData,
                    borderColor: '#10b981',
                    tension: 0.4
                }
            ]
        });
    };

    return (
        <div className={styles.dashboardContent}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Total Revenue</h3>
                    <p className={styles.statNumber}>₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className={styles.statCard}>
                    <h3>Active Customers</h3>
                    <p className={styles.statNumber}>{stats.activeCustomers}</p>
                </div>
                <div className={styles.statCard}>
                    <h3>Total Staff</h3>
                    <p className={styles.statNumber}>{stats.totalStaff}</p>
                </div>
                <div className={styles.statCard}>
                    <h3>Monthly Revenue</h3>
                    <p className={styles.statNumber}>₹{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <div className={styles.chartContainer}>
                    <h3>Revenue Trends</h3>
                    <Line data={chartData} />
                </div>
                <div className={styles.chartContainer}>
                    <h3>Order Statistics</h3>
                    <Bar 
                        data={{
                            labels: ['Total', 'Completed', 'Pending'],
                            datasets: [{
                                data: [
                                    stats.orders.total,
                                    stats.orders.completed,
                                    stats.orders.pending
                                ],
                                backgroundColor: ['#4f46e5', '#10b981', '#f59e0b']
                            }]
                        }} 
                    />
                </div>
            </div>

            <div className={styles.recentTransactions}>
                <h3>Recent Transactions</h3>
                <table className={styles.transactionsTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.recentTransactions.map(transaction => (
                            <tr key={transaction._id}>
                                <td>{transaction._id}</td>
                                <td>{transaction.customer.name}</td>
                                <td>₹{transaction.amount}</td>
                                <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
