import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  FileDownload as FileDownloadIcon,
  Smartphone as SmartphoneIcon
} from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';  // Asegúrate de tener instalado: npm install jszip --save

// Componente para la pestaña de código
const CodeTab = ({ code, language, filename }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Box sx={{ position: 'relative', mt: 2 }}>
      <Paper variant="outlined" sx={{ position: 'relative' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 1,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="body2" fontFamily="monospace">
            {filename}
          </Typography>
          <Box>
            <Tooltip title={copied ? "¡Copiado!" : "Copiar código"}>
              <IconButton size="small" onClick={handleCopyCode}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Descargar archivo">
              <IconButton size="small" onClick={handleDownloadCode}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
          <SyntaxHighlighter
            language={language || "dart"}
            style={vs2015}
            customStyle={{ margin: 0, borderRadius: 0 }}
          >
            {code}
          </SyntaxHighlighter>
        </Box>
      </Paper>
    </Box>
  );
};

// Componente para mostrar un archivo Flutter Dart
const DartFileAccordion = ({ item, itemType }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandChange = () => {
    setExpanded(!expanded);
  };

  // Determinar el nombre del archivo según el tipo
  const getFileName = () => {
    const baseName = item.name;
    switch (itemType) {
      case 'screen':
        return `${baseName}.dart`;
      case 'widget':
        return `${baseName}.dart`;
      case 'model':
        return `${baseName}.dart`;
      case 'service':
        return `${baseName}.dart`;
      default:
        return `${baseName}.dart`;
    }
  };

  // Determinar el título según el tipo
  const getTitle = () => {
    switch (itemType) {
      case 'screen':
        return `${item.name} Screen`;
      case 'widget':
        return `${item.name} Widget`;
      case 'model':
        return `${item.name} Model`;
      case 'service':
        return `${item.name} Service`;
      default:
        return item.name;
    }
  };

  const getCode = () => {
    return itemType === 'widget' ? item.dartCode : item.code;
  };
  
  return (
    <Accordion 
      expanded={expanded}
      onChange={handleExpandChange}
      sx={{ 
        mb: 2, 
        '&:before': { display: 'none' },
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '4px!important',
        overflow: 'hidden'
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ 
          bgcolor: expanded ? 'primary.light' : 'background.paper',
          color: expanded ? 'primary.contrastText' : 'text.primary',
          '&:hover': {
            bgcolor: expanded ? 'primary.main' : 'action.hover',
          }
        }}
      >
        <Typography variant="subtitle1">
          {getTitle()}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          {getCode() ? (
            <CodeTab 
              code={getCode()} 
              language="dart" 
              filename={getFileName()} 
            />
          ) : (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              No hay código disponible para este archivo.
            </Typography>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

// Componente principal del modal de resultados
const CodeResultsModal = ({ open, onClose, codeResults, loading }) => {
  const [activeComponent, setActiveComponent] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Reset states when modal opens
    if (open) {
      setActiveComponent(0);
      setActiveTab(0);
    }
  }, [open]);

  if (!codeResults || codeResults.length === 0) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Código Flutter Generado</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" height="300px">
            {loading ? (
              <Box textAlign="center">
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Generando código Flutter...</Typography>
              </Box>
            ) : (
              <Typography>No hay resultados para mostrar</Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Si hay resultados, mostrarlos
  const result = codeResults[activeComponent];
  if (!result || !result.result || !result.result.data) {
    return null;
  }

  const { 
    screens = [], 
    widgets = [], 
    models = [], 
    services = [], 
    mainApp = null 
  } = result.result.data;
  
  const handleExportAll = () => {
    try {
      const zip = new JSZip();
      const libFolder = zip.folder('lib');
      
      // VERSIÓN SIMPLE: Solo necesitamos el main.dart mejorado
      if (result.result.data?.navigationFiles) {
        const navFiles = result.result.data.navigationFiles.files;
        
        // Solo usar el main.dart que ya incluye todo
        if (navFiles.mainApp) {
          libFolder.file('main.dart', navFiles.mainApp);
        } else if (mainApp && mainApp.code) {
          libFolder.file('main.dart', mainApp.code);
        }
        
        // OPCIONAL: Agregar archivo de rutas separado si existe
        if (navFiles.simpleRoutes) {
          const utilsFolder = libFolder.folder('utils');
          utilsFolder.file('routes.dart', navFiles.simpleRoutes);
        }
      } else {
        // Si no hay navegación, usar main.dart original
        if (mainApp && mainApp.code) {
          libFolder.file('main.dart', mainApp.code);
        }
      }
      
      // Añadir screens con navegación automática
      if (screens.length > 0) {
        const screensFolder = libFolder.folder('screens');
        screens.forEach(screen => {
          // Modificar cada screen para incluir navegación simple
          const enhancedScreenCode = addSimpleNavigationToScreen(screen.code, screen.name);
          screensFolder.file(`${screen.name}.dart`, enhancedScreenCode);
        });
      }
      
      // Añadir widgets, models, services normalmente
      if (widgets.length > 0) {
        const widgetsFolder = libFolder.folder('widgets');
        widgets.forEach(widget => {
          widgetsFolder.file(`${widget.name}.dart`, widget.dartCode || '');
        });
      }
      
      if (models.length > 0) {
        const modelsFolder = libFolder.folder('models');
        models.forEach(model => {
          modelsFolder.file(`${model.name}.dart`, model.code);
        });
      }
      
      if (services.length > 0) {
        const servicesFolder = libFolder.folder('services');
        services.forEach(service => {
          servicesFolder.file(`${service.name}.dart`, service.code);
        });
      }
      
      // Pubspec.yaml simplificado
      const packageName = result.pageInfo.name.toLowerCase().replace(/\s+/g, '_');
      const pubspecYaml = `
  name: ${packageName}
  description: Flutter project with simple navigation
  version: 1.0.0+1
  
  environment:
    sdk: ">=2.17.0 <3.0.0"
  
  dependencies:
    flutter:
      sdk: flutter
    cupertino_icons: ^1.0.5
  
  dev_dependencies:
    flutter_test:
      sdk: flutter
    flutter_lints: ^2.0.1
  
  flutter:
    uses-material-design: true
  `;
      
      zip.file('pubspec.yaml', pubspecYaml);
      
      // README simplificado
      const hasNavigation = result.result.data?.navigationFiles;
      const readmeContent = `# ${result.pageInfo.name} - Flutter Project
  
  ## Navegación Simple
  
  ${hasNavigation ? `
  Esta aplicación incluye navegación automática entre pantallas.
  
  ### Cómo navegar:
  
  \`\`\`dart
  // Ir a otra pantalla
  AppNavigation.goTo(context, AppNavigation.nombrePantalla);
  
  // Reemplazar pantalla actual
  AppNavigation.goToReplace(context, AppNavigation.otraPantalla);
  
  // Volver atrás
  AppNavigation.goBack(context);
  \`\`\`
  
  ### Pantallas disponibles:
  ${screens.map(screen => `- ${screen.name}`).join('\n')}
  
  ### Drawer automático:
  Todas las pantallas incluyen un menú lateral con navegación automática a todas las otras pantallas.
  
  ` : `
  Esta aplicación no incluye navegación automática. 
  Puedes agregar navegación manualmente usando Navigator.pushNamed().
  `}
  
  ## Instalación
  
  1. \`flutter pub get\`
  2. \`flutter run\`
  
  ## Estructura
  
  - \`lib/main.dart\` - Aplicación principal con rutas
  - \`lib/screens/\` - Pantallas de la aplicación
  - \`lib/widgets/\` - Widgets reutilizables
  - \`lib/models/\` - Modelos de datos
  - \`lib/services/\` - Servicios
  
  ${hasNavigation ? '## Nota: La navegación está integrada directamente en main.dart para simplicidad.' : ''}
  `;
      
      zip.file('README.md', readmeContent);
      
      // Generar y descargar el ZIP
      zip.generateAsync({type: "blob"}).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        const fileName = hasNavigation 
          ? `${result.pageInfo.name.replace(/\s+/g, '-')}-flutter-simple-navigation.zip`
          : `${result.pageInfo.name.replace(/\s+/g, '-')}-flutter-project.zip`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('No se pudo crear el archivo ZIP.');
    }
  };
  
  // Función helper para agregar navegación simple a screens existentes
  function addSimpleNavigationToScreen(originalCode, screenName) {
    // Si el código ya tiene AppDrawer, no modificar
    if (originalCode.includes('AppDrawer') || originalCode.includes('drawer:')) {
      return originalCode;
    }
    
    // Buscar el Scaffold y agregar drawer
    const scaffoldRegex = /Scaffold\s*\(/;
    if (scaffoldRegex.test(originalCode)) {
      return originalCode.replace(
        scaffoldRegex,
        'Scaffold(\n      drawer: const AppDrawer(), // Navegación automática\n      '
      );
    }
    
    return originalCode;
  }

  // Renderizado condicional según la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Main App
        return mainApp ? (
          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom>
              Main App
            </Typography>
            <CodeTab 
              code={mainApp.code} 
              language="dart" 
              filename="main.dart" 
            />
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No se ha generado el archivo main.dart.
          </Typography>
        );
      
      case 1: // Screens
        return screens.length > 0 ? (
          screens.map((screen, index) => (
            <DartFileAccordion 
              key={`screen-${index}`}
              item={screen} 
              itemType="screen" 
            />
          ))
        ) : (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No hay pantallas disponibles.
          </Typography>
        );
      
      case 2: // Widgets
        return widgets.length > 0 ? (
          widgets.map((widget, index) => (
            <DartFileAccordion 
              key={`widget-${index}`}
              item={widget} 
              itemType="widget" 
            />
          ))
        ) : (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No hay widgets disponibles.
          </Typography>
        );
      
      case 3: // Models
        return models.length > 0 ? (
          models.map((model, index) => (
            <DartFileAccordion 
              key={`model-${index}`}
              item={model} 
              itemType="model" 
            />
          ))
        ) : (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No hay modelos disponibles.
          </Typography>
        );
      
      case 4: // Services
        return services.length > 0 ? (
          services.map((service, index) => (
            <DartFileAccordion 
              key={`service-${index}`}
              item={service} 
              itemType="service" 
            />
          ))
        ) : (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No hay servicios disponibles.
          </Typography>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <SmartphoneIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Código Flutter Generado: {result.pageInfo.name}
              {result.result.data?.navigationFiles && (
                <Chip 
                  label="Con navegación" 
                  color="success" 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Selector de componentes si hay más de uno */}
        {codeResults.length > 1 && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Seleccionar página:
            </Typography>
            <Tabs 
              value={activeComponent}
              onChange={(e, newValue) => {
                setActiveComponent(newValue);
                setActiveTab(0); // Reset tab cuando cambia el componente
              }}
              variant="scrollable"
              scrollButtons="auto"
            >
              {codeResults.map((res, index) => (
                <Tab key={index} label={res.pageInfo.name} />
              ))}
            </Tabs>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        {/* Pestañas para diferentes tipos de archivos */}
        <Box>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Main App" />
            <Tab label="Pantallas" />
            <Tab label="Widgets" />
            <Tab label="Modelos" />
            <Tab label="Servicios" />
          </Tabs>
          <Divider />
          
          {/* Contenido según pestaña seleccionada */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {renderTabContent()}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportAll}
          disabled={loading}
        >
          Exportar Proyecto Flutter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CodeResultsModal;