import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

class CustomerService {
    async getCustomers() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/api/staff/customers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch customers');
        }
    }

    async updateCustomerStatus(customerId, status) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${BASE_URL}/api/staff/customers/${customerId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update customer status');
        }
    }

    async getCustomerDetails(customerId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/api/staff/customers/${customerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch customer details');
        }
    }

    async deleteCustomer(customerId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${BASE_URL}/api/staff/customers/${customerId}`,
                { headers: { Authorization: `Bearer ${token}` }}
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete customer');
        }
    }

    async deleteCustomerOrder(orderId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${BASE_URL}/api/staff/orders/${orderId}`,
                { headers: { Authorization: `Bearer ${token}` }}
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete order');
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${BASE_URL}/api/staff/orders/${orderId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update order status');
        }
    }
}

export default new CustomerService();
