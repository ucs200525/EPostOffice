import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EPostOfficeNavbar from './components/Navbar';
import SideBar from './components/sideBar';
import Home from './pages/Customer/Home';
import { AuthProvider } from './context/AuthContext';
import { ShipmentProvider } from './context/ShipmentContext';
import { DarkModeProvider } from './context/DarkModeContext';
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

const App = () => {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <ShipmentProvider>
          <Router>
            <Routes>
              <Route path="/admin/*" element={<AdminLayout />} />
              <Route path="/staff/*" element={<StaffRoutes />} />
              <Route path="/*" element={<CustomerLayout />} />
              {/* Staff Routes */}
              <Route path="/staff" element={<StaffDashboard />} />
              <Route path="/staff/orders" element={<Orders />} />
              <Route path="/staff/deliveries" element={<Deliveries />} />
              <Route path="/staff/reports" element={<Reports />} />
              <Route path="/staff/profile" element={<StaffProfile />} />
              <Route path="/staff/customers" element={<CustomerManagement />} />
              <Route path="/staff/customer/:id" element={<CustomerDetails />} />
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
        <SideBar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/calculator" element={<PostalCalculator />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/send-package" element={<SendPackage />} />
            <Route path="/Shipments" element={<Shipments />} />
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

// New AdminLayout component to wrap all admin routes
const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/services" element={<ServicesManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<AdminSettings />} /> {/* Changed this line */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

// Staff routes without default navigation
const StaffRoutes = () => {
  return (
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
