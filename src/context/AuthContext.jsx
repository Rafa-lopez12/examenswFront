import React, { createContext, useState, useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { loginRequest, registerRequest, verifyTokenRequest } from '../api/auth';

// Crear el contexto
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Comprobar si hay una sesión guardada al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      console.log(token)
      if (token) {
        try {
          // Verificar si el token es válido con el endpoint check-status
          const response = await verifyTokenRequest();
          
          // El endpoint check-status devuelve el usuario completo y un token renovado
          const { token: newToken, ...userData } = response.data;
          
          // Actualizar el token si se renovó
          if (newToken) {
            localStorage.setItem('token', newToken);
          }
          
          // Establecer los datos del usuario y autenticación
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error verificando token:', error);
          // Si el token no es válido, limpiar localStorage
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  console.log(currentUser)
  // Función para iniciar sesión

  const register=async(data)=>{
    try {
      const res= await registerRequest(data)
      setCurrentUser(res.data)
      setIsAuthenticated(true)
      localStorage.setItem('authToken', res.data.token)
      return true
    } catch (error) {
      console.log('error al registrar', error)
      return false
    }
  }



  const login = async (email, password) => {
    try {
      // Aquí normalmente harías una llamada a tu API de autenticación
      // Este es solo un ejemplo, reemplázalo con tu lógica real
      
      // Simular una llamada exitosa a la API
      const data={email, password}
      const res = await loginRequest(data);
      setCurrentUser(res.data)
      setIsAuthenticated(true);
      localStorage.setItem('authToken', res.data.token);
  
      // Guardar datos en localStorage
      
      // Actualizar estado
      return true;
    } catch (error) {
      console.error('Error de login:', error);
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Actualizar estado
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    register,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;