import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on attempted access
    if (roles?.includes('admin')) {
      return <Navigate to="/admin/login" />;
    }
    if (roles?.includes('staff')) {
      return <Navigate to="/staff/login" />;
    }
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user?.role)) {
    // Redirect unauthorized users to their appropriate dashboard
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'staff':
        return <Navigate to="/staff" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

export default PrivateRoute;
