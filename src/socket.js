// /socket.js
// socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Conexión
socket.on('connect', () => {
  console.log('Conectado al servidor de WebSocket');
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor de WebSocket');
});

// Función para escuchar cambios de forma
export const subscribeToShapeUpdates = (callback) => {
  socket.on('updateShape', callback);
};

// Función para dejar de escuchar
export const unsubscribeFromShapeUpdates = (callback) => {
  socket.off('updateShape', callback);
};

// Emitir eventos
export const emitMoveShape = (data) => {
  socket.emit('moveShape', data);
};

export const emitResizeShape = (data) => {
  socket.emit('resizeShape', data);
};

export default socket;

