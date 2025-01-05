import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EPostOfficeNavbar from './components/Navbar';
import SideBar from './components/sideBar';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PostalCalculator from './pages/PostalCalculator';
// import Services from './pages/Services';
// import About from './pages/About';

// import Profile from './pages/Profile';

const App = () => {
  return (
    <AuthProvider>
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
              {/*
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} /> */}
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider> 
  );
};

export default App;
