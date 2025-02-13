import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
// import AdminSidebar from './pages/Admin/components/AdminSidebar';

import EPostOfficeNavbar from './components/Navbar';
import Home from './pages/Customer/Home';
import { AuthProvider } from './context/AuthContext';
import { ShipmentProvider } from './context/ShipmentContext';
import { DarkModeProvider } from './context/DarkModeContext';

import './pages/Admin/styles/AdminLayout.css';
import './pages/Customer/styles/DarkMode.css';

import Login from './pages/Customer/Login';
import Register from './pages/Customer/Register';
import PostalCalculator from './pages/Customer/PostalCalculator';
import Payment from './pages/Customer/Payment';
import SendPackage from './pages/Customer/SendPackage';
import Shipments from './pages/Customer/Shipments';
import TrackTrace from './pages/Customer/TrackTrace';
import Settings from './pages/Customer/Settings';
import Dashboard from './pages/Customer/Dashboard';
import DomesticShipping from './pages/Customer/DomesticShipping';
import InternationalShipping from './pages/Customer/InternationalShipping';

import StaffDashboard from './pages/Staff/pages/Dashboard';
import CustomerManagement from './pages/Staff/pages/CustomerManagement';
import StaffProfile from './pages/Staff/pages/Profile';
import CustomerDetails from './pages/Staff/components/CustomerDetails';
import CustomerVerification from './pages/Staff/components/CustomerVerification';
import CustomerModification from './pages/Staff/components/CustomerModification';
import AdminDashboard from './pages/Admin/pages/Dashboard';
import StaffManagement from './pages/Admin/pages/StaffManagement';
import ServicesManagement from './pages/Admin/pages/ServicesManagement';
import Reports from './pages/Admin/pages/Reports';
import AdminSettings from './pages/Admin/pages/AdminSettings';
import Orders from './pages/Staff/pages/Orders';
import Deliveries from './pages/Staff/pages/Deliveries';
import ReportsStaff from './pages/Staff/pages/Reports';
import AdminLogin from './pages/Admin/AdminLogin';
import StaffLogin from './pages/Staff/StaffLogin';
import StaffNavbar from './pages/Staff/components/StaffNavbar';
import StaffRegistration from './pages/Admin/components/StaffRegistration';
import AdminNavbar from './pages/Admin/components/AdminNavbar';  // Change this line

const App = () => {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <ShipmentProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/staff/login" element={<StaffLogin />} />
              
              {/* Protected routes with layouts */}
              <Route path="/admin/*" element={
                <PrivateRoute roles={['admin']}>
                  <AdminLayout />
                </PrivateRoute>
              } />
              <Route path="/staff/*" element={
                <PrivateRoute roles={['staff']}>
                  <StaffRoutes />
                </PrivateRoute>
              } />
              <Route path="/*" element={<CustomerLayout />} />
            </Routes>
          </Router>
        </ShipmentProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
};

// Separate layout for customer pages
const CustomerLayout = () => {
  return (
    <>
      <EPostOfficeNavbar />
      <div className="customer-layout">
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/calculator" element={<PostalCalculator />} />
            <Route path="/payment" element={<Payment />} />
            
            {/* Add these new routes */}
            <Route path="/send-package" element={<SendPackage />} />
            <Route path="/send-package/domestic" element={<DomesticShipping />} />
            <Route path="/send-package/international" element={<InternationalShipping />} />
            
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/track" element={<TrackTrace />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

// Update AdminLayout component to include AdminNavbar
const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <AdminNavbar />  {/* Add the AdminNavbar here */}
      <div className="admin-content">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="staff/register" element={<StaffRegistration />} />
          <Route path="services" element={<ServicesManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

// Staff routes without default navigation
const StaffRoutes = () => {
  return (
    <div className="staff-layout">
      <StaffNavbar />
      <div className="staff-content">
        <Routes>
          <Route path="/" element={<StaffDashboard />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/profile" element={<StaffProfile />} />
          <Route path="/customer/:id" element={<CustomerDetails />} />
          <Route path="/verify-customer/:id" element={<CustomerVerification />} />
          <Route path="/modify-customer/:id" element={<CustomerModification />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/reports" element={<ReportsStaff />} />
        </Routes>
      </div>
    </div>
  );
};

// Add a simple NotFound component
const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

export default App;
