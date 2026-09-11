import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * AdminProtectedRoute
 * Ensures that only authenticated users with role === 'admin'
 * can access clinical administration routes (/admin/dashboard, etc.).
 * If unauthorized, redirects to /admin (the Admin Login page).
 */
const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const storedUser = localStorage.getItem('currentUser');
  const userRole = localStorage.getItem('userRole');

  if (!storedUser) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(storedUser);
    const isAdmin = user?.role === 'admin' || userRole === 'admin';

    if (!isAdmin) {
      return <Navigate to="/admin" state={{ from: location }} replace />;
    }

    return children;
  } catch (err) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }
};

export default AdminProtectedRoute;
