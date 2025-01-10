import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ShipmentContext = createContext();

export const ShipmentProvider = ({ children }) => {
    const { user } = useAuth();
    const [shipments, setShipments] = useState([]);
    const [stats, setStats] = useState({
        active: 0,
        transit: 0,
        delivered: 0
    });

    const fetchShipments = async () => {
        try {
            const response = await axios.get(
                `http://localhost:4000/api/packages/${user.id}/shipments`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );
            setShipments(response.data.shipments);
            updateStats(response.data.shipments);
        } catch (err) {
            console.error('Failed to fetch shipments:', err);
        }
    };

    const updateStats = (shipments) => {
        const newStats = shipments.reduce((acc, shipment) => {
            acc[shipment.status]++;
            return acc;
        }, { active: 0, transit: 0, delivered: 0 });
        setStats(newStats);
    };

    const addShipment = (newShipment) => {
        setShipments(prev => [...prev, newShipment]);
        updateStats([...shipments, newShipment]);
    };

    useEffect(() => {
        if (user) {
            fetchShipments();
        }
    }, [user]);

    return (
        <ShipmentContext.Provider value={{ shipments, stats, fetchShipments, addShipment }}>
            {children}
        </ShipmentContext.Provider>
    );
};

export const useShipments = () => useContext(ShipmentContext);
