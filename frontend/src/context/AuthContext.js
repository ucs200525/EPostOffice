import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

const verifyToken = async (token) => {
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/customer/profile`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        return response.data.user;
    } catch (error) {
        throw new Error('Token verification failed');
    }
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);

    // Verify token and restore session on mount
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                // First try to get user data from localStorage
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setToken(storedToken);
                    setRole(userData.role);
                    setIsAuthenticated(true);
                }
                
                // Then verify with the backend
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/auth/verify`,
                    {
                        headers: { 'Authorization': `Bearer ${storedToken}` }
                    }
                );

                if (response.data.success) {
                    const userData = response.data.user;
                    
                    setUser(userData);
                    setToken(storedToken);
                    setRole(userData.role);
                    setIsAuthenticated(true);
                } else {
                    handleLogout();
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                // Don't log out immediately on network errors
                // This allows the app to work offline with stored credentials
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    handleLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`,
                { email, password }
            );

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userRole', user.role);

            setUser(user);
            setToken(token);
            setRole(user.role);
            setIsAuthenticated(true);

            return { success: true, user };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        
        setUser(null);
        setToken(null);
        setRole(null);
        setIsAuthenticated(false);
    };

    const googleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const { user: firebaseUser } = result;
    
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google-login`, {
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                googleId: firebaseUser.uid
            });
    
            const { token, user } = response.data;
    
            if (!token || !user) {
                throw new Error('Invalid response from server');
            }
    
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userName', user.name);
    
            setUser(user);
            setToken(token);
            setRole(user.role);
            setIsAuthenticated(true);
            setError(null);
    
            if (user.role === 'customer') {
                try {
                    const addressResponse = await axios.get(
                        `${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    
                    if (!addressResponse.data || addressResponse.data.length === 0) {
                        return {
                            success: true,
                            user: user,
                            role: user.role,
                            redirectToAddress: true
                        };
                    }
                } catch (error) {
                    console.error('Error checking addresses:', error);
                }
            }
    
            return {
                success: true,
                user: user,
                role: user.role,
                redirectToAddress: false
            };
        } catch (error) {
            setError('Google login failed');
            return { 
                success: false, 
                error: error.response?.data?.message || 'Google login failed',
                user: null,
                role: null
            };
        }
    };
    const register = async (userData) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/register`,
                userData
            );
            const { token, user } = response.data;
    
            if (!user || !user.role) {
                throw new Error('Invalid user data received');
            }
    
            setUser(user);
            setRole(user.role);
    
            return {
                success: true,
                user: user,
                role: user.role
            };
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Registration failed',
                user: null,
                role: null
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
            logout: handleLogout,
            register,
            token,
            googleLogin,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
