// src/components/figma/CodeResultsModal.jsx
import React, { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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

// Componente principal del modal de resultados
const CodeResultsModal = ({ open, onClose, codeResults, loading }) => {
  const [activeComponent, setActiveComponent] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

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

  const { components, services, modules } = result.result.data;
  
  // Determinar qué código mostrar según la pestaña activa
  let codeContent = null;

  if (activeTab === 0 && components && components.length > 0) {
    const component = components[0];
    codeContent = (
      <>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="TypeScript" />
          <Tab label="HTML" />
          <Tab label="CSS" />
        </Tabs>
        <Box sx={{ p: 1 }}>
          {activeTab === 0 && (
            <CodeTab 
              code={component.typescript} 
              language="typescript" 
              filename={`${component.name}.component.ts`} 
            />
          )}
          {activeTab === 1 && (
            <CodeTab 
              code={component.html} 
              language="html" 
              filename={`${component.name}.component.html`} 
            />
          )}
          {activeTab === 2 && (
            <CodeTab 
              code={component.css} 
              language="css" 
              filename={`${component.name}.component.scss`} 
            />
          )}
        </Box>
      </>
    );
  } else if (activeTab === 1 && services && services.length > 0) {
    codeContent = (
      <Box sx={{ p: 1 }}>
        <CodeTab 
          code={services[0].code} 
          language="typescript" 
          filename={`${services[0].name}.service.ts`} 
        />
      </Box>
    );
  } else if (activeTab === 2 && modules && modules.length > 0) {
    codeContent = (
      <Box sx={{ p: 1 }}>
        <CodeTab 
          code={modules[0].code} 
          language="typescript" 
          filename={`${modules[0].name}.module.ts`} 
        />
      </Box>
    );
  } else {
    codeContent = (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography>No hay código disponible para esta sección</Typography>
      </Box>
    );
  }

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
            codeContent
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          Exportar Todos
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CodeResultsModal;