import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const useSocketConnection = (url, shapeId, initialState) => {
  const [socket, setSocket] = useState(null);
  const [shapeProps, setShapeProps] = useState(initialState);

  useEffect(() => {
    const socketIo = io(url);
    setSocket(socketIo);

    socketIo.on('updateShape', (data) => {
      if (data.id === shapeId) {
        setShapeProps(data);
      }
    });

    return () => {
      socketIo.disconnect();
    };
  }, [url, shapeId]);

  const emitUpdate = (updatedProps) => {
    const newShape = { ...shapeProps, ...updatedProps };
    setShapeProps(newShape);
    if (socket) socket.emit('moveShape', newShape);
  };

  return {
    socket,
    shapeProps,
    emitUpdate
  };
};

export default useSocketConnection;