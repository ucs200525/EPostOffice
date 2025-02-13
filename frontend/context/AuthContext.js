import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize axios interceptor
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    await logout();
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            // Check token expiration
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            if (tokenData.exp * 1000 < Date.now()) {
                throw new Error('Token expired');
            }

            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/customer/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setUser(response.data);
            setIsAuthenticated(true);
            setError(null);
        } catch (error) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
                email,
                password
            });

            const { token, admin } = response.data;
           
            if (!token || !admin) {
                throw new Error('Invalid response from server');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('userId', admin.id);
            localStorage.setItem('userEmail', admin.email);
            localStorage.setItem('userRole', admin.role);

            setUser(admin);
            setIsAuthenticated(true);
            setError(null);
            console.log("User",admin);
            return { success: true, admin };
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = async () => {
        try {
// Optional: Call logout endpoint if you have one
// await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`);
            
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');
            
            setIsAuthenticated(false);
            setUser(null);
            setError(null);
        } catch (error) {
            setError('Logout failed');
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, userData);
            
            const { token, user } = response.data;
            
            if (!token || !user) {
                throw new Error('Invalid response from server');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userRole', user.role);
            
            setUser(user);
            setIsAuthenticated(true);
            setError(null);

            return { success: true, user };
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
            return { 
                success: false, 
                error: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    const updateProfile = async (userData) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/customer/profile`,
                userData,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setUser(response.data);
            setError(null);
            return { success: true, user: response.data };
        } catch (error) {
            setError(error.response?.data?.message || 'Profile update failed');
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            loading,
            error,
            login,
            logout,
            register,
            updateProfile,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};