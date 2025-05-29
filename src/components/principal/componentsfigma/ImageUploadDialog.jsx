import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';

const ImageUploadDialog = ({ open, onClose, onImageUpload, onToolChange }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Limpiar estados cuando el diálogo se abre
  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setPreview('');
      setError(null);
    }
  }, [open]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor seleccione un archivo de imagen válido.');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Crear previsualizacion
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor seleccione una imagen.');
      return;
    }

    try {
      setLoading(true);

      // Usar FileReader para convertir la imagen a dataURL
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        console.log("Imagen cargada, tamaño:", Math.round(dataUrl.length / 1024), "KB");
        
        // Enviar la imagen como dataURL
        onImageUpload(dataUrl);
        
        // Cerrar el diálogo
        handleClose();
      };
      reader.onerror = (error) => {
        console.error('Error al procesar la imagen:', error);
        setError('Error al procesar la imagen.');
        setLoading(false);
      };
      reader.readAsDataURL(selectedFile);

    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      setError('Ocurrió un error al procesar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview('');
    setError(null);
    onClose();
    
    // Cambiar a la herramienta de selección
    if (onToolChange) {
      onToolChange('select');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Añadir imagen</Typography>
          <IconButton edge="end" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* ESTA ES LA PARTE QUE DEBES REEMPLAZAR ↓↓↓ */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Typography variant="body1" gutterBottom align="center" color="text.secondary">
            Sube una imagen de un boceto o diseño de interfaz y la IA la interpretará, 
            creando las figuras correspondientes en el canvas.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
            Para mejores resultados, asegúrate de que la imagen sea clara y los elementos estén bien definidos.
            La IA reconocerá rectángulos, círculos, textos y líneas.
          </Alert>

          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="upload-image-button"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="upload-image-button">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Seleccionar imagen
            </Button>
          </label>
        {/* ESTA ES LA PARTE QUE DEBES REEMPLAZAR ↑↑↑ */}

          {preview ? (
            <Box
              sx={{
                mt: 2,
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                width: '100%',
                maxHeight: '300px',
                overflow: 'hidden',
                textAlign: 'center'
              }}
            >
              <img
                src={preview}
                alt="Vista previa"
                style={{
                  maxWidth: '100%',
                  maxHeight: '280px',
                  objectFit: 'contain'
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                mt: 2,
                p: 4,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default'
              }}
            >
              <ImageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                No se ha seleccionado ninguna imagen
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Procesando...' : 'Añadir imagen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploadDialog;