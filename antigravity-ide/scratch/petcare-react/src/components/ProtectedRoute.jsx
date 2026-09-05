import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const storedUser = localStorage.getItem('currentUser');
  
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(storedUser);
    const userRole = user.role || 'owner'; // Default to owner if role is missing, but both have it now
    
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role if unauthorized
      if (userRole === 'doctor') {
        return <Navigate to="/doctor-dashboard" replace />;
      } else {
        return <Navigate to="/owner-dashboard" replace />;
      }
    }
    
    return children;
  } catch (err) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userToken');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
