import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  IconButton,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';

const CapturesPreview = ({ 
  open, 
  onClose, 
  captures, 
  onRemoveCapture, 
  onClearAll, 
  onSendCaptures,
  onCaptureCurrentPage 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Capturas del Proyecto 
            <Badge 
              badgeContent={captures.length} 
              color="primary" 
              sx={{ ml: 2 }}
              showZero
            />
          </Typography>
          <IconButton edge="end" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {captures.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              py: 4 
            }}
          >
            <Typography variant="body1" color="text.secondary" align="center">
              No hay capturas guardadas.
            </Typography>
            <Button
              variant="contained"
              startIcon={<CameraIcon />}
              onClick={onCaptureCurrentPage}
              sx={{ mt: 2 }}
            >
              Capturar página actual
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Capturas listas para generar código Flutter:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cada captura será procesada por IA para generar pantallas, widgets, modelos y servicios Flutter.
            </Typography>
            </Box>

            <Grid container spacing={2}>
              {captures.map((capture) => (
                <Grid item xs={12} sm={6} md={4} key={capture.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 1,
                      position: 'relative',
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={capture.dataURL}
                        alt={`Captura de ${capture.pageInfo.name}`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          borderRadius: 4
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          display: 'flex',
                          p: 0.5
                        }}
                      >
                        <Tooltip title="Eliminar captura">
                          <IconButton
                            size="small"
                            onClick={() => onRemoveCapture(capture.id)}
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 0, 0, 0.1)'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Descargar imagen">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.download = `${capture.pageInfo.name.replace(/\s+/g, '-')}.png`;
                              link.href = capture.dataURL;
                              link.click();
                            }}
                            sx={{
                              ml: 0.5,
                              bgcolor: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': {
                                bgcolor: 'rgba(0, 0, 255, 0.1)'
                              }
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" noWrap>
                        {capture.pageInfo.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        ID: {capture.pageInfo.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Fecha: {new Date(capture.pageInfo.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          onClick={onClearAll}
          color="error"
          startIcon={<DeleteIcon />}
          disabled={captures.length === 0}
        >
          Limpiar todo
        </Button>
        
        <Box>
          <Button onClick={onClose} color="inherit" sx={{ mr: 1 }}>
            Cerrar
          </Button>
          <Button
            onClick={onSendCaptures}
            variant="contained"
            startIcon={<CodeIcon />}
            color="primary"
            disabled={captures.length === 0}
          >
            Generar código Flutter ({captures.length})
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CapturesPreview;