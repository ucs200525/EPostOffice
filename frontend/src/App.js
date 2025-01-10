import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EPostOfficeNavbar from './components/Navbar';
import SideBar from './components/sideBar';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import { ShipmentProvider } from './context/ShipmentContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PostalCalculator from './pages/PostalCalculator';
import Payment from './pages/Payment';
import SendPackage from './pages/SendPackage';
import Shipments from './pages/Shipments';
// import About from './pages/About';

// import Profile from './pages/Profile';

const App = () => {
  return (
    <AuthProvider>
      <ShipmentProvider>
        <Router>
          <EPostOfficeNavbar />
          <div style={{ display: 'flex' }}>
            <SideBar /> {/* Sidebar included for navigation */}
            <div style={{ flex: 1, padding: '20px' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/calculator" element={<PostalCalculator />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/send-package" element={<SendPackage />} />
                <Route path="/Shipments" element={<Shipments />} />
                {/*
                <Route path="/services" element={<Services />} />
                <Route path="/about" element={<About />} />
                <Route path="/profile" element={<Profile />} /> */}
              </Routes>
            </div>
          </div>
        </Router>
      </ShipmentProvider>
    </AuthProvider> 
  );
};

export default App;
