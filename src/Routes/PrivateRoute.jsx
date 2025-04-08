import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  console.log(isAuthenticated)
  
  // Si el usuario no está autenticado, redirige al login
  // De lo contrario, renderiza las rutas hijas (Outlet)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;