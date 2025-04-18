import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen } from '@mui/icons-material';
import { Stage, Layer, Rect, Circle, Line, Arrow, Text, Transformer } from 'react-konva';
import useSocketConnection from '../../../hooks/useSocket';

const WorkArea = ({ 
  selectedTool, 
  leftSidebarOpen, 
  rightSidebarOpen, 
  activePage,
  onToolChange,
  onShapeSelect,
  onShapeCreate,
  onShapeUpdate,
  pageShapes = [] // Figuras preexistentes para la página activa
}) => {
  // Estado para todas las formas en el canvas
  const [shapes, setShapes] = useState([]);
  
  const initialShapeProps = {
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    fill: '#00aaff',
  };

  // Estado para depuración
  const [socketStatus, setSocketStatus] = useState('desconectado');

  // Usar el hook de socket para la comunicación
  const { 
    socket, 
    connected, 
    shapeProps, 
    emitUpdate, 
    joinPage, 
    updateFigure, 
    createFigure, 
    deleteFigure 
  } = useSocketConnection(
    'http://localhost:3000',
    'temp',  // ID temporal que será reemplazado por el backend
    initialShapeProps
  );
  //console.log('figuras de la pagina:',pageShapes)
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newShapeProps, setNewShapeProps] = useState(null);
  const [tempShapeIndex, setTempShapeIndex] = useState(0); // Índice para formas temporales en el frontend
  const stageRef = useRef(null);
  const transformerRef = useRef(null);

  const [editingText, setEditingText] = useState(null);
  const [textValue, setTextValue] = useState('');
  const textAreaRef = useRef(null);

  // Calcular dimensiones disponibles
  const leftOffset = leftSidebarOpen ? 60 : 0;
  const rightOffset = rightSidebarOpen ? 250 : 0;

  // Monitorear el estado del socket y unirse a la sala de la página activa
  useEffect(() => {
    if (socket) {
      
      setSocketStatus(connected ? 'conectado' : 'desconectado');
      
      // Cuando el socket esté conectado y haya una página activa, unirse a su sala
      if (connected && activePage) {
        joinPage(activePage.id);
      }
    }
  }, [socket, connected, activePage, joinPage]);

  // Actualizar las figuras cuando cambia la página activa o llegan nuevas figuras del backend
  useEffect(() => {
    if (activePage && Array.isArray(pageShapes)) {
      //console.log('Cargando figuras para la página:', activePage.id, pageShapes);
      
      // Transformar las figuras del backend al formato que espera Konva
      const formattedShapes = pageShapes.map(shape => ({
        ...shape,
        type: shape.tipo || 'rectangle', // Asegurar que cada figura tiene un tipo
        id: shape.id.toString(),
        x: Number(shape.x) || 0,
        y: Number(shape.y) || 0,
        width: Number(shape.width) || 100,
        height: Number(shape.height) || 100,
        radius: Number(shape.radius) || 50,
        fill: shape.fill || '#cccccc',
        stroke: shape.stroke || '#000000',
        strokeWidth: Number(shape.strokeWidth) || 1,
        draggable: true
      }));
      
      setShapes(formattedShapes);
      setSelectedId(null);
      if (onShapeSelect) onShapeSelect(null);
    } else {
      // Si no hay página activa o no hay figuras, limpiar el canvas
      setShapes([]);
      setSelectedId(null);
      if (onShapeSelect) onShapeSelect(null);
    }
  }, [activePage, pageShapes, onShapeSelect]);

  // Sincronizar cambios de la forma principal (vía socket) con el array de formas
  useEffect(() => {
    if (shapeProps && shapeProps.id) {
      console.log('shapeProps actualizado:', shapeProps);
      
      setShapes(prevShapes => {
        // Buscar si ya existe esta forma en el array
        const index = prevShapes.findIndex(s => s.id === shapeProps.id);
        
        if (index >= 0) {
          // Si existe, actualizar sus propiedades
          const updatedShapes = [...prevShapes];
          updatedShapes[index] = { 
            ...prevShapes[index], // Mantener propiedades existentes como 'type'
            ...shapeProps,        // Sobrescribir con nuevas propiedades
            tipo: prevShapes[index].tipo || 'rectangle' // Asegurar que type existe
          };
          return updatedShapes;
        } else {
          // Si no existe, añadirla como nueva
          return [...prevShapes, { ...shapeProps, tipo: 'rectangle' }];
        }
      });
    }
  }, [shapeProps]);

  // Comunicar la forma seleccionada al componente padre
  useEffect(() => {
    if (selectedId && onShapeSelect) {
      onShapeSelect(selectedId);
    }
  }, [selectedId, onShapeSelect]);

  // Actualizar el transformer cuando cambia la selección
  useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne('#' + selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  // Manejar el clic en el escenario
  const handleStageMouseDown = (e) => {
    // Verificar si hay una página activa
    if (!activePage) {
      console.warn('No hay página activa seleccionada');
      return;
    }

    // Obtener la posición del clic
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const x = (point.x - stage.x()) / stage.scaleX();
    const y = (point.y - stage.y()) / stage.scaleY();

    // Si se hace clic en el fondo, deseleccionar todo
    if (e.target === stage) {
      setSelectedId(null);
      if (onShapeSelect) onShapeSelect(null);
      return;
    }

    // Si no estamos usando una herramienta de dibujo, salir
    if (selectedTool === 'select') return;

    // Iniciar el dibujo de una nueva forma
    setIsDrawing(true);
    
    // Generar un ID temporal único solo para la interfaz de usuario
    // Este ID será reemplazado por el ID real del backend cuando se cree la figura
    const tempId = `temp_${tempShapeIndex}`;
    setTempShapeIndex(prevIndex => prevIndex + 1);
    
    let newShape = {
      tempId, // ID temporal para uso en la interfaz
      type: selectedTool,
      x,
      y,
      fill: '#' + Math.floor(Math.random() * 16777215).toString(16), // Color aleatorio
      stroke: '#333',
      strokeWidth: 1,
      paginaId: activePage.id, // Agregar el ID de la página activa
      vistaId: activePage.id   // También incluir vistaId para compatibilidad
    };

    // Propiedades específicas según el tipo de forma
    switch (selectedTool) {
      case 'rectangle':
        newShape = {
          ...newShape,
          width: 0,
          height: 0,
        };
        break;
      case 'circle':
        newShape = {
          ...newShape,
          radius: 0,
        };
        break;
      case 'line':
        newShape = {
          ...newShape,
          points: [0, 0, 0, 0],
        };
        break;
      case 'text':
        newShape = {
          ...newShape,
          text: 'Doble clic para editar',
          fontSize: 18,
          width: 200,
          height: 50,
        };
        
        // Para texto, creamos la forma completa directamente
        const newTextShape = {
          ...newShape,
          tipo: 'text' // Para el backend (sin ID)
        };
        
        // Agregar forma temporal al estado local para visualización
        const tempTextShape = { ...newShape, id: tempId };
        setShapes(prevShapes => [...prevShapes, tempTextShape]);
        setIsDrawing(false);
        setSelectedId(tempId);
        if (onShapeSelect) onShapeSelect(tempId);
        if (onToolChange) onToolChange('select');
        
        // Enviar al backend sin ID (el backend generará uno)
        createFigure(newTextShape);
        if (onShapeCreate) {
          onShapeCreate(newTextShape);
        }
        return;
      default:
        return;
    }

    setNewShapeProps(newShape);
  };

  // Manejar el movimiento del ratón sobre el escenario
  const handleStageMouseMove = (e) => {
    if (!isDrawing || !newShapeProps) return;

    // Obtener la posición actual
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const x = (point.x - stage.x()) / stage.scaleX();
    const y = (point.y - stage.y()) / stage.scaleY();

    // Actualizar la forma según el tipo
    let updatedShape = { ...newShapeProps };

    switch (newShapeProps.type) {
      case 'rectangle':
        updatedShape = {
          ...updatedShape,
          width: x - newShapeProps.x,
          height: y - newShapeProps.y,
        };
        break;
      case 'circle':
        const dx = x - newShapeProps.x;
        const dy = y - newShapeProps.y;
        updatedShape = {
          ...updatedShape,
          radius: Math.sqrt(dx * dx + dy * dy),
        };
        break;
      case 'line':
        updatedShape = {
          ...updatedShape,
          points: [0, 0, x - newShapeProps.x, y - newShapeProps.y],
        };
        break;
      default:
        return;
    }

    setNewShapeProps(updatedShape);
  };

  // Manejar cuando se suelta el ratón
  const handleStageMouseUp = () => {
    if (!isDrawing || !newShapeProps || !activePage) return;

    // Finalizar el dibujo de la forma
    setIsDrawing(false);
    
    // Asegurarse de que la forma tiene dimensiones válidas
    let finalShape = { ...newShapeProps };
    
    // Validar dimensiones según el tipo
    switch (newShapeProps.type) {
      case 'rectangle':
        if (Math.abs(finalShape.width) < 5 || Math.abs(finalShape.height) < 5) {
          // Si es muy pequeño, no crear la forma
          setNewShapeProps(null);
          return;
        }
        
        // Normalizar valores negativos
        if (finalShape.width < 0) {
          finalShape.x += finalShape.width;
          finalShape.width = Math.abs(finalShape.width);
        }
        if (finalShape.height < 0) {
          finalShape.y += finalShape.height;
          finalShape.height = Math.abs(finalShape.height);
        }
        break;
      case 'circle':
        if (finalShape.radius < 5) {
          // Si es muy pequeño, no crear la forma
          setNewShapeProps(null);
          return;
        }
        break;
      case 'line':
        const [x1, y1, x2, y2] = finalShape.points;
        if (Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)) < 5) {
          // Si es muy pequeño, no crear la forma
          setNewShapeProps(null);
          return;
        }
        break;
      default:
        break;
    }
    
    // Agregar IDs de la página a la forma
    finalShape.paginaId = activePage.id;
    finalShape.vistaId = activePage.id;
    
    // Crear el objeto para enviar al backend (sin ID)
    const shapeForBackend = {
      x: finalShape.x,
      y: finalShape.y,
      width: finalShape.width,
      height: finalShape.height,
      radius: finalShape.radius,
      points: finalShape.points,
      fill: finalShape.fill,
      stroke: finalShape.stroke,
      strokeWidth: finalShape.strokeWidth,
      tipo: finalShape.type, // El backend espera 'tipo' en lugar de 'type'
      //paginaId: activePage.id,
      vistaId: activePage.id
    };
    
    // Agregar una forma temporal al arreglo de formas para visualización
    // Esta será reemplazada cuando el backend responda con el ID real
    const tempId = finalShape.tempId;
    const tempShape = { ...finalShape, id: tempId };
    
    setShapes([...shapes, tempShape]);
    setSelectedId(tempId);
    if (onShapeSelect) onShapeSelect(tempId);
    setNewShapeProps(null);

    // Enviar al backend (sin ID) y notificar al componente padre
    createFigure(shapeForBackend);
    if (onShapeCreate) {
      onShapeCreate(shapeForBackend);
    }

    // Cambiar a la herramienta de selección después de crear
    if (onToolChange) {
      onToolChange('select');
    }
  };

  // Manejar transformación de formas
  const handleTransformEnd = (e) => {
    const node = e.target;
    const id = node.id();
    
    // Obtener la nueva posición y escala
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Restablecer la escala
    node.scaleX(1);
    node.scaleY(1);
    
    // Actualizar la forma según su tipo
    const updatedShapes = shapes.map(shape => {
      if (shape.id === id) {
        let updatedShape = {
          ...shape,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
        };
        
        // Propiedades específicas por tipo
        if (shape.type === 'rectangle') {
          updatedShape.width = Math.max(5, node.width() * scaleX);
          updatedShape.height = Math.max(5, node.height() * scaleY);
        } else if (shape.type === 'circle') {
          updatedShape.radius = Math.max(5, shape.radius * Math.max(scaleX, scaleY));
        } else if (shape.type === 'text') {
          updatedShape.fontSize = Math.max(8, shape.fontSize * scaleY);
          updatedShape.width = Math.max(5, node.width() * scaleX);
        }
        
        // Crear objeto para enviar al backend
        const shapeForBackend = {
          id: shape.id, // Aquí sí necesitamos el ID porque estamos actualizando una forma existente
          ...updatedShape,
          tipo: updatedShape.type,
          paginaId: activePage?.id,
          vistaId: activePage?.id
        };
        
        // Enviar al socket y notificar al componente padre
        if (!shape.id.startsWith('temp_')) { // Solo actualizar en el backend si no es temporal
          updateFigure(shapeForBackend, activePage?.id);
          if (onShapeUpdate) {
            onShapeUpdate(shapeForBackend);
          }
        }
        
        return updatedShape;
      }
      return shape;
    });
    
    setShapes(updatedShapes);
  };

  // También mantener el evento dragEnd para actualizar el estado local
  const handleDragEnd = (e) => {
    const id = e.target.id();
    const { x, y } = e.target.position();
    
    // Encontrar la forma completa
    const shape = shapes.find(s => s.id === id);
    if (!shape) return;
    
    // Actualizar la posición en el estado
    const updatedShapes = shapes.map(s => {
      if (s.id === id) {
        const updatedShape = {
          ...s,
          x,
          y,
        };
        
        // Crear objeto para enviar al backend
        const shapeForBackend = {
          id: shape.id,
          figuraId: shape.id,
          x,
          y,
          // Incluir estas propiedades para evitar que se reemplacen por los valores predeterminados
          width: shape.width,
          height: shape.height,
          radius: shape.radius,
          fill: shape.fill,
          type: shape.type,
          tipo: shape.tipo || shape.type,
          pageId: activePage?.id,
          vistaId: activePage?.id
        };
        
        // Solo actualizar en el backend si la forma no es temporal
        if (!shape.id.startsWith('temp_')) {
          // Pasar todas las propiedades relevantes para evitar pérdida de información
          emitUpdate(shapeForBackend);
          
          // Notificar al componente padre
          if (onShapeUpdate) {
            onShapeUpdate(shapeForBackend);
          }
        }
        
        return updatedShape;
      }
      return s;
    });
    
    setShapes(updatedShapes);
  };

  // Función para obtener la forma seleccionada (para pasar al RightSidebar)
  const getSelectedShape = () => {
    return shapes.find(shape => shape.id === selectedId);
  };

  // Manejar cambio de color al hacer clic derecho
  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    const id = e.target.id();
    
    // Cambiar el color a uno aleatorio (simplemente como ejemplo)
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    
    const updatedShapes = shapes.map(shape => {
      if (shape.id === id) {
        const updatedShape = {
          ...shape,
          fill: randomColor,
        };
        
        // Solo actualizar en el backend si la forma no es temporal
        if (!shape.id.startsWith('temp_')) {
          // Crear objeto para enviar al backend
          const shapeForBackend = {
            id: shape.id, // Necesario para actualizar
            ...updatedShape,
            tipo: updatedShape.type,
            paginaId: activePage?.id,
            vistaId: activePage?.id
          };
          
          // Enviar al socket y notificar al componente padre
          updateFigure(shapeForBackend, activePage?.id);
          if (onShapeUpdate) {
            onShapeUpdate(shapeForBackend);
          }
        }
        
        return updatedShape;
      }
      return shape;
    });
    
    setShapes(updatedShapes);
    setSelectedId(id);
    if (onShapeSelect) onShapeSelect(id);
  };

  // Función para actualizar propiedades de una forma (llamada desde RightSidebar)
  const updateShapeProps = (id, newProps) => {
    const updatedShapes = shapes.map(shape => {
      if (shape.id === id) {
        const updatedShape = {
          ...shape,
          ...newProps
        };
        
        // Solo actualizar en el backend si la forma no es temporal
        if (!shape.id.startsWith('temp_')) {
          // Crear objeto para enviar al backend
          const shapeForBackend = {
            id: shape.id, // Necesario para actualizar
            ...updatedShape,
            tipo: updatedShape.type,
            paginaId: activePage?.id,
            vistaId: activePage?.id
          };
          
          // Enviar al socket y notificar al componente padre
          updateFigure(shapeForBackend, activePage?.id);
          if (onShapeUpdate) {
            onShapeUpdate(shapeForBackend);
          }
        }
        
        return updatedShape;
      }
      return shape;
    });
    
    setShapes(updatedShapes);
  };

  // Funciones para el zoom
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // Renderizar las formas
  const renderShape = (shape) => {
    const commonProps = {
      id: shape.id,
      x: shape.x,
      y: shape.y,
      fill: shape.fill,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      rotation: shape.rotation || 0,
      draggable: true,
      onClick: () => {
        setSelectedId(shape.id);
        if (onShapeSelect) onShapeSelect(shape.id);
      },
      onContextMenu: handleContextMenu,
      onDragEnd: handleDragEnd,
      onTransformEnd: handleTransformEnd,
    };

    switch (shape.type) {
      case 'rectangle':
        return (
          <Rect
            key={shape.id}
            {...commonProps}
            width={shape.width}
            height={shape.height}
          />
        );
      case 'circle':
        return (
          <Circle
            key={shape.id}
            {...commonProps}
            radius={shape.radius}
          />
        );
      case 'line':
        return (
          <Line
            key={shape.id}
            {...commonProps}
            points={shape.points}
          />
        );
        case 'text':
          return (
            <Text
            key={shape.id}
            {...commonProps}
            text={shape.text}
            fontSize={shape.fontSize}
            fontFamily="Arial"
            width={shape.width}
            onDblClick={(e) => handleTextDblClick(e, shape)}
          />
          );
      default:
        return null;
    }
  };

  // Renderizar la forma que se está dibujando
  const renderNewShape = () => {
    if (!newShapeProps) return null;

    switch (newShapeProps.type) {
      case 'rectangle':
        return (
          <Rect
            {...newShapeProps}
            stroke="#000"
            strokeWidth={1}
            dash={[5, 5]}
          />
        );
      case 'circle':
        return (
          <Circle
            {...newShapeProps}
            stroke="#000"
            strokeWidth={1}
            dash={[5, 5]}
          />
        );
      case 'line':
        return (
          <Line
            {...newShapeProps}
            stroke="#000"
            strokeWidth={1}
            dash={[5, 5]}
          />
        );
      default:
        return null;
    }
  };

// Escuchar eventos de creación de figuras para actualizar las temporales
useEffect(() => {
  if (!socket) return;
  
  const handleFigureCreated = (newFigure) => {
    console.log('Nueva figura recibida del servidor:', newFigure);
    
    // Verificar que tenemos datos válidos
    if (!newFigure || !newFigure.id) {
      console.error('Figura recibida inválida:', newFigure);
      return;
    }
    
    // Si la página activa no coincide, ignorar
    if (activePage && newFigure.vistaId && newFigure.vistaId !== activePage.id) {
      console.log('Ignorando figura de otra página');
      return;
    }
    
    // Transformar la figura al formato que espera Konva
    const formattedFigure = {
      ...newFigure,
      id: newFigure.id.toString(),
      type: newFigure.tipo || 'rectangle',
      x: Number(newFigure.x) || 0,
      y: Number(newFigure.y) || 0,
      width: Number(newFigure.width) || 100,
      height: Number(newFigure.height) || 100,
      radius: Number(newFigure.radius) || 50,
      fill: newFigure.fill || '#cccccc',
      stroke: newFigure.stroke || '#000000',
      strokeWidth: Number(newFigure.strokeWidth) || 1,
      draggable: true
    };
    
    // Actualizar el estado de las formas
    setShapes(prevShapes => {
      // Buscar forma temporal para reemplazar
      const tempIndex = prevShapes.findIndex(s => s.id.startsWith('temp_'));
      
      if (tempIndex >= 0) {
        // Reemplazar la forma temporal
        const updatedShapes = [...prevShapes];
        updatedShapes[tempIndex] = formattedFigure;
        
        // Actualizar selección si corresponde
        if (selectedId === prevShapes[tempIndex].id) {
          setSelectedId(formattedFigure.id);
        }
        
        return updatedShapes;
      }
      
      // Verificar si la figura ya existe
      const existingIndex = prevShapes.findIndex(s => s.id === formattedFigure.id);
      if (existingIndex >= 0) {
        // Actualizar figura existente
        const updatedShapes = [...prevShapes];
        updatedShapes[existingIndex] = formattedFigure;
        return updatedShapes;
      }
      
      // Agregar nueva figura
      return [...prevShapes, formattedFigure];
    });
  };
  
  socket.on('figureCreated', handleFigureCreated);
  
  return () => {
    socket.off('figureCreated', handleFigureCreated);
  };
}, [socket, activePage, selectedId]);


// Escuchar actualizaciones de figuras
useEffect(() => {
  if (!socket) return;
  
  const handleFigureUpdated = (updatedFigure) => {
    console.log('Actualización de figura recibida:', updatedFigure);
    
    // Verificar que tenemos datos válidos
    if (!updatedFigure || !updatedFigure.id) {
      console.error('Figura actualizada inválida:', updatedFigure);
      return;
    }
    
    // Transformar la figura al formato que espera Konva
    const formattedFigure = {
      ...updatedFigure,
      id: updatedFigure.id.toString(),
      type: updatedFigure.tipo || 'rectangle',
      x: Number(updatedFigure.x) || 0,
      y: Number(updatedFigure.y) || 0,
      width: Number(updatedFigure.width) || 100,
      height: Number(updatedFigure.height) || 100,
      radius: Number(updatedFigure.radius) || 50,
      fill: updatedFigure.fill || '#cccccc',
      stroke: updatedFigure.stroke || '#000000',
      strokeWidth: Number(updatedFigure.strokeWidth) || 1,
      draggable: true
    };
    
    // Actualizar el estado de las formas
    setShapes(prevShapes => {
      return prevShapes.map(shape => 
        shape.id === formattedFigure.id ? formattedFigure : shape
      );
    });
  };
  
  const handleUpdateShape = (data) => {
    console.log('Movimiento de figura recibido:', data);
    if (!data || (!data.id && !data.figuraId)) return;
    
    const figId = data.id || data.figuraId;
    
    setShapes(prevShapes => {
      return prevShapes.map(shape => {
        if (shape.id === figId) {
          return { ...shape, ...data };
        }
        return shape;
      });
    });
  };
  
  socket.on('figureUpdated', handleFigureUpdated);
  socket.on('updateShape', handleUpdateShape);
  
  return () => {
    socket.off('figureUpdated', handleFigureUpdated);
    socket.off('updateShape', handleUpdateShape);
  };
}, [socket]);


// Escuchar eventos WebSocket para actualizaciones
useEffect(() => {
  if (!socket || !activePage) return;
  
  const handleCreation = (newFigure) => {
    console.log('Figura creada recibida por socket:', newFigure);
    // Llamar a getFiguras para actualizar el estado global
    if (onShapeCreate) {
      onShapeCreate(newFigure); // Este callback debería llamar a getFiguras
    }
  };
  
  const handleUpdate = (updatedFigure) => {
    console.log('Figura actualizada recibida por socket:', updatedFigure);
    // Llamar a getFiguras para actualizar el estado global
    if (onShapeUpdate) {
      onShapeUpdate(updatedFigure); // Este callback debería llamar a getFiguras
    }
  };
  
  socket.on('figureCreated', handleCreation);
  socket.on('figureUpdated', handleUpdate);
  
  return () => {
    socket.off('figureCreated', handleCreation);
    socket.off('figureUpdated', handleUpdate);
  };
}, [socket, activePage, onShapeCreate, onShapeUpdate]);




  // Exponer funciones y datos necesarios
  // Esta es la clave para comunicarse con otros componentes
  if (typeof window !== 'undefined') {
    window.canvasAPI = {
      getSelectedShape,
      updateShapeProps,
      shapes
    };
  }


  
  const handleTextDblClick = (e, shape) => {
    // Prevenir acciones por defecto
    e.evt.preventDefault();
    
    // Obtener las posiciones y dimensiones
    const textNode = e.target;
    const stage = textNode.getStage();
    const position = textNode.absolutePosition();
    const stageBox = stage.container().getBoundingClientRect();
    
    // Configurar la posición de la caja de texto
    const areaPosition = {
      x: stageBox.left + position.x * stage.scaleX(),
      y: stageBox.top + position.y * stage.scaleY()
    };
    
    // Guardar datos y activar modo de edición
    setTextValue(shape.text);
    setEditingText({
      id: shape.id,
      position: areaPosition,
      width: textNode.width() * stage.scaleX(),
      height: textNode.height() * stage.scaleY(),
      fontSize: shape.fontSize * stage.scaleY()
    });
    
    // Enfoque en el textarea después de renderizarlo
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, 10);
  };
  
  // Función para guardar el texto editado
  const handleTextEdit = () => {
    if (!editingText) return;
    
    const updatedShapes = shapes.map(shape => {
      if (shape.id === editingText.id) {
        const updatedShape = {
          ...shape,
          text: textValue
        };
        
        // Actualizar en el backend
        if (!shape.id.startsWith('temp_')) {
          const shapeForBackend = {
            id: shape.id,
            ...updatedShape,
            tipo: updatedShape.type,
            vistaId: activePage?.id
          };
          
          updateFigure(shapeForBackend, activePage?.id);
          if (onShapeUpdate) {
            onShapeUpdate(shapeForBackend);
          }
        }
        
        return updatedShape;
      }
      return shape;
    });
    
    setShapes(updatedShapes);
    setEditingText(null);
  };

  // Función para manejar el doble clic en textos
  // const handleTextDblClick = (e) => {
  //   const id = e.target.id();
  //   const textNode = e.target;
    
  //   // Encontrar la forma de texto
  //   const shape = shapes.find(s => s.id === id);
  //   if (!shape || shape.type !== 'text') return;
    
  //   // Activar modo de edición
  //   setEditingText(id);
    
  //   // Usar el texto actual, o un string vacío si es el texto por defecto
  //   const currentText = shape.text === 'Doble clic para editar' ? '' : shape.text;
  //   setTextValue(currentText);
    
  //   // Ocultar temporalmente el nodo de texto original
  //   textNode.visible(false);
  //   stageRef.current.batchDraw();
    
  //   // Crear un textarea HTML para editar
  //   const textarea = document.createElement('textarea');
  //   const stage = stageRef.current;
  //   const container = stage.container();
    
  //   // Posicionar el textarea sobre el texto en el canvas
  //   container.appendChild(textarea);
    
  //   // Calcular la posición y estilo del textarea
  //   const transform = stage.getAbsoluteTransform();
  //   const pos = transform.point({ x: textNode.x(), y: textNode.y() });
    
  //   textarea.value = currentText;
  //   textarea.style.position = 'absolute';
  //   textarea.style.top = `${pos.y}px`;
  //   textarea.style.left = `${pos.x}px`;
  //   textarea.style.width = `${textNode.width() * stage.scaleX()}px`;
  //   textarea.style.height = `${textNode.height() * stage.scaleY()}px`;
  //   textarea.style.fontSize = `${shape.fontSize * stage.scaleY()}px`;
  //   textarea.style.border = '1px solid #999';
  //   textarea.style.padding = '2px';
  //   textarea.style.margin = '0px';
  //   textarea.style.overflow = 'hidden';
  //   textarea.style.background = 'white';
  //   textarea.style.outline = 'none';
  //   textarea.style.resize = 'none';
  //   textarea.style.fontFamily = 'Arial';
  //   textarea.style.lineHeight = '1';
  //   textarea.style.zIndex = '1000';
    
  //   textareaRef.current = textarea;
    
  //   // Enfocar el textarea y seleccionar todo el texto
  //   textarea.focus();
  //   textarea.select();
    
  //   // Manejar cambios en el textarea
  //   textarea.addEventListener('input', () => {
  //     setTextValue(textarea.value);
  //   });
    
  //   // Manejar cuando se completa la edición
  //   const handleOutsideClick = (e) => {
  //     if (e.target !== textarea) {
  //       completeTextEditing();
  //       window.removeEventListener('click', handleOutsideClick);
  //     }
  //   };
    
  //   // Añadir un pequeño retraso para evitar que se active inmediatamente
  //   setTimeout(() => {
  //     window.addEventListener('click', handleOutsideClick);
  //   }, 100);
    
  //   // Manejar tecla Enter y Esc
  //   textarea.addEventListener('keydown', (e) => {
  //     if (e.key === 'Enter' && !e.shiftKey) {
  //       completeTextEditing();
  //       e.preventDefault();
  //     }
  //     if (e.key === 'Escape') {
  //       cancelTextEditing();
  //       e.preventDefault();
  //     }
  //   });
  // };
  
  // // Función mejorada para completar la edición de texto
  // const completeTextEditing = () => {
  //   if (!editingText) return;
    
  //   const newText = textValue || 'Doble clic para editar'; // Usar texto por defecto si está vacío
  //   const id = editingText;
    
  //   // Actualizar el texto en el estado
  //   const updatedShapes = shapes.map(shape => {
  //     if (shape.id === id) {
  //       const updatedShape = {
  //         ...shape,
  //         text: newText,
  //       };
        
  //       // Solo actualizar en el backend si la forma no es temporal
  //       if (!shape.id.startsWith('temp_')) {
  //         // Crear objeto para enviar al backend
  //         const shapeForBackend = {
  //           id: shape.id,
  //           ...updatedShape,
  //           tipo: updatedShape.type,
  //           paginaId: activePage?.id,
  //           vistaId: activePage?.id,
  //           text: newText, // Asegurarse de que el texto se incluye explícitamente
  //         };
          
  //         // Enviar al socket y notificar al componente padre
  //         updateFigure(shapeForBackend, activePage?.id);
  //         if (onShapeUpdate) {
  //           onShapeUpdate(shapeForBackend);
  //         }
  //       }
        
  //       return updatedShape;
  //     }
  //     return shape;
  //   });
    
  //   setShapes(updatedShapes);
    
  //   // Hacer visible de nuevo el nodo de texto
  //   const textNode = stageRef.current.findOne('#' + id);
  //   if (textNode) {
  //     textNode.visible(true);
  //     stageRef.current.batchDraw();
  //   }
    
  //   removeTextarea();
  // };
  
  // // Función para cancelar la edición sin guardar cambios
  // const cancelTextEditing = () => {
  //   if (!editingText) return;
    
  //   // Hacer visible de nuevo el nodo de texto
  //   const textNode = stageRef.current.findOne('#' + editingText);
  //   if (textNode) {
  //     textNode.visible(true);
  //     stageRef.current.batchDraw();
  //   }
    
  //   removeTextarea();
  // };
  
  // // Función para remover el textarea
  // const removeTextarea = () => {
  //   if (textareaRef.current) {
  //     textareaRef.current.parentNode.removeChild(textareaRef.current);
  //     textareaRef.current = null;
  //   }
  //   setEditingText(null);
  //   setTextValue('');
  // };


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
        }),
        height: '100vh' // Utilizar toda la altura de la ventana
      }}
    >
      {/* Controles de zoom integrados en la esquina superior derecha */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 1,
          boxShadow: 1,
          p: 0.5
        }}
      >
        <IconButton size="small" onClick={handleZoomOut}>
          <ZoomOut fontSize="small" />
        </IconButton>

        <Typography variant="body2" sx={{ mx: 1 }}>
          {Math.round(zoom * 100)}%
        </Typography>

        <IconButton size="small" onClick={handleZoomIn}>
          <ZoomIn fontSize="small" />
        </IconButton>

        <IconButton size="small" onClick={handleResetZoom} sx={{ ml: 0.5 }}>
          <FitScreen fontSize="small" />
        </IconButton>
      </Box>

      {/* Indicador de estado del socket */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 20,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          bgcolor: socketStatus === 'conectado' ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)',
          color: 'white',
          borderRadius: 1,
          padding: '2px 8px',
          fontSize: '0.75rem'
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'white',
            mr: 1
          }}
        />
        {socketStatus}
      </Box>

      {/* Área del canvas (ocupando todo el espacio disponible) */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#e0e0e0',
          height: '100%'
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
            height={window.innerHeight} // Usar toda la altura disponible
            scaleX={zoom}
            scaleY={zoom}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
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

              {/* Renderizar todas las formas */}
              {shapes.map(renderShape)}
              
              {/* Renderizar la forma que se está dibujando */}
              {renderNewShape()}

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

          {editingText && (
        <textarea
          ref={textAreaRef}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onBlur={handleTextEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleTextEdit();
            }
          }}
          style={{
            position: 'absolute',
            top: editingText.position.y + 'px',
            left: editingText.position.x + 'px',
            width: editingText.width + 'px',
            height: editingText.height + 'px',
            fontSize: editingText.fontSize + 'px',
            fontFamily: 'Arial',
            padding: '0',
            margin: '0',
            border: '1px solid blue',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            zIndex: 1000,
            background: 'white'
          }}
        />
      )}

        </Box>
      </Box>
    </Box>
  );
};

export default WorkArea;