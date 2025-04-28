import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  Divider,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Button
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Brush as BrushIcon,
  FormatColorFill as FillIcon,
  LineWeight as LineWeightIcon,
  BorderStyle as BorderStyleIcon,
  TextFields as TextFieldsIcon,
  AspectRatio as DimensionsIcon,
  Close as CloseIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const drawerWidth = 250;

const RightSidebar = ({ open, selectedShapeId }) => {
  const [expanded, setExpanded] = useState('dimensions');
  
  // Estado local para propiedades
  const [selectedShape, setSelectedShape] = useState(null);
  const [fillColor, setFillColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#333333');
  const [lineWidth, setLineWidth] = useState(1);
  const [opacity, setOpacity] = useState(100);

  // Obtener la forma seleccionada usando la API global del canvas
  useEffect(() => {
    const getShape = () => {
      if (!selectedShapeId || !window.canvasAPI) return null;
      
      const shape = window.canvasAPI.getSelectedShape ? 
        window.canvasAPI.getSelectedShape() : null;
      
      return shape;
    };

    const shape = getShape();
    if (shape) {
      setSelectedShape(shape);
      setFillColor(shape.fill || '#ffffff');
      setStrokeColor(shape.stroke || '#333333');
      setLineWidth(shape.strokeWidth || 1);
      setOpacity(100); // Default, ya que no tenemos esta propiedad
    } else {
      setSelectedShape(null);
    }
  }, [selectedShapeId]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Handlers para cambios de propiedades
  const handleFillColorChange = (e) => {
    const newColor = e.target.value;
    setFillColor(newColor);
    
    // Actualizar la forma
    if (window.canvasAPI && window.canvasAPI.updateShapeProps && selectedShape) {
      window.canvasAPI.updateShapeProps(selectedShape.id, { fill: newColor });
    }
  };

  const handleStrokeColorChange = (e) => {
    const newColor = e.target.value;
    setStrokeColor(newColor);
    
    // Actualizar la forma
    if (window.canvasAPI && window.canvasAPI.updateShapeProps && selectedShape) {
      window.canvasAPI.updateShapeProps(selectedShape.id, { stroke: newColor });
    }
  };

  const handleLineWidthChange = (e, value) => {
    setLineWidth(value);
    
    // Actualizar la forma
    if (window.canvasAPI && window.canvasAPI.updateShapeProps && selectedShape) {
      window.canvasAPI.updateShapeProps(selectedShape.id, { strokeWidth: value });
    }
  };

  const handleOpacityChange = (e, value) => {
    setOpacity(value);
    // En un entorno real, aquí aplicaríamos la opacidad a la forma
  };

  // Manejar cambios de dimensiones
  const handleDimensionChange = (property, value) => {
    if (window.canvasAPI && window.canvasAPI.updateShapeProps && selectedShape) {
      const update = { [property]: Number(value) };
      window.canvasAPI.updateShapeProps(selectedShape.id, update);
      
      // También actualizamos el estado local
      setSelectedShape({
        ...selectedShape,
        ...update
      });
    }
  };

  // Si no hay forma seleccionada, mostrar mensaje
  if (!selectedShape) {
    return (
      <Drawer
        variant="persistent"
        anchor="right"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: '48px',
            height: 'calc(100% - 48px)',
            borderLeft: '1px solid',
            borderColor: 'divider',
            backgroundColor: (theme) => theme.palette.background.paper,
            p: 2
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Propiedades
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '80%'
        }}>
          <Typography variant="body2" color="text.secondary">
            Selecciona una figura para editar sus propiedades
          </Typography>
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '48px', // Altura del AppBar
          height: 'calc(100% - 48px)',
          borderLeft: '1px solid',
          borderColor: 'divider',
          backgroundColor: (theme) => theme.palette.background.paper,
          p: 2
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div">
          Propiedades
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {selectedShape.type} - {selectedShape.id}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Panel de dimensiones */}
      <Accordion 
        expanded={expanded === 'dimensions'} 
        onChange={handleAccordionChange('dimensions')}
        elevation={0}
        disableGutters
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            backgroundColor: (theme) => theme.palette.background.paper,
            p: 0,
            minHeight: 40,
            '& .MuiAccordionSummary-content': { my: 0 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DimensionsIcon sx={{ mr: 1, fontSize: '1.2rem' }} color="action" />
            <Typography variant="subtitle2">Dimensiones y posición</Typography>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ pt: 1, pb: 2, px: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField 
                fullWidth 
                label="X" 
                size="small" 
                type="number" 
                InputProps={{ inputProps: { min: 0 } }}
                value={Math.round(selectedShape.x)}
                onChange={(e) => handleDimensionChange('x', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth 
                label="Y" 
                size="small" 
                type="number" 
                InputProps={{ inputProps: { min: 0 } }}
                value={Math.round(selectedShape.y)}
                onChange={(e) => handleDimensionChange('y', e.target.value)}
              />
            </Grid>
            
            {selectedShape.type === 'rectangle' && (
              <>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Ancho" 
                    size="small" 
                    type="number" 
                    InputProps={{ inputProps: { min: 5 } }}
                    value={Math.round(selectedShape.width)}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Alto" 
                    size="small" 
                    type="number" 
                    InputProps={{ inputProps: { min: 5 } }}
                    value={Math.round(selectedShape.height)}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                  />
                </Grid>
              </>
            )}
            
            {selectedShape.type === 'circle' && (
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Radio" 
                  size="small" 
                  type="number" 
                  InputProps={{ inputProps: { min: 5 } }}
                  value={Math.round(selectedShape.radius)}
                  onChange={(e) => handleDimensionChange('radius', e.target.value)}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControlLabel 
                control={<Switch size="small" />} 
                label="Mantener proporción" 
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Panel de estilos */}
      <Accordion 
        expanded={expanded === 'appearance'} 
        onChange={handleAccordionChange('appearance')}
        elevation={0}
        disableGutters
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            backgroundColor: (theme) => theme.palette.background.paper,
            p: 0,
            minHeight: 40,
            '& .MuiAccordionSummary-content': { my: 0 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BrushIcon sx={{ mr: 1, fontSize: '1.2rem' }} color="action" />
            <Typography variant="subtitle2">Apariencia</Typography>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ pt: 1, pb: 2, px: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FillIcon sx={{ mr: 1, fontSize: '1rem' }} color="action" />
                <Typography variant="body2">Relleno</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    backgroundColor: fillColor,
                    border: '1px solid',
                    borderColor: 'divider',
                    mr: 1,
                    borderRadius: 1
                  }} 
                />
                <TextField 
                  size="small" 
                  value={fillColor}
                  onChange={handleFillColorChange}
                  sx={{ width: 120 }}
                />
                <input 
                  type="color" 
                  value={fillColor}
                  onChange={handleFillColorChange}
                  style={{ marginLeft: 8 }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BorderStyleIcon sx={{ mr: 1, fontSize: '1rem' }} color="action" />
                <Typography variant="body2">Borde</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    backgroundColor: strokeColor,
                    border: '1px solid',
                    borderColor: 'divider',
                    mr: 1,
                    borderRadius: 1
                  }} 
                />
                <TextField 
                  size="small" 
                  value={strokeColor}
                  onChange={handleStrokeColorChange}
                  sx={{ width: 120 }}
                />
                <input 
                  type="color" 
                  value={strokeColor}
                  onChange={handleStrokeColorChange}
                  style={{ marginLeft: 8 }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LineWeightIcon sx={{ mr: 1, fontSize: '1rem' }} color="action" />
                <Typography variant="body2">Grosor de línea: {lineWidth}px</Typography>
              </Box>
              <Slider
                value={lineWidth}
                onChange={handleLineWidthChange}
                min={0}
                max={10}
                step={0.5}
                valueLabelDisplay="auto"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Opacidad: {opacity}%</Typography>
              </Box>
              <Slider
                value={opacity}
                onChange={handleOpacityChange}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Panel de texto (solo visible para elementos de texto) */}
      {selectedShape.type === 'text' && (
        <Accordion 
          expanded={expanded === 'text'} 
          onChange={handleAccordionChange('text')}
          elevation={0}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              backgroundColor: (theme) => theme.palette.background.paper,
              p: 0,
              minHeight: 40,
              '& .MuiAccordionSummary-content': { my: 0 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextFieldsIcon sx={{ mr: 1, fontSize: '1.2rem' }} color="action" />
              <Typography variant="subtitle2">Texto</Typography>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails sx={{ pt: 1, pb: 2, px: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Texto"
                  value={selectedShape.text || ""}
                  onChange={(e) => {
                    if (window.canvasAPI && window.canvasAPI.updateShapeProps) {
                      window.canvasAPI.updateShapeProps(selectedShape.id, { text: e.target.value });
                    }
                  }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fuente</InputLabel>
                  <Select
                    value="Arial"
                    label="Fuente"
                    onChange={(e) => {
                      if (window.canvasAPI && window.canvasAPI.updateShapeProps) {
                        window.canvasAPI.updateShapeProps(selectedShape.id, { fontFamily: e.target.value });
                      }
                    }}
                  >
                    <MenuItem value="Arial">Arial</MenuItem>
                    <MenuItem value="Roboto">Roboto</MenuItem>
                    <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                    <MenuItem value="Helvetica">Helvetica</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6}>
                <TextField 
                  fullWidth 
                  label="Tamaño" 
                  size="small" 
                  type="number" 
                  InputProps={{ inputProps: { min: 8, max: 72 } }}
                  value={selectedShape.fontSize || 16}
                  onChange={(e) => {
                    if (window.canvasAPI && window.canvasAPI.updateShapeProps) {
                      window.canvasAPI.updateShapeProps(selectedShape.id, { fontSize: Number(e.target.value) });
                    }
                  }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}
      <Box sx={{ mt: 2, p: 2, display: 'flex', justifyContent: 'center' }}>
  <Button
    variant="contained"
    color="error"
    startIcon={<DeleteIcon />}
    onClick={() => {
      if (window.canvasAPI && window.canvasAPI.deleteSelectedShape) {
        const success = window.canvasAPI.deleteSelectedShape();
        if (success) {
          // Cierra el panel de propiedades o muestra un mensaje
        }
      }
    }}
    fullWidth
  >
    Eliminar Figura
  </Button>
</Box>
    </Drawer>
  );
};

export default RightSidebar;