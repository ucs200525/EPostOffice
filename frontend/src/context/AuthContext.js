import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Add error state

    // Add verifyToken function
    const verifyToken = async (token) => {
        try {
            const response = await axios.get('http://localhost:4000/api/auth/verify', {
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
            setError(null); // Clear any previous errors
            const response = await axios.post('http://localhost:4000/api/auth/login', {
                email,
                password
            });

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

            // Return role information for redirect handling
            return { 
                success: true, 
                user,
                role: user.role 
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            setError(errorMessage);
            return { 
                success: false, 
                error: errorMessage
            };
        }
    };

    const logout = async (navigate) => {
        try {
            setError(null);
            
            // Clear all auth-related data from localStorage
            localStorage.clear(); // This will clear all localStorage items
            
            // Reset all state
            setIsAuthenticated(false);
            setUser(null);
            setRole(null);

            // Navigate to login page if navigate function is provided
            if (navigate) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout error:', error);
            setError('Logout failed');
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('http://localhost:4000/api/auth/register', userData);
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
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
            error, // Add error to the context
            setError, // Optionally expose setError
            login,
            role,
            logout,
            register,
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