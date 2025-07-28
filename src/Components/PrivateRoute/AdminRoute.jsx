import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ children, allowedRoles = ['admin'] }) => {
  console.log('🔐 AdminRoute component is checking access...');

  const token = localStorage.getItem('access_token');
  const location = useLocation();

  console.log('AdminRoute - Token exists:', !!token);
  console.log('AdminRoute - Allowed roles:', allowedRoles);

  if (!token) {
    console.log('AdminRoute - No token, redirecting to login');
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  try {
    const user = jwtDecode(token);
    console.log('AdminRoute - Decoded user:', user);

    // Handle both 'role' (string) and 'roles' (array) formats
    const userRoles = user.roles || (user.role ? [user.role] : []);
    console.log('AdminRoute - User roles:', userRoles);
    console.log('AdminRoute - Allowed roles:', allowedRoles);

    // Check if user has any of the allowed roles
    const hasPermission = userRoles.some((role) => allowedRoles.includes(role));
    console.log('AdminRoute - Has permission?', hasPermission);

    if (!hasPermission) {
      console.log('AdminRoute - Access denied, redirecting to home');
      return <Navigate to="/" replace />;
    }

    console.log('AdminRoute - Access granted, rendering children');
    // If user has permission, render the child component(s)
    return children;
  } catch (error) {
    console.error('AdminRoute - Error decoding token:', error);
    // If token is invalid, redirect to login
    localStorage.removeItem('access_token');
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }
};

export default AdminRoute;
