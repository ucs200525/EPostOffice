import React, { createContext, useState, useContext } from 'react';

const StaffContext = createContext(null);

export const StaffProvider = ({ children }) => {
  const [staffInfo, setStaffInfo] = useState({
    name: localStorage.getItem('staffName') || '',
    role: localStorage.getItem('staffRole') || '',
    id: localStorage.getItem('staffId') || '',
    isAuthenticated: !!localStorage.getItem('staffToken')
  });

  const updateStaffInfo = (info) => {
    setStaffInfo(info);
    Object.entries(info).forEach(([key, value]) => {
      localStorage.setItem(`staff${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
    });
  };

  const logout = () => {
    setStaffInfo({
      name: '',
      role: '',
      id: '',
      isAuthenticated: false
    });
    ['staffName', 'staffRole', 'staffId', 'staffToken'].forEach(key => 
      localStorage.removeItem(key)
    );
  };

  return (
    <StaffContext.Provider value={{ staffInfo, updateStaffInfo, logout }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};
