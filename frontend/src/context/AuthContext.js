import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberMe') === 'true');

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

    const login = async (email, password, remember = false) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
                email,
                password
            });
    
            const { token, user } = response.data;
    
            if (!user || !user.role) {
                throw new Error('Invalid user data received');
            }
    
            // Store auth data based on remember me preference
            if (remember) {
                localStorage.setItem('token', token);
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('rememberMe', 'true');
            } else {
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('userRole', user.role);
                localStorage.removeItem('rememberMe');
            }
            
            // Update context state
            setUser(user);
            setRole(user.role);
            setIsAuthenticated(true);
    
            // Check if customer has address when role is customer
            if (user.role === 'customer') {
                try {
                    const addressResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
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
        localStorage.removeItem('userRole');
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userRole');
        setIsAuthenticated(false);
        setUser(null);
        setRememberMe(false);
    };
    
    const googleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const { user: googleUser } = result;
    
            // Send Google user data to backend for verification/registration
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google-login`, {
                email: googleUser.email,
                name: googleUser.displayName,
                googleId: googleUser.uid
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
    
            // Check if customer has address when role is customer
            if (user.role === 'customer') {
                try {
                    const addressResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/customer/addresses`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
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
            console.error('Google login error:', error);
            return { 
                success: false,
                error: 'Google login failed',
                user: null,
                role: null
            };
        }
    };
    const register = async (userData) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, userData);
            const { token, user } = response.data;
    
            if (!user || !user.role) {
                throw new Error('Invalid user data received');
            }
    
            // Store auth data
            // localStorage.setItem('token', token);
            // localStorage.setItem('userRole', user.role);
            
            // Update context state
            setUser(user);
            setRole(user.role);
            // setIsAuthenticated(true);
    
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
            logout,
            register,
            token,
            googleLogin,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
