import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
// import AdminSidebar from './actors/Admin/components/AdminSidebar';

import EPostOfficeNavbar from './actors/Customer/components/Navbar';
import Home from './actors/Customer/pages/Home';
import { AuthProvider } from './context/AuthContext';
import { ShipmentProvider } from './context/ShipmentContext';
import { DarkModeProvider } from './context/DarkModeContext';

import './actors/Admin/styles/AdminLayout.module.css';
import './actors/Customer/styles/DarkMode.css';

import Login from './actors/Customer/pages/Login';
import Register from './actors/Customer/pages/Register';
import PostalCalculator from './actors/Customer/pages/PostalCalculator';
import Payment from './actors/Customer/pages/Payment';
import SendPackage from './actors/Customer/pages/SendPackage';
import Shipments from './actors/Customer/pages/Shipments';
import TrackTrace from './actors/Customer/pages/TrackTrace';
import Settings from './actors/Customer/Settings/Settings';
import Dashboard from './actors/Customer/pages/Dashboard';
import DomesticShipping from './actors/Customer/pages/DomesticShipping';
import InternationalShipping from './actors/Customer/pages/InternationalShipping';
import HelpCenter from './actors/Customer/pages/HelpCenter';
import ContactSupport from './actors/Customer/pages/ContactSupport';
import TermsOfService from './actors/Customer/pages/TermsOfService';
import CustomerAddress from './actors/Customer/pages/CustomerAddress';

import StaffDashboard from './actors/Staff/pages/Dashboard';
import CustomerManagement from './actors/Staff/pages/CustomerManagement';
import StaffProfile from './actors/Staff/pages/Profile';
import CustomerDetails from './actors/Staff/components/CustomerDetails';
import CustomerVerification from './actors/Staff/components/CustomerVerification';
import CustomerModification from './actors/Staff/components/CustomerModification';
import AdminDashboard from './actors/Admin/pages/Dashboard';
import StaffManagement from './actors/Admin/pages/StaffManagement';
import ServicesManagement from './actors/Admin/pages/ServicesManagement';
import Reports from './actors/Admin/pages/Reports';
import AdminSettings from './actors/Admin/pages/AdminSettings';
import Orders from './actors/Staff/pages/Orders';
import Deliveries from './actors/Staff/pages/Deliveries';
import ReportsStaff from './actors/Staff/pages/Reports';
import AdminLogin from './actors/Admin/pages/AdminLogin';
import StaffLogin from './actors/Staff/pages/StaffLogin';
import StaffNavbar from './actors/Staff/components/StaffNavbar';
import StaffRegistration from './actors/Admin/components/StaffRegistration';
import AdminNavbar from './actors/Admin/components/AdminNavbar';  // Change this line

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
              <Route path="/login" element={<Login />} />
              
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
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/contact" element={<ContactSupport />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/customer/addresses" element={
              <PrivateRoute>
                <CustomerAddress />
              </PrivateRoute>
            } />
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

// Update the StaffRoutes component
const StaffRoutes = () => {
  return (
    <div className="staff-layout">
      <StaffNavbar />
      <div className="staff-content">
        <Routes>
          <Route path="/" element={<StaffDashboard />} />
          <Route path="/dashboard" element={<StaffDashboard />} />
          <Route path="/customers" element={<CustomerManagement />} />
          {/* ...other routes... */}
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
