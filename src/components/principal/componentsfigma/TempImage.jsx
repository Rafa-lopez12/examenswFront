import React, { useState, useEffect } from 'react';
import { Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';

// Componente para mostrar imágenes en Konva
const TempImage = ({ imageData, isSelected, onSelect, onContextMenu }) => {
  // Usar useImage para cargar la imagen
  const [image, status] = useImage(imageData.imageUrl, 'anonymous');
  
  // Logs para depuración
  useEffect(() => {
    console.log(`TempImage ${imageData.id} - status: ${status}`);
    if (status === 'failed') {
      console.error('Error al cargar la imagen:', imageData.id);
    }
  }, [imageData.id, status]);

  // Si la imagen está cargando o ha fallado, mostrar un placeholder
  if (status !== 'loaded' || !image) {
    return (
      <Rect
        x={imageData.x}
        y={imageData.y}
        width={imageData.width || 100}
        height={imageData.height || 100}
        fill={status === 'failed' ? "#ffdddd" : "#f0f0f0"}
        stroke={status === 'failed' ? "#ff0000" : "#cccccc"}
        strokeWidth={isSelected ? 2 : 1}
        id={imageData.id}
        onClick={onSelect}
        onTap={onSelect}
        onContextMenu={onContextMenu}
        draggable={true}
      />
    );
  }

  // Imagen cargada correctamente, mostrarla
  return (
    <KonvaImage
      x={imageData.x}
      y={imageData.y}
      width={imageData.width}
      height={imageData.height}
      image={image}
      id={imageData.id}
      onClick={onSelect}
      onTap={onSelect}
      onContextMenu={onContextMenu}
      draggable={true}
      stroke={isSelected ? '#00a0fc' : undefined}
      strokeWidth={isSelected ? 2 : 0}
    />
  );
};

export default TempImage;