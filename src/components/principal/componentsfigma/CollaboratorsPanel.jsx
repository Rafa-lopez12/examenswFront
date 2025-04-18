import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, IconButton, Typography } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen } from '@mui/icons-material';
import { Stage, Layer, Rect, Circle, Line, Arrow, Text, Transformer } from 'react-konva';

const WorkArea = ({ selectedTool, leftSidebarOpen, rightSidebarOpen, activePage }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef(null);
  const transformerRef = useRef(null);

  // Calcular dimensiones disponibles
  const leftOffset = leftSidebarOpen ? 60 : 0;
  const rightOffset = rightSidebarOpen ? 250 : 0;

  useEffect(() => {
    // Cargar formas iniciales (simulado)
    if (activePage) {
      setShapes([
        {
          id: 'rect1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          fill: '#f0f0f0',
          stroke: '#333333',
          strokeWidth: 1,
          draggable: true
        },
        {
          id: 'circle1',
          type: 'circle',
          x: 400,
          y: 150,
          radius: 50,
          fill: '#e3f2fd',
          stroke: '#2196f3',
          strokeWidth: 1,
          draggable: true
        },
        {
          id: 'text1',
          type: 'text',
          x: 100,
          y: 250,
          text: 'Texto de ejemplo',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#333333',
          draggable: true
        }
      ]);
    }
  }, [activePage]);

  useEffect(() => {
    // Si hay un elemento seleccionado, actualizar transformer
    if (selectedId) {
      const selectedNode = stageRef.current.findOne('#' + selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  const handleStageClick = (e) => {
    // Deseleccionar si se hace clic en el escenario
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const handleShapeClick = (id) => {
    setSelectedId(id);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleTransformEnd = (id) => {
    // Actualizar el estado de la forma después de la transformación
    const node = stageRef.current.findOne('#' + id);
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Actualizar las dimensiones basadas en la escala
    setShapes(
      shapes.map((shape) => {
        if (shape.id === id) {
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            // Actualizar dimensiones según el tipo de forma
            ...(shape.type === 'rectangle' && {
              width: shape.width * scaleX,
              height: shape.height * scaleY
            }),
            ...(shape.type === 'circle' && {
              radius: shape.radius * Math.max(scaleX, scaleY)
            }),
            ...(shape.type === 'text' && {
              fontSize: shape.fontSize * scaleY
            }),
            rotation: node.rotation(),
            scaleX: 1,
            scaleY: 1
          };
        }
        return shape;
      })
    );
  };

  const handleDragEnd = (id, e) => {
    setIsDragging(false);
    // Actualizar la posición de la forma después de arrastrar
    setShapes(
      shapes.map((shape) => {
        if (shape.id === id) {
          return {
            ...shape,
            x: e.target.x(),
            y: e.target.y()
          };
        }
        return shape;
      })
    );
  };

  const renderShape = (shape) => {
    const shapeProps = {
      id: shape.id,
      x: shape.x,
      y: shape.y,
      fill: shape.fill,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      draggable: true,
      onClick: () => handleShapeClick(shape.id),
      onDragStart: () => setIsDragging(true),
      onDragEnd: (e) => handleDragEnd(shape.id, e),
      onTransformEnd: () => handleTransformEnd(shape.id)
    };

    switch (shape.type) {
      case 'rectangle':
        return (
          <Rect
            key={shape.id}
            {...shapeProps}
            width={shape.width}
            height={shape.height}
          />
        );
      case 'circle':
        return (
          <Circle
            key={shape.id}
            {...shapeProps}
            radius={shape.radius}
          />
        );
      case 'text':
        return (
          <Text
            key={shape.id}
            {...shapeProps}
            text={shape.text}
            fontSize={shape.fontSize}
            fontFamily={shape.fontFamily}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        position: 'relative',
        ml: `${leftOffset}px`,
        mr: `${rightOffset}px`,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        transition: (theme) => theme.transitions.create(['margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        })
      }}
    >
      {/* Información de la página */}
      <Box
        sx={{
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="subtitle2">
          {activePage ? activePage.name : 'Sin página seleccionada'}
        </Typography>

        {/* Controles de zoom */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" onClick={handleZoomOut}>
            <ZoomOut fontSize="small" />
          </IconButton>

          <Typography variant="body2" sx={{ mx: 1 }}>
            {Math.round(zoom * 100)}%
          </Typography>

          <IconButton size="small" onClick={handleZoomIn}>
            <ZoomIn fontSize="small" />
          </IconButton>

          <IconButton size="small" onClick={handleResetZoom} sx={{ ml: 1 }}>
            <FitScreen fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Área del canvas */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          backgroundColor: '#e0e0e0'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Stage
            ref={stageRef}
            width={window.innerWidth - leftOffset - rightOffset}
            height={window.innerHeight - 120}
            scaleX={zoom}
            scaleY={zoom}
            onClick={handleStageClick}
          >
            <Layer>
              {/* Fondo de la página */}
              <Rect
                x={0}
                y={0}
                width={1200}
                height={800}
                fill="#ffffff"
                shadowColor="rgba(0,0,0,0.2)"
                shadowBlur={10}
                shadowOffsetX={0}
                shadowOffsetY={0}
                cornerRadius={2}
              />

              {/* Elementos del canvas */}
              {shapes.map(renderShape)}

              {/* Transformador para elementos seleccionados */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Límite para que el ancho/alto no sea menor a 5px
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        </Box>
      </Box>
    </Box>
  );
};

export default WorkArea;