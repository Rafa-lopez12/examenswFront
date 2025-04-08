// /contexts/CanvasContext.js
import React, { createContext, useContext, useState } from 'react';

const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const [selectedShape, setSelectedShape] = useState(null);
  const [shapes, setShapes] = useState([
    { id: 'shape1', x: 100, y: 100, width: 120, height: 100 },
    { id: 'shape2', x: 200, y: 150, width: 120, height: 100 },
  ]);

  return (
    <CanvasContext.Provider value={{ selectedShape, setSelectedShape, shapes, setShapes }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};
