import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL}/api/admin`; // Replace with your API base URL

const fetchDashboardStats = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard-stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

const fetchAnalytics = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

export { fetchDashboardStats, fetchAnalytics };
