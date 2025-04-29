import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const useSocketConnection = (url, shapeId, initialState) => {
  const [socket, setSocket] = useState(null);
  const [shapeProps, setShapeProps] = useState(initialState);
  const [connected, setConnected] = useState(false);
  const currentPageRef = useRef(null);  // Referencia para guardar la página actual
  
  // Inicializar la conexión del socket
  useEffect(() => {
    const socketIo = io(url, {
      transports: ['websocket', 'polling'], // Incluir 'polling' para mayor compatibilidad
      path: '/socket.io/',
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    setSocket(socketIo);

    // Manejar eventos de conexión
    socketIo.on('connect', () => {
      console.log('Socket conectado:', socketIo.id);
      setConnected(true);
      
      // Volver a unirse a la sala si hay una página activa
      if (currentPageRef.current) {
        joinPageImpl(socketIo, currentPageRef.current);
      }
    });

    socketIo.on('disconnect', () => {
      console.log('Socket desconectado');
      setConnected(false);
    });

    socketIo.on('connect_error', (error) => {
      console.error('Error de conexión socket:', error);
    });

    // Escuchar actualizaciones de formas
    socketIo.on('updateShape', (data) => {
      if (data.figuraId === shapeId || data.id === shapeId) {
        setShapeProps(prev => ({...prev, ...data}));
      }
    });

    // Escuchar eventos específicos de figuras
    socketIo.on('figureUpdated', (updatedFigure) => {
      if (updatedFigure.id === shapeId) {
        setShapeProps(updatedFigure);
      }
    });

    return () => {
      socketIo.disconnect();
    };
  }, [url, shapeId]);

  // Implementación de unirse a la sala
  const joinPageImpl = (socketInstance, pageId) => {
    if (!socketInstance || !pageId) return;
    
    console.log(`Uniendo a la sala de la página ${pageId}`);
    socketInstance.emit('joinPage', pageId);
    currentPageRef.current = pageId;  // Guardar el ID de la página actual
  };
  
  // Unirse a la sala de una página específica
  const joinPage = (pageId) => {
    // Solo unirse si es una página diferente o si no estamos en ninguna sala
    if (currentPageRef.current !== pageId && socket && connected) {
      joinPageImpl(socket, pageId);
    }
  };

  // Emitir actualización de propiedades de una forma
const emitUpdate = (updatedProps) => {
  // Solo emitir las propiedades que realmente se están actualizando, sin fusionar con initialState
  console.log('Emitiendo actualización:', updatedProps);
  
  if (socket && connected) {
    // Usar el evento moveShape para compatibilidad con el backend existente
    socket.emit('moveShape', updatedProps);
  }
};

  // Emitir actualización completa de figura
  const updateFigure = (figureData, pageId) => {
    if (socket && connected) {
      console.log('Enviando actualización completa de figura:', figureData);
      socket.emit('updateFigure', {
        id: figureData.id,
        data: figureData,
        pageId: pageId || currentPageRef.current
      });
    }
  };

  // Crear nueva figura
  const createFigure = (figureData) => {
    if (socket && connected) {
      console.log('Enviando nueva figura:', figureData);
      socket.emit('createFigure', figureData);
    }
  };

  // Eliminar figura
  const deleteFigure = (id, pageId) => {
    if (socket && connected) {
      console.log('Eliminando figura:', id);
      socket.emit('deleteFigure', { 
        id, 
        pageId: pageId || currentPageRef.current 
      });
    }
  };

  return {
    socket,
    connected,
    shapeProps,
    emitUpdate,
    joinPage,
    updateFigure,
    createFigure,
    deleteFigure,
    currentPage: currentPageRef.current
  };
};

export default useSocketConnection;

