import React, { useState, useEffect } from 'react';
import { FaChartLine, FaUsers, FaMoneyBillWave, FaBox, FaSpinner } from 'react-icons/fa';
import styles from '../styles/Dashboard.module.css';
import { Line } from 'react-chartjs-2';
import '../../../config/chartConfig';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeCustomers: 0,
        totalStaff: 0,
        orders: { total: 0, completed: 0, pending: 0 }
    });
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/admin/dashboard-stats`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch dashboard data');
            const data = await response.json();
            
            if (data.success) {
                setStats({
                    totalRevenue: data.totalRevenue || 0,
                    activeCustomers: data.activeCustomers || 0,
                    totalStaff: data.totalStaff || 0,
                    orders: data.orders || { total: 0, completed: 0, pending: 0 }
                });

                setChartData({
                    revenue: {
                        labels: data.revenueData?.map(item => item.date),
                        data: data.revenueData?.map(item => item.amount)
                    },
                    orders: {
                        labels: data.orderData?.map(item => item.date),
                        data: data.orderData?.map(item => item.count)
                    }
                });
            }
        } catch (err) {
            setError(err.message);
            console.error('Dashboard data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinner} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>Error loading dashboard: {error}</p>
                <button onClick={fetchDashboardData}>Retry</button>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.headerSection}>
                <h1 className={styles.headerTitle}>Admin Dashboard</h1>
                <p className={styles.headerSubtitle}>Overview and Statistics</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.revenue}`}>
                    <div className={styles.statHeader}>
                        <div>
                            <h3 className={styles.statTitle}>Total Revenue</h3>
                            <p className={styles.statValue}>₹{stats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <FaMoneyBillWave className={styles.statIcon} />
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.orders}`}>
                    <div className={styles.statHeader}>
                        <div>
                            <h3 className={styles.statTitle}>Total Orders</h3>
                            <p className={styles.statValue}>{stats.orders.total}</p>
                        </div>
                        <FaBox className={styles.statIcon} />
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.customers}`}>
                    <div className={styles.statHeader}>
                        <div>
                            <h3 className={styles.statTitle}>Active Customers</h3>
                            <p className={styles.statValue}>{stats.activeCustomers}</p>
                        </div>
                        <FaUsers className={styles.statIcon} />
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.staff}`}>
                    <div className={styles.statHeader}>
                        <div>
                            <h3 className={styles.statTitle}>Total Staff</h3>
                            <p className={styles.statValue}>{stats.totalStaff}</p>
                        </div>
                        <FaChartLine className={styles.statIcon} />
                    </div>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <div className={styles.chartContainer}>
                    <h3>Revenue Trends</h3>
                    <Line
                        data={{
                            labels: chartData?.revenue?.labels || [],
                            datasets: [{
                                label: 'Revenue',
                                data: chartData?.revenue?.data || [],
                                borderColor: '#3b82f6',
                                tension: 0.4
                            }]
                        }}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        borderDash: [2]
                                    }
                                }
                            }
                        }}
                    />
                </div>

                <div className={styles.chartContainer}>
                    <h3>Order Trends</h3>
                    <Line
                        data={{
                            labels: chartData?.orders?.labels || [],
                            datasets: [{
                                label: 'Orders',
                                data: chartData?.orders?.data || [],
                                borderColor: '#10b981',
                                tension: 0.4
                            }]
                        }}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        borderDash: [2]
                                    }
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
