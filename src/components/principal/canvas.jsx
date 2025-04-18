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
    </Box>
  );
};

export default Canvas;






