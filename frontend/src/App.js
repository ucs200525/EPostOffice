import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';
import IPCheckWrapper from './components/IPCheckWrapper';
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
import Payment from './actors/Customer/pages/NewPayment';
import NewPayment from './actors/Customer/pages/Payment';
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
import ShippingConfirmation from './actors/Customer/pages/ShippingConfirmation';
import ShippingSuccess from './actors/Customer/pages/ShippingSuccess';

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
import AdminNavbar from './actors/Admin/components/AdminNavbar';
import OrderAssignment from './actors/Staff/pages/OrderAssignment';
import CustomerDetailsPage from './actors/Staff/pages/CustomerDetails';
import CustomerEdit from './actors/Admin/pages/CustomerEdit';

const App = () => {
  // Site disabled check
  if (process.env.REACT_APP_SITE_DISABLED === "true") {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1>Site Maintenance</h1>
        <p>Our site is currently undergoing scheduled maintenance.</p>
        <p>Please check back later.</p>
      </div>
    );
  }

  return (
    <DarkModeProvider>
      <ShipmentProvider>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <>
                  <EPostOfficeNavbar />
                  <Home />
                </>
              } />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/staff/login" element={<StaffLogin />} />
              <Route path="/login" element={
                <>
                  <EPostOfficeNavbar />
                  <Login />
                </>
              } />
              <Route path="/register" element={
                <>
                  <EPostOfficeNavbar />
                  <Register />
                </>
              } />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/*" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              } />
              <Route path="/staff/*" element={
                <ProtectedRoute>
                  <StaffRoutes />
                </ProtectedRoute>
              } />
              <Route path="/calculator" element={
                <ProtectedRoute>
                  <PostalCalculator />
                </ProtectedRoute>
              } />
              <Route path="/send-package/domestic" element={
                <ProtectedRoute>
                  <DomesticShipping />
                </ProtectedRoute>
              } />
              <Route path="/send-package/international" element={
                <ProtectedRoute>
                  <InternationalShipping />
                </ProtectedRoute>
              } />
              <Route path="/*" element={
                <ProtectedRoute>
                  <CustomerLayout />
                </ProtectedRoute>
              } />
            </Routes>
          </AuthProvider>
        </Router>
      </ShipmentProvider>
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
            <Route path="/newpayment" element={<NewPayment />} />
            
            {/* Add these new routes */}
            <Route path="/send-package" element={<SendPackage />} />
            <Route path="/send-package/domestic" element={<DomesticShipping />} />
            <Route path="/send-package/international" element={<InternationalShipping />} />
            <Route path="/shipp" element={<CustomerDetails />} />
            <Route path="/shippi" element={<CustomerVerification />} />
            <Route path="/shipping/confirmation" element={<ShippingConfirmation />} />
            <Route path="/shipping/success" element={<ShippingSuccess />} />
            <Route path="/shipping/international/confirmation" element={<ShippingConfirmation />} />
            
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
      <AdminNavbar />
      <div className="admin-content">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="staff/register" element={<StaffRegistration />} />
          <Route path="services" element={<ServicesManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="customer/:id/edit" element={<CustomerEdit />} />
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
          <Route index element={<StaffDashboard />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="customer/:id" element={<CustomerDetailsPage />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reports" element={<ReportsStaff />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="order-assignment/:trackingNumber" element={<OrderAssignment />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

// Enhance the NotFound component
const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1 style={{
        fontSize: '4rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#3b82f6',
      }}>
        404
      </h1>
      <p style={{
        fontSize: '1.5rem',
        marginBottom: '1.5rem',
        color: '#64748b',
      }}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <a href="/" style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        textDecoration: 'none',
        borderRadius: '0.5rem',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
      onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}>
        Go Back to Home
      </a>
    </div>
  );
};

export default App;
