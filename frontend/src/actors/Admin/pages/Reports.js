import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { FaDownload, FaFilter } from 'react-icons/fa';
import styles from '../styles/Reports.module.css';
import '../../../config/chartConfig'; // Add this import
import { defaultOptions } from '../../../config/chartConfig';

const Reports = () => {
    const [reportData, setReportData] = useState({
        revenue: [],
        orders: [],
        customers: []
    });
    const [dateRange, setDateRange] = useState('week');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('revenue');

    const fetchReportData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/admin/reports?range=${dateRange}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            if (data.success) {
                setReportData(data.reports);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const downloadReport = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/admin/reports/download?range=${dateRange}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${dateRange}-${new Date().toISOString()}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error downloading report:', error);
        }
    };

    const revenueData = {
        labels: reportData.revenue.map(item => item._id),
        datasets: [{
            label: 'Revenue',
            data: reportData.revenue.map(item => item.totalAmount),
            fill: false,
            borderColor: '#1e40af',
            tension: 0.4
        }]
    };

    const ordersData = {
        labels: reportData.orders.map(item => item._id),
        datasets: [{
            label: 'Orders',
            data: reportData.orders.map(item => item.count),
            backgroundColor: '#34d399'
        }]
    };

    const customersData = {
        labels: reportData.customers.map(item => item._id),
        datasets: [{
            label: 'New Customers',
            data: reportData.customers.map(item => item.count),
            backgroundColor: [
                '#fbbf24',
                '#60a5fa',
                '#34d399',
                '#f472b6',
                '#a78bfa'
            ]
        }]
    };

    const chartOptions = {
        ...defaultOptions,
        plugins: {
            ...defaultOptions.plugins,
            title: { display: true, text: 'Data Trends' }
        }
    };

    return (
        <div className={styles.reportsContainer}>
            <div className={styles.reportsHeader}>
                <h1>Reports & Analytics</h1>
                <button className={styles.downloadButton} onClick={downloadReport}>
                    <FaDownload /> Download Report
                </button>
            </div>

            <div className={styles.reportsTabs}>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'revenue' ? styles.active : ''}`}
                    onClick={() => setActiveTab('revenue')}
                >
                    Revenue
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'orders' ? styles.active : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Orders
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'customers' ? styles.active : ''}`}
                    onClick={() => setActiveTab('customers')}
                >
                    Customers
                </button>
            </div>

            <div className={styles.reportFilters}>
                <FaFilter />
                <select 
                    className={styles.filterSelect}
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                </select>
            </div>

            <div className={styles.chartContainer}>
                {isLoading ? (
                    <p>Loading...</p>
                ) : activeTab === 'revenue' ? (
                    <Line 
                        data={revenueData} 
                        options={chartOptions}
                    />
                ) : activeTab === 'orders' ? (
                    <Bar 
                        data={ordersData} 
                        options={chartOptions}
                    />
                ) : (
                    <Pie 
                        data={customersData} 
                        options={{
                            ...chartOptions,
                            scales: undefined // Remove scales for Pie chart
                        }}
                    />
                )}
            </div>

            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <h3 className={styles.metricLabel}>Total Revenue</h3>
                    <p className={styles.metricValue}>₹151,000</p>
                    <span className={styles.metricTrend}>+12.5% vs last period</span>
                </div>
                <div className={styles.metricCard}>
                    <h3 className={styles.metricLabel}>Orders Processed</h3>
                    <p className={styles.metricValue}>284</p>
                    <span className={styles.metricTrend}>+5.3% vs last period</span>
                </div>
                <div className={styles.metricCard}>
                    <h3 className={styles.metricLabel}>Active Customers</h3>
                    <p className={styles.metricValue}>1,203</p>
                    <span className={styles.metricTrend}>+8.1% vs last period</span>
                </div>
            </div>
        </div>
    );
};

export default Reports;
