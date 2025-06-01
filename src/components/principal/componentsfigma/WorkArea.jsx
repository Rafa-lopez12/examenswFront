import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Typography, Menu, MenuItem, ListItemIcon, ListItemText,Paper, CircularProgress, Alert } from '@mui/material';
import { 
  ZoomIn, 
  ZoomOut, 
  FitScreen, 
  Delete as DeleteIcon, 
  ContentCopy as DuplicateIcon
} from '@mui/icons-material';
import { Stage, Layer, Rect, Circle, Line, Arrow, Text, Transformer } from 'react-konva';
import useSocketConnection from '../../../hooks/useSocket';
import { useFigura } from '../../../context/FiguraContext';
import ImageUploadDialog from './ImageUploadDialog';
import useImage from 'use-image';
import TempImage from './TempImage';
import { generateUIFromImage } from '../../../api/img';
import PromptUIDialog from './PromptUIDialog';
import { generateUIFromPrompt } from '../../../api/img';

const WorkArea = ({ 
  selectedTool, 
  leftSidebarOpen, 
  rightSidebarOpen, 
  activePage,
  onToolChange,
  onShapeSelect,
  onShapeCreate,
  onShapeUpdate,
  onShapeDelete,
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

  // Usar el context de figura para manejar eliminaciones en el contexto global
  const { eliminarFiguraLocalmente } = useFigura();

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

  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newShapeProps, setNewShapeProps] = useState(null);
  const [tempShapeIndex, setTempShapeIndex] = useState(0); // Índice para formas temporales en el frontend
  const stageRef = useRef(null);
  const transformerRef = useRef(null);

  const [promptDialogOpen, setPromptDialogOpen] = useState(false);

  const [stageSize, setStageSize] = useState({ width: 1200, height: 800 });
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [editingText, setEditingText] = useState(null);
  const [textValue, setTextValue] = useState('');
  const textAreaRef = useRef(null);

  // Estado para el menú contextual
  const [contextMenu, setContextMenu] = useState(null);

const [processingImage, setProcessingImage] = useState(false);
const [imageProcessingStatus, setImageProcessingStatus] = useState(null);

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

  useEffect(() => {
    if (selectedTool === 'image') {
      setImageUploadOpen(true);
    }
  }, [selectedTool]);

  useEffect(() => {
    if (selectedTool === 'ai-prompt') {
      setPromptDialogOpen(true);
    }
  }, [selectedTool]);


  useEffect(() => {
    const updateStageSize = () => {
      const leftOffset = leftSidebarOpen ? 60 : 0;
      const rightOffset = rightSidebarOpen ? 250 : 0;
      
      // Calcular el área disponible EXACTA del viewport
      const availableWidth = window.innerWidth - leftOffset - rightOffset - 40;
      const availableHeight = window.innerHeight - 48 - 40; // 48px del header, 40px de padding
      
      // NO usar Math.max, usar el área disponible real
      const width = Math.max(800, availableWidth); // Mínimo razonable
      const height = Math.max(600, availableHeight); // Mínimo razonable
      
      setStageSize({ width, height });
      console.log('Nuevo tamaño del stage:', { width, height });
    };
  
    updateStageSize();
    window.addEventListener('resize', updateStageSize);
    
    return () => window.removeEventListener('resize', updateStageSize);
  }, [leftSidebarOpen, rightSidebarOpen]);

  // Actualizar las figuras cuando cambia la página activa o llegan nuevas figuras del backend
  useEffect(() => {
    if (activePage && Array.isArray(pageShapes)) {
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


  useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne('#' + selectedId);
      if (!selectedNode) return;
      
      const selectedShape = shapes.find(s => s.id === selectedId);
      if (!selectedShape) return;
      
      // Configurar el transformer según el tipo de forma
      if (selectedShape.type === 'line') {
        // Para líneas, habilitar solo ciertos controles
        transformerRef.current.enabledAnchors([
          'middle-right', // Solo permitir estirar horizontalmente
          'bottom-center', // Solo permitir estirar verticalmente
          'bottom-right'   // Permitir estirar en diagonal
        ]);
        transformerRef.current.rotateEnabled(true);
        transformerRef.current.keepRatio(false);
      } else {
        // Para otras formas, usar configuración normal
        transformerRef.current.enabledAnchors([
          'top-left', 'top-center', 'top-right',
          'middle-left', 'middle-right',
          'bottom-left', 'bottom-center', 'bottom-right'
        ]);
        transformerRef.current.rotateEnabled(true);
        transformerRef.current.keepRatio(false);
      }
      
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId, shapes]);



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



  // Función para eliminar una figura seleccionada
  const handleDeleteSelectedShape = () => {
    if (!selectedId || !activePage) return;
    
    const shapeToDelete = shapes.find(shape => shape.id === selectedId);
    if (!shapeToDelete) return;
    
    try {

      if (shapeToDelete.type === 'tempImage') {
        // Eliminar imagen temporal
        setShapes(prevShapes => prevShapes.filter(shape => shape.id !== selectedId));
        setSelectedId(null);
        if (onShapeSelect) onShapeSelect(null);
        
        console.log('Imagen temporal eliminada:', selectedId);
        return true;
      }
      // Si no es una figura temporal, eliminarla en el backend
      if (!shapeToDelete.id.startsWith('temp_')) {
        deleteFigure(shapeToDelete.id, activePage.id);
        
        // Actualizar el estado global a través del context
        eliminarFiguraLocalmente(shapeToDelete.id);
        
        // Notificar al componente padre
        if (onShapeDelete) {
          onShapeDelete(shapeToDelete.id);
        }
      }
      
      // Eliminar la figura del estado local
      setShapes(prevShapes => prevShapes.filter(shape => shape.id !== selectedId));
      
      // Limpiar la selección
      setSelectedId(null);
      if (onShapeSelect) onShapeSelect(null);
      
      // Cerrar el menú contextual si está abierto
      if (contextMenu) {
        setContextMenu(null);
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar figura:', error);
      return false;
    }
  };

  // Manejar teclas para eliminar figuras
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Eliminar con la tecla Supr o Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        handleDeleteSelectedShape();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedId, activePage]);

  // Manejar el clic en el escenario
  const handleStageMouseDown = (e) => {
    // Verificar si hay una página activa
    if (!activePage) {
      console.warn('No hay página activa seleccionada');
      return;
    }

    // Cerrar el menú contextual si está abierto
    if (contextMenu) {
      setContextMenu(null);
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

    if (selectedTool === 'image') {
      setImageUploadOpen(true);
      return; // Salir para evitar crear otras formas
    }

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
            stroke: '#333333',
            strokeWidth: 3, 
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
        // const [x1, y1, x2, y2] = finalShape.points;
        // if (Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)) < 5) {
        //   // Si es muy pequeño, no crear la forma
        //   setNewShapeProps(null);
        //   return;
        // }
        if (finalShape.type === 'line') {
          // Verificar que la línea tiene una longitud mínima
          const [x1, y1, x2, y2] = finalShape.points;
          const length = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
          
          if (length < 5) {
            // Si la línea es muy corta, cancelar la creación
            setNewShapeProps(null);
            setIsDrawing(false);
            return;
          }
          
          // Asegurarse de que la línea tiene todos los atributos necesarios
          finalShape.stroke = finalShape.stroke || '#333333';
          finalShape.strokeWidth = finalShape.strokeWidth || 3;
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
      vistaId: activePage.id
    };
    
    // Agregar una forma temporal al arreglo de formas para visualización
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
    
    // Encontrar la forma
    const shape = shapes.find(s => s.id === id);
    if (!shape) return;
    
    // Caso especial para imágenes temporales
    if (shape.type === 'tempImage') {
      const updatedShape = {
        ...shape,
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      };
      
      setShapes(prevShapes => 
        prevShapes.map(s => 
          s.id === shape.id ? updatedShape : s
        )
      );
      
      console.log('Dimensiones de imagen temporal actualizadas:', {
        id: shape.id,
        width: updatedShape.width,
        height: updatedShape.height
      });
      
      return; // Salir para no ejecutar el resto
    }
    
    // Para otros tipos de formas
    const updatedShapes = shapes.map(s => {
      if (s.id === id) {
        let updatedShape = {
          ...s,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
        };
        
        // Propiedades específicas por tipo
        if (s.type === 'rectangle') {
          updatedShape.width = Math.max(5, node.width() * scaleX);
          updatedShape.height = Math.max(5, node.height() * scaleY);
        } else if (s.type === 'circle') {
          updatedShape.radius = Math.max(5, s.radius * Math.max(scaleX, scaleY));
        } else if (s.type === 'text') {
          updatedShape.fontSize = Math.max(8, s.fontSize * scaleY);
          updatedShape.width = Math.max(5, node.width() * scaleX);
        } else if (s.type === 'line' && s.points && s.points.length >= 4) {
          let pts = [...s.points];
          if (!pts || pts.length < 4) {
            pts = [0, 0, 50, 50];
          }
          const newEndX = pts[2] * scaleX;
          const newEndY = pts[3] * scaleY;
          updatedShape.points = [0, 0, newEndX, newEndY];
        }
        
        // Crear objeto para enviar al backend
        const shapeForBackend = {
          id: s.id,
          ...updatedShape,
          tipo: updatedShape.type,
          paginaId: activePage?.id,
          vistaId: activePage?.id
        };
        
        // Enviar al socket y notificar al componente padre
        if (!s.id.startsWith('temp_')) {
          updateFigure(shapeForBackend, activePage?.id);
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

  // También mantener el evento dragEnd para actualizar el estado local
  const handleDragEnd = (e) => {
    const id = e.target.id();
    const { x, y } = e.target.position();
    
    // Encontrar la forma completa
    const shape = shapes.find(s => s.id === id);
    if (!shape) return;
    
    // Caso especial para imágenes temporales
    if (shape.type === 'tempImage') {
      // Solo actualizar posición local para imágenes temporales
      setShapes(prevShapes => 
        prevShapes.map(s => 
          s.id === id ? { ...s, x, y } : s
        )
      );
      console.log('Posición de imagen temporal actualizada:', { id, x, y });
      return; // Salir para no ejecutar el resto
    }
    
    // Actualizar la posición en el estado para otros tipos
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
          points: shape.points,
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

  // Manejar clic derecho para abrir menú contextual
  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    const id = e.target.id();
    setSelectedId(id);
    if (onShapeSelect) onShapeSelect(id);
    
    // Obtener la posición del clic
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    // Abrir el menú contextual
    setContextMenu({
      x: pointerPosition.x,
      y: pointerPosition.y,
      id
    });
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

  // Escuchar eventos de eliminación de figuras
  useEffect(() => {
    if (!socket) return;
    
    const handleFigureDeleted = (data) => {
      console.log('Eliminación de figura recibida:', data);
      if (!data || !data.id) return;
      
      // Actualizar el estado de las formas (eliminar la figura)
      setShapes(prevShapes => prevShapes.filter(shape => shape.id !== data.id));
      
      // Si la figura eliminada era la seleccionada, limpiar la selección
      if (selectedId === data.id) {
        setSelectedId(null);
        if (onShapeSelect) onShapeSelect(null);
      }
    };
    
    socket.on('figureDeleted', handleFigureDeleted);
    
    return () => {
      socket.off('figureDeleted', handleFigureDeleted);
    };
  }, [socket, selectedId, onShapeSelect]);

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
    
    const handleDelete = (deletedFigure) => {
      console.log('Figura eliminada recibida por socket:', deletedFigure);
      // Actualizar el estado global
      if (onShapeDelete) {
        onShapeDelete(deletedFigure.id); // Este callback debería llamar a eliminarFiguraLocalmente
      }
    };
    
    socket.on('figureCreated', handleCreation);
    socket.on('figureUpdated', handleUpdate);
    socket.on('figureDeleted', handleDelete);
    
    return () => {
      socket.off('figureCreated', handleCreation);
      socket.off('figureUpdated', handleUpdate);
      socket.off('figureDeleted', handleDelete);
    };
  }, [socket, activePage, onShapeCreate, onShapeUpdate, onShapeDelete]);

  // Función para manejar el texto editable
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

  // Escuchar teclas para eliminar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingText) return; // No procesar teclas si estamos editando texto
      
      // Tecla Delete o Backspace para eliminar
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        handleDeleteSelectedShape();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, handleDeleteSelectedShape, editingText]);

  // Función mejorada para capturar el lienzo
  const captureCanvas = () => {
    if (!stageRef.current || !activePage) return { success: false };
    
    // Ocultar temporalmente los controles de transformación
    const transformer = transformerRef.current;
    const transformerVisible = transformer ? transformer.isVisible() : false;
    if (transformer) transformer.visible(false);
    
    // Ocultar resaltado de selección si hay algún elemento seleccionado
    const selectedShape = selectedId ? stageRef.current.findOne('#' + selectedId) : null;
    let originalStroke, originalStrokeWidth;
    
    if (selectedShape) {
      originalStroke = selectedShape.stroke();
      originalStrokeWidth = selectedShape.strokeWidth();
      selectedShape.stroke('rgba(0,0,0,0.2)');
      selectedShape.strokeWidth(1);
    }
    
    // Forzar redibujado
    stageRef.current.batchDraw();
    
    try {
      // Generar imagen como URL de datos
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 2, // Mayor calidad
        mimeType: 'image/png'
      });
      
      // Obtener información de la página para asociarla con la captura
      const pageInfo = {
        id: activePage.id,
        name: activePage.nombre || activePage.name || `Página ${activePage.id}`,
        timestamp: new Date().toISOString()
      };
      
      // Devolver tanto el dataURL como la información de la página
      return {
        success: true,
        dataURL,
        pageInfo,
        // Para compatibilidad con la función anterior
        download: () => {
          const link = document.createElement('a');
          link.download = `canvas-${pageInfo.name}-${pageInfo.timestamp.slice(0, 10)}.png`;
          link.href = dataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      };
    } catch (error) {
      console.error('Error al capturar el canvas:', error);
      return { success: false, error };
    } finally {
      // Restaurar controles y selección
      if (transformer) transformer.visible(transformerVisible);
      if (selectedShape) {
        selectedShape.stroke(originalStroke);
        selectedShape.strokeWidth(originalStrokeWidth);
      }
      // Forzar redibujado de nuevo
      stageRef.current.batchDraw();
    }
  };


  const handlePromptSubmit = async (prompt, options = {}) => {
    if (!activePage) {
      console.log('No hay página activa seleccionada');
      setImageProcessingStatus({
        type: 'error',
        message: 'No hay página activa seleccionada. Selecciona una página primero.'
      });
      return;
    }
    
    try {
      // Mostrar indicador de carga
      setProcessingImage(true);
      setImageProcessingStatus({
        type: 'info',
        message: `Generando interfaz ${options.style || 'moderna'} con esquema ${options.colorScheme || 'por defecto'}... esto puede tomar unos momentos`
      });
      
      // Enviar el prompt al backend para procesamiento con IA
      const response = await generateUIFromPrompt(prompt, activePage.id, options);
      
      // Si el procesamiento fue exitoso
      if (response.data && response.data.success) {
        setImageProcessingStatus({
          type: 'success',
          message: `Se han creado ${response.data.figuresCount || 'varias'} figuras con estilo ${options.style || 'moderno'}`
        });
        
        // Actualizar las figuras en el canvas
        if (activePage) {
          getFiguras(activePage.id);
        }
        
        // Volver a la herramienta de selección
        if (onToolChange) onToolChange('select');
      } else {
        throw new Error('Error al procesar el prompt: ' + (response.data?.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error procesando el prompt:', error);
      setImageProcessingStatus({
        type: 'error',
        message: 'Error al procesar el prompt. Inténtalo con una descripción diferente o ajusta las opciones de personalización.'
      });
    } finally {
      setProcessingImage(false);
      
      // Limpiar el mensaje después de unos segundos
      setTimeout(() => {
        setImageProcessingStatus(null);
      }, 5000);
    }
  };

  // Exponer funciones y datos necesarios


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
          // Modificación para líneas
          return (
            <Line
              key={shape.id}
              points={shape.points}
              x={shape.x}
              y={shape.y}
              stroke={shape.stroke || '#000000'}
              strokeWidth={shape.strokeWidth || 2}
              draggable={true}
              onClick={() => {
                setSelectedId(shape.id);
                if (onShapeSelect) onShapeSelect(shape.id);
              }}
              onContextMenu={handleContextMenu}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
              id={shape.id}
              hitStrokeWidth={20}
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

        case 'tempImage':
          return (
            <TempImage
              key={shape.id}
              imageData={shape}
              isSelected={selectedId === shape.id}
              onSelect={() => {
                setSelectedId(shape.id);
                if (onShapeSelect) onShapeSelect(shape.id);
              }}
              onContextMenu={handleContextMenu}
            />
          );
      default:
        return null;
    }
  };

  useEffect(() => {
    console.log('Estado de formas actualizado:', shapes);
    
    // Verificar si hay imágenes temporales
    const tempImages = shapes.filter(shape => shape.type === 'tempImage');
    if (tempImages.length > 0) {
      console.log('Imágenes temporales en el estado:', tempImages);
    }
  }, [shapes]);

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
              x={newShapeProps.x}
              y={newShapeProps.y}
              points={newShapeProps.points || [0, 0, 0, 0]}
              stroke={newShapeProps.stroke || '#000000'}
              strokeWidth={newShapeProps.strokeWidth || 2}
              dash={[5, 5]}
            />
          );
      default:
        return null;
    }
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

  if (typeof window !== 'undefined') {
    window.canvasAPI = {
      getSelectedShape,
      updateShapeProps,
      shapes,
      captureCanvas,
      deleteSelectedShape: handleDeleteSelectedShape
    };
  }


  const handleImageUpload = async (dataUrl) => {
    if (!activePage) {
      console.log('No hay página activa seleccionada');
      setImageProcessingStatus({
        type: 'error',
        message: 'No hay página activa seleccionada. Selecciona una página primero.'
      });
      return;
    }
    
    try {
      // Mostrar indicador de carga
      setProcessingImage(true);
      setImageProcessingStatus({
        type: 'info',
        message: 'Analizando imagen con IA... esto puede tomar unos momentos'
      });
      
      // Enviar la imagen al backend para procesamiento con IA
      const response = await generateUIFromImage(
        dataUrl, 
        activePage.id,
        `Interpretar dibujo de interfaz para la página ${activePage.nombre || 'sin nombre'}`
      );
      
      // Si el procesamiento fue exitoso
      if (response.data && response.data.success) {
        setImageProcessingStatus({
          type: 'success',
          message: `Se han creado ${response.data.figuresCount || 'varias'} figuras a partir de la imagen`
        });
        
        // Actualizar las figuras en el canvas
        if (activePage) {
          getFiguras(activePage.id);
        }
        
        // Volver a la herramienta de selección
        if (onToolChange) onToolChange('select');
      } else {
        throw new Error('Error al procesar la imagen: ' + (response.data?.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error procesando la imagen:', error);
      setImageProcessingStatus({
        type: 'error',
        message: 'Error al procesar la imagen. Inténtalo con otra imagen o más tarde.'
      });
    } finally {
      setProcessingImage(false);
      
      // Limpiar el mensaje después de unos segundos
      setTimeout(() => {
        setImageProcessingStatus(null);
      }, 5000);
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
            width={stageSize.width}
            height={stageSize.height}
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
                width={stageSize.width}
                height={stageSize.height}
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

          {processingImage && (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      flexDirection: 'column'
    }}
  >
    <Paper
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400
      }}
    >
      <CircularProgress size={60} sx={{ mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Procesando Imagen
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary">
        La IA está analizando la imagen y creando figuras...
      </Typography>
    </Paper>
  </Box>
)}

{imageProcessingStatus && (
  <Box
    sx={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999
    }}
  >
    <Alert
      severity={imageProcessingStatus.type}
      onClose={() => setImageProcessingStatus(null)}
      sx={{ minWidth: '300px', boxShadow: 3 }}
    >
      {imageProcessingStatus.message}
    </Alert>
  </Box>
)}


          {/* Textarea para edición de texto */}
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

      {/* Menú contextual */}
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.y, left: contextMenu.x }
            : undefined
        }
      >
        <MenuItem onClick={handleDeleteSelectedShape}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          // Implementar duplicación de figura
          if (!selectedId || !activePage) return;
          
          const shapeToDuplicate = shapes.find(shape => shape.id === selectedId);
          if (!shapeToDuplicate) return;
          
          // Crear una copia con un offset
          const newShape = {
            ...shapeToDuplicate,
            tempId: `temp_${tempShapeIndex}`,
            x: shapeToDuplicate.x + 20,
            y: shapeToDuplicate.y + 20,
            id: undefined // Eliminar el ID para que el backend genere uno nuevo
          };
          
          setTempShapeIndex(prev => prev + 1);
          
          // Crear figura en el backend
          const shapeForBackend = {
            ...newShape,
            tipo: newShape.type,
            vistaId: activePage.id
          };
          
          delete shapeForBackend.id; // Asegurar que no tenga ID
          
          createFigure(shapeForBackend);
          if (onShapeCreate) {
            onShapeCreate(shapeForBackend);
          }
          
          setContextMenu(null);
        }}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicar</ListItemText>
        </MenuItem>
      </Menu>

      <ImageUploadDialog
        open={imageUploadOpen}
        onClose={() => setImageUploadOpen(false)}
        onImageUpload={handleImageUpload}
        onToolChange={onToolChange}
      />
      <PromptUIDialog
        open={promptDialogOpen}
        onClose={() => setPromptDialogOpen(false)}
        onPromptSubmit={handlePromptSubmit}
        onToolChange={onToolChange}
      />
    </Box>
  );
};

export default WorkArea;