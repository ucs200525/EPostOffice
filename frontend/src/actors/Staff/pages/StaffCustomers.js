import React, { useState } from 'react';
import { FaSearch, FaEye, FaEdit } from 'react-icons/fa';
import styles from '../styles/StaffCustomers.module.css';

const StaffCustomers = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Mock data - replace with actual API call
    const customers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321', status: 'inactive' },
        // Add more mock data as needed
    ];

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleViewCustomer = (id) => {
        // Implement view customer logic
        console.log('View customer:', id);
    };

    const handleEditCustomer = (id) => {
        // Implement edit customer logic
        console.log('Edit customer:', id);
    };

    return (
        <div className={styles.customers_container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Customer Management</h1>
                <div className={styles.search_bar}>
                    <FaSearch style={{ color: '#5f6368', marginRight: '8px' }} />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className={styles.search_input}
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <div className={styles.table_container}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id}>
                                <td>{customer.name}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
                                <td>
                                    <span className={`${styles.status_badge} ${customer.status === 'active' ? styles.status_active : styles.status_inactive}`}>
                                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className={`${styles.action_button} ${styles.view_button}`}
                                        onClick={() => handleViewCustomer(customer.id)}
                                    >
                                        <FaEye style={{ marginRight: '4px' }} />
                                        View
                                    </button>
                                    <button
                                        className={`${styles.action_button} ${styles.edit_button}`}
                                        onClick={() => handleEditCustomer(customer.id)}
                                    >
                                        <FaEdit style={{ marginRight: '4px' }} />
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.pagination}>
                <button
                    className={styles.page_button}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <button className={`${styles.page_button} ${styles.active}`}>
                    {currentPage}
                </button>
                <button
                    className={styles.page_button}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default StaffCustomers;