// src/components/principal/componentsfigma/PromptUIDialog.jsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AIIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  Palette as PaletteIcon,
  Style as StyleIcon,
  Tune as TuneIcon
} from '@mui/icons-material';

const PromptUIDialog = ({ open, onClose, onPromptSubmit, onToolChange }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para las opciones de personalización
  const [style, setStyle] = useState('modern');
  const [colorScheme, setColorScheme] = useState('default');
  const [complexity, setComplexity] = useState('medium');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Opciones disponibles
  const styleOptions = [
    { value: 'modern', label: 'Moderno', description: 'Diseño limpio y contemporáneo' },
    { value: 'minimal', label: 'Minimalista', description: 'Menos elementos, más espacio' },
    { value: 'classic', label: 'Clásico', description: 'Diseño tradicional y formal' },
    { value: 'playful', label: 'Divertido', description: 'Colores vibrantes y formas creativas' }
  ];

  const colorSchemeOptions = [
    { value: 'default', label: 'Por defecto', color: '#1976d2' },
    { value: 'dark', label: 'Oscuro', color: '#90caf9' },
    { value: 'blue', label: 'Azul', color: '#1976d2' },
    { value: 'green', label: 'Verde', color: '#2e7d32' }
  ];

  const complexityOptions = [
    { value: 'simple', label: 'Simple', description: 'Pocos elementos, diseño básico' },
    { value: 'medium', label: 'Medio', description: 'Equilibrio entre simplicidad y funcionalidad' },
    { value: 'complex', label: 'Complejo', description: 'Muchos elementos y características avanzadas' }
  ];

  // Ejemplos de prompts categorizados
  const examplePrompts = {
    'Formularios': [
      "Una pantalla de login con título, campos de email y contraseña, y botón de iniciar sesión",
      "Formulario de registro con campos para nombre, email, contraseña, confirmar contraseña y botón de crear cuenta",
      "Formulario de contacto con campos de nombre, email, teléfono, mensaje y botón enviar",
      "Formulario de pago con campos de tarjeta, fecha de vencimiento, CVV y botón de pagar"
    ],
    'Dashboards': [
      "Dashboard con título principal, 3 tarjetas de estadísticas y una lista de elementos recientes",
      "Panel de administración con sidebar, métricas en la parte superior y tabla de datos",
      "Dashboard de analytics con gráficos de barras, métricas de KPI y botones de filtro",
      "Panel de control con notificaciones, progreso de tareas y accesos rápidos"
    ],
    'Perfiles y Configuración': [
      "Página de perfil con foto circular, nombre de usuario, bio y botones de editar y configuración",
      "Pantalla de configuración con secciones para cuenta, privacidad, notificaciones y tema",
      "Perfil de usuario con información personal, estadísticas y lista de actividades recientes",
      "Página de ajustes con interruptores, selectores y campos de configuración"
    ],
    'Landing Pages': [
      "Landing page con título hero, descripción, botón CTA y 3 características principales",
      "Página de producto con imagen principal, descripción, precio y botón de comprar",
      "Landing de app móvil con mockup del teléfono, características y botones de descarga",
      "Página de servicios con título, lista de servicios y formulario de contacto"
    ]
  };

  // Limpiar estados cuando el diálogo se abre
  useEffect(() => {
    if (open) {
      setPrompt('');
      setError(null);
      setStyle('modern');
      setColorScheme('default');
      setComplexity('medium');
      setShowAdvanced(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Por favor describe la interfaz que deseas crear.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Preparar las opciones para enviar al backend
      const options = {
        style,
        colorScheme,
        complexity
      };

      // Llamar a la función del componente padre para procesar el prompt
      await onPromptSubmit(prompt, options);
      
      // Cerrar el diálogo
      handleClose();

    } catch (error) {
      console.error('Error al procesar el prompt:', error);
      setError('Ocurrió un error al generar la interfaz. Intenta con una descripción diferente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setError(null);
    onClose();
    
    // Cambiar a la herramienta de selección
    if (onToolChange) {
      onToolChange('select');
    }
  };

  const handleExampleClick = (examplePrompt) => {
    setPrompt(examplePrompt);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <AIIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Crear interfaz con IA</Typography>
          </Box>
          <IconButton edge="end" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Columna izquierda - Prompt principal */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Describe la interfaz que quieres crear y la IA generará automáticamente 
                los elementos correspondientes en el canvas.
              </Typography>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Box display="flex" alignItems="flex-start">
                  <LightbulbIcon sx={{ mr: 1, mt: 0.5, fontSize: '1.2rem' }} />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      Consejos para mejores resultados:
                    </Typography>
                    <Typography variant="body2">
                      • Sé específico sobre los elementos que quieres (botones, textos, formularios, etc.)
                      <br />
                      • Menciona la disposición deseada (arriba, abajo, centrado, etc.)
                      <br />
                      • Incluye detalles sobre colores o estilos si los tienes en mente
                    </Typography>
                  </Box>
                </Box>
              </Alert>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Describe tu interfaz"
              placeholder="Ejemplo: Una pantalla de registro con título, campos para nombre y email, selector de país, y un botón grande de crear cuenta"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
              helperText={`${prompt.length}/500 caracteres`}
              inputProps={{ maxLength: 500 }}
            />

            {/* Ejemplos organizados por categorías */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Ejemplos por categoría:
              </Typography>
              
              {Object.entries(examplePrompts).map(([category, prompts]) => (
                <Accordion key={category} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">{category}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {prompts.map((example, index) => (
                        <Chip
                          key={index}
                          label={example}
                          variant="outlined"
                          size="small"
                          onClick={() => handleExampleClick(example)}
                          sx={{ 
                            cursor: 'pointer',
                            mb: 1,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Grid>

          {/* Columna derecha - Opciones de personalización */}
          <Grid item xs={12} md={4}>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <TuneIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Personalización</Typography>
              </Box>

              {/* Estilo de diseño */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Estilo de diseño</InputLabel>
                <Select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  label="Estilo de diseño"
                  startAdornment={<StyleIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  {styleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Esquema de colores */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Esquema de colores</InputLabel>
                <Select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  label="Esquema de colores"
                  startAdornment={<PaletteIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  {colorSchemeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: option.color,
                            mr: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Nivel de complejidad */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Complejidad</InputLabel>
                <Select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value)}
                  label="Complejidad"
                >
                  {complexityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Resumen de configuración */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Configuración actual:
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={styleOptions.find(s => s.value === style)?.label} 
                  size="small" 
                  sx={{ mr: 0.5, mb: 0.5 }} 
                />
                <Chip 
                  label={colorSchemeOptions.find(c => c.value === colorScheme)?.label} 
                  size="small" 
                  sx={{ mr: 0.5, mb: 0.5 }} 
                />
                <Chip 
                  label={complexityOptions.find(c => c.value === complexity)?.label} 
                  size="small" 
                  sx={{ mr: 0.5, mb: 0.5 }} 
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!prompt.trim() || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
        >
          {loading ? 'Generando interfaz...' : 'Generar interfaz'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromptUIDialog;