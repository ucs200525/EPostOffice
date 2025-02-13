import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token') || ''); // Add token state

    useEffect(() => {
        // Check if token exists in local storage
        if (token) {
            setIsAuthenticated(true);
        }
    }, [token]);

    // Add verifyToken function
    const verifyToken = async (token) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.user;
        } catch (error) {
            throw new Error('Token verification failed');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            verifyToken(token)
                .then(userData => {
                    setUser(userData);
                    setIsAuthenticated(true);
                })
                .catch(() => {
                    logout();
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false); // Make sure to set loading to false when no token exists
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
                email,
                password
            });

            const { token, user } = response.data;

            if (!user || !user.role) {
                throw new Error('Invalid user data received');
            }

            // Store auth data
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', user.role);
            
            // Update context state
            setUser(user);
            setRole(user.role);
            setIsAuthenticated(true);

            return {
                success: true,
                user: user,
                role: user.role
            };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false,
                error: error.response?.data?.message || 'Login failed',
                user: null,
                role: null
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        // Add any other cleanup needed
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, userData);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            loading,
            login,
            role,
            logout,
            register,
            token,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
