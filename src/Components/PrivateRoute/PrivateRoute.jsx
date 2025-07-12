import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token'); // Check if token exists
  const location = useLocation();

  if (!token) {
    // If not logged in, redirect to login page
    // Pass current location so you can redirect back after login
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  // If logged in, render the child component(s)
  return children;
};

export default PrivateRoute;
