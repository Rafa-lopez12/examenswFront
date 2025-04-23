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
  AccordionDetails
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  FileDownload as FileDownloadIcon
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
            language={language}
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

// Componente para mostrar un componente Angular (TS, HTML, CSS)
const ComponentAccordion = ({ component, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleExpandChange = () => {
    setExpanded(!expanded);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
          {component.name} Component
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="component tabs"
            variant="fullWidth"
          >
            <Tab label="TypeScript" />
            <Tab label="HTML" />
            <Tab label="CSS" />
          </Tabs>
        </Box>
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          {activeTab === 0 && (
            component.typescript ? (
              <CodeTab 
                code={component.typescript} 
                language="typescript" 
                filename={`${component.name}.component.ts`} 
              />
            ) : (
              <Typography color="text.secondary" sx={{ p: 2 }}>
                No hay código TypeScript disponible para este componente.
              </Typography>
            )
          )}
          {activeTab === 1 && (
            component.html ? (
              <CodeTab 
                code={component.html} 
                language="html" 
                filename={`${component.name}.component.html`} 
              />
            ) : (
              <Typography color="text.secondary" sx={{ p: 2 }}>
                No hay código HTML disponible para este componente.
              </Typography>
            )
          )}
          {activeTab === 2 && (
            component.css ? (
              <CodeTab 
                code={component.css} 
                language="css" 
                filename={`${component.name}.component.scss`} 
              />
            ) : (
              <Typography color="text.secondary" sx={{ p: 2 }}>
                No hay estilos CSS disponibles para este componente.
              </Typography>
            )
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
            <Typography variant="h6">Código Generado</Typography>
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
                <Typography sx={{ mt: 2 }}>Generando código...</Typography>
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

  const { components = [], services = [], modules = [] } = result.result.data;
  
  const handleExportAll = () => {
    try {
      // Crear un archivo ZIP con todos los archivos
      const zip = new JSZip();
      
      // Añadir componentes
      components.forEach(component => {
        const componentFolder = zip.folder(component.name);
        if (component.typescript) {
          componentFolder.file(`${component.name}.component.ts`, component.typescript);
        }
        if (component.html) {
          componentFolder.file(`${component.name}.component.html`, component.html);
        }
        if (component.css) {
          componentFolder.file(`${component.name}.component.scss`, component.css);
        }
      });
      
      // Añadir servicios
      if (services.length > 0) {
        const servicesFolder = zip.folder('services');
        services.forEach(service => {
          servicesFolder.file(`${service.name}.service.ts`, service.code);
        });
      }
      
      // Añadir módulos
      if (modules.length > 0) {
        const modulesFolder = zip.folder('modules');
        modules.forEach(module => {
          modulesFolder.file(`${module.name}.module.ts`, module.code);
        });
      }
      
      // Generar y descargar el ZIP
      zip.generateAsync({type: "blob"}).then(function(content) {
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${result.pageInfo.name.replace(/\s+/g, '-')}-angular-code.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (error) {
      console.error('Error al exportar todos los archivos:', error);
      
      // Fallback: Exportar cada archivo individualmente
      alert('No se pudo crear el archivo ZIP. Intente descargar los archivos individualmente.');
    }
  };

  // Renderizado condicional según la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Componentes
        return components.length > 0 ? (
          components.map((component, index) => (
            <ComponentAccordion 
              key={`component-${index}`}
              component={component} 
              index={index} 
            />
          ))
        ) : (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No hay componentes disponibles.
          </Typography>
        );
      
      case 1: // Servicios
        return services.length > 0 ? (
          services.map((service, index) => (
            <Box key={`service-${index}`} mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                {service.name} Service
              </Typography>
              <CodeTab 
                code={service.code} 
                language="typescript" 
                filename={`${service.name}.service.ts`} 
              />
            </Box>
          ))
        ) : (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No hay servicios disponibles.
          </Typography>
        );
      
      case 2: // Módulos
        return modules.length > 0 ? (
          modules.map((module, index) => (
            <Box key={`module-${index}`} mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                {module.name} Module
              </Typography>
              <CodeTab 
                code={module.code} 
                language="typescript" 
                filename={`${module.name}.module.ts`} 
              />
            </Box>
          ))
        ) : (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No hay módulos disponibles.
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
            <CodeIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Código Generado: {result.pageInfo.name}
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
          >
            <Tab label="Componentes" />
            <Tab label="Servicios" />
            <Tab label="Módulos" />
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
          Exportar Todos
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CodeResultsModal;