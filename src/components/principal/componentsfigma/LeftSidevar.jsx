import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  IconButton,
  Typography
} from '@mui/material';
import {
  PanTool as SelectIcon,
  Edit as PenIcon,
  Square as RectangleIcon,
  RadioButtonUnchecked as CircleIcon,
  LinearScale as LineIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  TextFormat as TextFormatIcon,
  Create as DrawIcon,
  ArrowForward as ArrowIcon,
  FormatColorFill as FillIcon,
  Palette as ColorIcon,
  AutoAwesome as AIPromptIcon
} from '@mui/icons-material';

const TOOLS = [
  { id: 'select', name: 'Seleccionar', icon: <SelectIcon />, tooltip: 'Herramienta de selección' },
  { id: 'ai-prompt', name: 'IA Prompt', icon: <AIPromptIcon />, tooltip: 'Crear interfaz con IA mediante texto' },
  { id: 'pen', name: 'Lápiz', icon: <PenIcon />, tooltip: 'Dibujo a mano alzada' },
  { id: 'rectangle', name: 'Rectángulo', icon: <RectangleIcon />, tooltip: 'Crear rectángulos' },
  { id: 'circle', name: 'Círculo', icon: <CircleIcon />, tooltip: 'Crear círculos' },
  { id: 'line', name: 'Línea', icon: <LineIcon />, tooltip: 'Dibujar líneas' },
  { id: 'arrow', name: 'Flecha', icon: <ArrowIcon />, tooltip: 'Dibujar flechas' },
  { id: 'text', name: 'Texto', icon: <TextIcon />, tooltip: 'Añadir texto' },
  { id: 'image', name: 'Imagen', icon: <ImageIcon />, tooltip: 'Insertar imagen' }
];

const STYLE_TOOLS = [
  { id: 'fill', name: 'Relleno', icon: <FillIcon />, tooltip: 'Cambiar relleno' },
  { id: 'color', name: 'Color', icon: <ColorIcon />, tooltip: 'Cambiar color' },
  { id: 'text-format', name: 'Formato', icon: <TextFormatIcon />, tooltip: 'Formato de texto' }
];

const drawerWidth = 60;

const LeftSidebar = ({ open, selectedTool, onToolChange }) => {
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '48px', // Altura del AppBar
          height: 'calc(100% - 48px)',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: (theme) => theme.palette.background.paper
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        {/* Herramientas principales */}
        <List sx={{ width: '100%', p: 0 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              px: 1, 
              py: 0.5, 
              display: 'block', 
              color: 'text.secondary', 
              fontSize: '0.65rem',
              textAlign: 'center'
            }}
          >
            Herramientas
          </Typography>
          
          {TOOLS.map((tool) => (
            <Tooltip key={tool.id} title={tool.tooltip} placement="right">
              <ListItem 
                button 
                selected={selectedTool === tool.id}
                onClick={() => onToolChange(tool.id)}
                sx={{ 
                  py: 0.5, 
                  minHeight: 48, 
                  justifyContent: 'center',
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  {tool.icon}
                </ListItemIcon>
              </ListItem>
            </Tooltip>
          ))}
        </List>

        <Divider sx={{ width: '80%', my: 1 }} />

        {/* Herramientas de estilo */}
        <List sx={{ width: '100%', p: 0 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              px: 1, 
              py: 0.5, 
              display: 'block', 
              color: 'text.secondary', 
              fontSize: '0.65rem',
              textAlign: 'center'
            }}
          >
            Estilos
          </Typography>
          
          {STYLE_TOOLS.map((tool) => (
            <Tooltip key={tool.id} title={tool.tooltip} placement="right">
              <ListItem 
                button 
                onClick={() => onToolChange(tool.id)}
                sx={{ 
                  py: 0.5, 
                  minHeight: 48, 
                  justifyContent: 'center' 
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  {tool.icon}
                </ListItemIcon>
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default LeftSidebar;