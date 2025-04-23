import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, useTheme, Snackbar, Alert, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import CanvasTopBar from './componentsfigma/CanvasTopBar';
import LeftSidebar from './componentsfigma/LeftSidevar';
import RightSidebar from './componentsfigma/RightSidevar';
import WorkArea from './componentsfigma/WorkArea';
import PagesPanel from './componentsfigma/PagesPanel';
import { useVista } from '../../context/VistaContext';
import { useFigura } from '../../context/FiguraContext';
import CapturesPreview from './componentsfigma/CaptureCanvasPreview';
import { generateCodeFromScreenshot, base64ToBlob } from '../../api/img';
import CodeResultsModal from './componentsfigma/CodeResultsModal';

const Canvas = () => {
  const theme = useTheme();
  const location = useLocation();
  const [projectId, setProjectId] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  // Paneles laterales
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [pagesPanelOpen, setPagesPanelOpen] = useState(false);
  
  // Herramienta seleccionada
  const [selectedTool, setSelectedTool] = useState('select');
  
  // Gestión de páginas
  const { vista: pages, getVistas, crearVista } = useVista();
  const [activePage, setActivePage] = useState(null);
  
  // Gestión de figuras - Simplificar para usar solo getFiguras
  const { figura, getFiguras, actualizarFigurasLocalmente } = useFigura();
  
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [pageShapes, setPageShapes] = useState([]);
  const [loadingShapes, setLoadingShapes] = useState(false);

  const [captures, setCaptures] = useState([]);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);

  const [codeResults, setCodeResults] = useState([]);
  const [codeResultsModalOpen, setCodeResultsModalOpen] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Extraer el ID del proyecto de la URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('projectId');
    if (id) {
      setProjectId(id);
      getVistas(id);
    }
  }, [location, getVistas]);

  // Actualizar la página activa cuando cambian las páginas
  useEffect(() => {
    if (pages && pages.length > 0) {
      // Si no hay página activa o la página activa ya no existe, seleccionar la primera
      if (!activePage || !pages.find(p => p.id === activePage.id)) {
        setActivePage(pages[0]);
        console.log('Página activa establecida:', pages[0]);
        showNotification(`Página activa: ${pages[0].nombre || pages[0].name}`, 'info');
      }else{
        
      }
    } else {
      setActivePage(null);
      
    }
  }, [pages]);
 
  // Cargar figuras cuando cambia la página activa
  useEffect(() => {
    if (activePage) {
      setLoadingShapes(true);
      //console.log(`Cargando figuras para la página ${activePage.id}`);
      
      // Obtener las figuras de la página actual
      getFiguras(activePage.id)
        .then(() => {
          //console.log(`Figuras cargadas para la página ${activePage.id}`);
          setLoadingShapes(false);
        })
        .catch(error => {
          //console.error(`Error al cargar figuras para la página ${activePage.id}:`, error);
          setLoadingShapes(false);
          showNotification('Error al cargar las figuras', 'error');
        });
    } else {
      // Si no hay página activa, limpiar las figuras
      setPageShapes([]);
    }
  }, [activePage, getFiguras]);

  // Actualizar las figuras cuando se modifica el estado global
  // useEffect(() => {
  //   if (activePage && figura) {
  //     // Filtrar las figuras que pertenecen a la página activa
  //     const shapesBelongingToPage = figura.filter(fig => 
  //       // fig.paginaId === activePage.id || 
  //       // Number(fig.paginaId) === Number(activePage.id) ||
  //       fig.vistaId === activePage.id || 
  //       Number(fig.vistaId) === Number(activePage.id)
  //     );
      
  //     console.log(`Figuras actualizadas para la página ${activePage.id}:`, shapesBelongingToPage);
  //     setPageShapes(shapesBelongingToPage);
  //   }else{
  //     setPppppp('errrrooooooorrrrr')
  //   }
    
  // }, [figura, activePage]);
  // Cargar datos del proyecto
  useEffect(() => {
    if (projectId) {
      setLoading(true);
      
      // Simulación o llamada real para obtener detalles del proyecto
      setTimeout(() => {
        try {
          setProject({
            id: projectId,
            nombre: 'Proyecto de Diseño de App'
          });
          setError(null);
        } catch (err) {
          //console.error('Error loading project:', err);
          setError('No se pudo cargar el proyecto');
        } finally {
          setLoading(false);
        }
      }, 500);
    }
  }, [projectId]);

  // Función para mostrar notificaciones
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Manejo de cambio de herramienta
  const handleToolChange = (tool) => {
    setSelectedTool(tool);
  };

  // Manejo de paneles laterales
  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  const togglePagesPanel = () => {
    setPagesPanelOpen(!pagesPanelOpen);
  };

  // Manejo de páginas
  const handlePageChange = (pageId) => {
    const selectedPage = pages.find(page => page.id === pageId);
    
    if (selectedPage) {
      setActivePage(selectedPage);
      //console.log('Cambiado a página:', selectedPage);
      showNotification(`Página activa: ${selectedPage.nombre || selectedPage.name}`, 'success');
      
      // Al cambiar de página, limpiar la selección actual
      setSelectedShapeId(null);
    }
  };

  const handleAddPage = () => {
    const newPage = {
      nombre: `Nueva página ${pages.length + 1}`,
      proyectoId: projectId
    };
    
    crearVista(newPage);
    showNotification('Nueva página creada', 'success');
  };
  
  // Gestión de figuras - Callbacks que serán manejados por WorkArea con su socket
  const handleShapeSelect = (id) => {
    setSelectedShapeId(id);
  };

  // Estos métodos ahora son simples pasarelas, ya que el WorkArea maneja 
  // la comunicación con el servidor a través de su propio socket
  const handleShapeCreate = (shapeData) => {
    try {
     // console.log('Creando nueva figura:', shapeData);
      
      // Solo actualizamos el estado local y notificamos al usuario
      showNotification('Figura creada correctamente', 'success');
      
      // Cargar las figuras actualizadas después de crear una nueva
      if (activePage) {
        setTimeout(() => {
          getFiguras(activePage.id);
          //actualizarFigurasLocalmente(shapeData, 'agregar')
        }, 300); // Un pequeño retraso para asegurar que la BD se actualice primero
      }
    } catch (error) {
      //console.error('Error al crear figura:', error);
      showNotification('Error al crear la figura', 'error');
    }
  };

  const handleShapeUpdate = (shapeData) => {
    try {
      //console.log('Actualizando figura:', shapeData);
      
      // Cargar las figuras actualizadas después de editar
      if (activePage) {
        setTimeout(() => {
          getFiguras(activePage.id);
          //actualizarFigurasLocalmente(shapeData, 'actualizar')
        }, 300); // Un pequeño retraso para asegurar que la BD se actualice primero
      }
    } catch (error) {
      //console.error('Error al actualizar figura:', error);
      showNotification('Error al actualizar la figura', 'error');
    }
  };

  const handleShapeDelete = (id) => {
    try {
      //console.log('Eliminando figura:', id);
      // La eliminación real se maneja en WorkArea con su socket
      showNotification('Figura eliminada correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar figura:', error);
      showNotification('Error al eliminar la figura', 'error');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</Box>;
  }

  if (error) {
    return <Box sx={{ padding: 3, color: 'error.main' }}>{error}</Box>;
  }



const handleCaptureCanvas = () => {
  if (window.canvasAPI && typeof window.canvasAPI.captureCanvas === 'function') {
    const result = window.canvasAPI.captureCanvas();
    
    if (result && result.success) {
      // Agregar la nueva captura al estado
      const newCapture = {
        id: `capture-${Date.now()}`,
        dataURL: result.dataURL,
        pageInfo: result.pageInfo
      };
      
      setCaptures(prevCaptures => [...prevCaptures, newCapture]);
      showNotification(`Captura de "${result.pageInfo.name}" guardada`, 'success');
      
      // Opcionalmente mostrar el modal con las capturas
      if (captures.length === 0) {
        setCaptureModalOpen(true);
      }
    } else {
      showNotification('No se pudo capturar el lienzo', 'error');
    }
  } else {
    console.log('window.canvasAPI:', window.canvasAPI);
    console.log('typeof window.canvasAPI.captureCanvas:', typeof window.canvasAPI?.captureCanvas);
    showNotification('Función de captura no disponible', 'error');
  }
};

const prepareCapturesToSend = () => {
  // Aquí construimos la estructura de datos que enviaremos al backend
  const captureData = captures.map(capture => ({
    vistaId: capture.pageInfo.id,
    nombre: capture.pageInfo.name,
    timestamp: capture.pageInfo.timestamp,
    imageData: capture.dataURL.split(',')[1], // Eliminamos el prefijo "data:image/png;base64,"
  }));
  
  console.log('Datos preparados para enviar al backend:', captureData);
  return captureData;
};

// Actualización de la función handleSendCaptures en Canvas.jsx

const handleSendCaptures = async () => {
  try {
    setGeneratingCode(true);
    setCodeResultsModalOpen(true);
    showNotification('Enviando capturas para generar código...', 'info');
    
    const results = [];
    
    // Procesar cada captura
    for (const capture of captures) {
      try {
        // Extraer la parte de datos de la URL de datos
        let imageData;
        
        if (capture.dataURL.startsWith('data:image')) {
          // Si ya es una URL de datos completa, extraer solo la parte base64
          imageData = capture.dataURL;
        } else {
          console.error('Formato de captura inválido:', capture.dataURL.substring(0, 30) + '...');
          throw new Error('Formato de captura inválido');
        }
        
        // Convertir a Blob usando nuestra función mejorada
        const imageBlob = await base64ToBlob(imageData);
        
        console.log('Enviando imagen:', {
          tipo: 'Blob',
          tamaño: imageBlob.size,
          tipo_mime: imageBlob.type
        });
        
        // Enviar al backend - asegurándonos que es un blob válido
        const response = await generateCodeFromScreenshot(
          imageBlob,
          capture.pageInfo.name,
          `Página del proyecto ${project?.nombre || 'sin nombre'}`
        );
        
        if (!response.data) {
          throw new Error('Respuesta inválida del servidor');
        }
        
        results.push({
          pageInfo: capture.pageInfo,
          result: response.data
        });
        
        showNotification(`Código generado para "${capture.pageInfo.name}"`, 'success');
      } catch (error) {
        console.error(`Error al procesar captura ${capture.pageInfo.name}:`, error);
        results.push({
          pageInfo: capture.pageInfo,
          result: {
            success: false,
            message: error.response?.data?.message || 'Error al generar código',
            error: error.message
          }
        });
        showNotification(`Error al generar código para "${capture.pageInfo.name}"`, 'error');
      }
    }
    
    setCodeResults(results);
    
    const successCount = results.filter(r => r.result?.success).length;
    showNotification(
      `Se generó código para ${successCount} de ${captures.length} capturas`, 
      successCount === captures.length ? 'success' : 'warning'
    );
    
  } catch (error) {
    console.error('Error general al enviar capturas:', error);
    
    let errorMessage = 'Error al generar código';
    if (error.response) {
      errorMessage = `Error ${error.response.status}: ${error.response.data.message || 'Error desconocido'}`;
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con el servidor';
    }
    
    showNotification(errorMessage, 'error');
  } finally {
    setGeneratingCode(false);
  }
};

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
    // Generar imagen como URL de datos con una calidad adecuada
    const dataURL = stageRef.current.toDataURL({
      pixelRatio: 2, // Mayor calidad
      mimeType: 'image/png'
    });
    
    // Validar que la URL de datos es correcta
    if (!dataURL.startsWith('data:image/png;base64,')) {
      throw new Error('Formato de imagen incorrecto');
    }
    
    // Verificar que la imagen no esté vacía
    if (dataURL.length < 100) {
      throw new Error('La captura está vacía o es inválida');
    }
    
    // Obtener información de la página para asociarla con la captura
    const pageInfo = {
      id: activePage.id,
      name: activePage.nombre || activePage.name || `Página ${activePage.id}`,
      timestamp: new Date().toISOString()
    };
    
    console.log(`Captura realizada. Tamaño: ${Math.round(dataURL.length / 1024)}KB`);
    
    // Devolver tanto el dataURL como la información de la página
    return {
      success: true,
      dataURL,
      pageInfo,
      download: () => {
        const link = document.createElement('a');
        link.download = `canvas-${pageInfo.name}-${Date.now()}.png`;
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

// Actualiza window.canvasAPI para exponer esta nueva función mejorada
if (typeof window !== 'undefined') {
  window.canvasAPI = {
    captureCanvas
  };
}

const handleRemoveCapture = (captureId) => {
  setCaptures(prevCaptures => prevCaptures.filter(capture => capture.id !== captureId));
};

// Función para limpiar todas las capturas
const handleClearCaptures = () => {
  setCaptures([]);
  setCaptureModalOpen(false);
};

const handleShowCapturesModal = () => {
  setCaptureModalOpen(true);
};

const handleCloseCodeResultsModal = () => {
  setCodeResultsModalOpen(false);
};


  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      overflow: 'hidden',
      bgcolor: theme.palette.background.default
    }}>
      <CssBaseline />
      
      {/* Barra superior */}
      <CanvasTopBar 
      projectName={project?.nombre || 'Proyecto sin nombre'}
      onToggleLeftSidebar={toggleLeftSidebar}
      onToggleRightSidebar={toggleRightSidebar}
      onTogglePages={togglePagesPanel}
      onCaptureCanvas={handleCaptureCanvas}
      onShowCapturesModal={handleShowCapturesModal}
      capturesCount={captures.length}
    />
      
      {/* Área principal con sidebars */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Sidebar izquierdo - Herramientas */}
        <LeftSidebar 
          open={leftSidebarOpen} 
          selectedTool={selectedTool}
          onToolChange={handleToolChange}
        />
        
        {/* Área de trabajo principal */}
        <WorkArea 
          selectedTool={selectedTool}
          leftSidebarOpen={leftSidebarOpen}
          rightSidebarOpen={rightSidebarOpen}
          activePage={activePage}
          onToolChange={handleToolChange}
          onShapeSelect={handleShapeSelect}
          onShapeCreate={handleShapeCreate}
          onShapeUpdate={handleShapeUpdate}
          pageShapes={figura} // Pasar las figuras de la página actual

        />
        
        {/* Sidebar derecho - Propiedades */}
        <RightSidebar 
          open={rightSidebarOpen}
          selectedShapeId={selectedShapeId}
          onShapeUpdate={handleShapeUpdate} // Para actualizar desde el panel de propiedades
        />
      </Box>
      
      {/* Panel de páginas (flotante) */}
      <PagesPanel 
        open={pagesPanelOpen}
        onClose={() => setPagesPanelOpen(false)}
        pages={pages}
        activePage={activePage}
        onPageChange={handlePageChange}
        onAddPage={handleAddPage}
      />
      
      {/* Indicador de carga de figuras */}
      {loadingShapes && (
        <Box 
          sx={{
            position: 'absolute',
            bottom: 70,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'background.paper',
            px: 2,
            py: 1,
            borderRadius: 1,
            boxShadow: 1,
            zIndex: 9999
          }}
        >
          <Typography variant="body2">Cargando figuras...</Typography>
        </Box>
      )}

    <CapturesPreview
      open={captureModalOpen}
      onClose={() => setCaptureModalOpen(false)}
      captures={captures}
      onRemoveCapture={handleRemoveCapture}
      onClearAll={handleClearCaptures}
      onSendCaptures={handleSendCaptures}
      onCaptureCurrentPage={handleCaptureCanvas}
    />
      
      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      <CodeResultsModal
        open={codeResultsModalOpen}
        onClose={handleCloseCodeResultsModal}
        codeResults={codeResults}
        loading={generatingCode}
      />
    </Box>
    
  );
};

export default Canvas;






