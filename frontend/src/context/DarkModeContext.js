import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Initially check localStorage only
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    // Effect to load dark mode preference from DB on mount
    useEffect(() => {
        const fetchDarkModePreference = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/settings`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.darkMode !== undefined) {
                        setIsDarkMode(response.data.darkMode);
                        localStorage.setItem('darkMode', JSON.stringify(response.data.darkMode));
                    }
                }
            } catch (error) {
                console.error('Error fetching dark mode preference:', error);
            }
        };

        fetchDarkModePreference();
    }, []);

    // Effect to apply dark mode changes after DB confirmation
    useEffect(() => {
        const applyDarkMode = () => {
            const elements = [
                document.documentElement,
                document.body,
                document.getElementById('root'),
                document.getElementById('app')
            ];
            
            elements.forEach(element => {
                if (element) {
                    element.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
                    element.classList.toggle('dark-mode', isDarkMode);
                }
            });
        };

        // Only apply if we have a value in localStorage (means DB operation completed)
        if (localStorage.getItem('darkMode') !== null) {
            applyDarkMode();
        }
    }, [isDarkMode]);

    const toggleDarkMode = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            // Send update to DB first
            const response = await axios.post('/api/user/preferences', 
                { darkMode: !isDarkMode },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            // Only update state if DB update was successful
            if (response.status === 200) {
                localStorage.setItem('darkMode', JSON.stringify(!isDarkMode));
                setIsDarkMode(!isDarkMode);
            }
        } catch (error) {
            console.error('Error updating dark mode preference:', error);
            // Optionally show error to user
        }
    };

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export const useDarkMode = () => useContext(DarkModeContext);
