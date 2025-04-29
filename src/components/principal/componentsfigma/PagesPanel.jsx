import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Grid,
  Badge,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as DuplicateIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useVista } from '../../../context/VistaContext';

const PagesPanel = ({ 
  open, 
  onClose, 
  pages, 
  activePage, 
  onPageChange, 
  onAddPage,
  projectId
}) => {
  const { actualizarVista } = useVista();
  const [editingPageId, setEditingPageId] = useState(null);
  const [editingPageName, setEditingPageName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Establecer la página activa cuando se abre el panel o cambian las páginas
  useEffect(() => {
    if (activePage) {
      setSelectedPageId(activePage.id);
    } else if (pages && pages.length > 0) {
      setSelectedPageId(pages[0].id);
    }
  }, [activePage, pages]);

  const handleMenuOpen = (event, pageId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPageId(pageId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStartEditPage = (pageId, pageName) => {
    setEditingPageId(pageId);
    setEditingPageName(pageName);
    handleMenuClose();
  };

  const handleSavePageName = async () => {
    if (!editingPageId || !editingPageName.trim()) {
      setEditingPageId(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Actualizar la vista en el backend
      actualizarVista(editingPageId, { nombre: editingPageName });
      
      setEditingPageId(null);
    } catch (err) {
      console.error('Error al actualizar nombre de página:', err);
      setError('No se pudo actualizar el nombre de la página');
    } finally {
      setLoading(false);
    }
  };

  // const handleDeletePage = async () => {
  //   if (!selectedPageId) return;
    
  //   try {
  //     setLoading(true);
  //     setError(null);
      
  //     // Eliminar la vista del backend
  //     await eliminarVista(selectedPageId);
      
  //     // Si la página eliminada era la activa, redirigir a otra página
  //     if (activePage && activePage.id === selectedPageId) {
  //       const nextPage = pages.find(p => p.id !== selectedPageId);
  //       if (nextPage) {
  //         onPageChange(nextPage.id);
  //       }
  //     }
      
  //     setDeleteConfirmOpen(false);
  //     handleMenuClose();
  //   } catch (err) {
  //     console.error('Error al eliminar página:', err);
  //     setError('No se pudo eliminar la página');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleConfirmDeletePage = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDuplicatePage = (pageId) => {
    // Aquí iría la lógica para duplicar la página
    const pageToDuplicate = pages.find(p => p.id === pageId);
    
    if (pageToDuplicate && projectId) {
      const newPageData = {
        nombre: `${pageToDuplicate.nombre} (copia)`,
        proyectoId: projectId
      };
      
      onAddPage(newPageData);
    }
    
    handleMenuClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSavePageName();
    } else if (e.key === 'Escape') {
      setEditingPageId(null);
    }
  };

  const handleCreateNewPage = () => {
    onAddPage();
  };

  const handlePageSelect = (pageId) => {
    setSelectedPageId(pageId);
    onPageChange(pageId);
    // No cerramos el panel para permitir que el usuario cambie entre páginas
  };

  // Verificar si hay páginas disponibles
  const hasPages = Array.isArray(pages) && pages.length > 0;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
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
            <Typography variant="h6">Páginas del proyecto</Typography>
            <IconButton edge="end" onClick={onClose} aria-label="close">
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
          
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNewPage}
              fullWidth
              disabled={loading}
            >
              Nueva página
            </Button>
          </Box>

          {!hasPages ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
              }}
            >
              <Typography variant="body2" color="text.secondary" align="center">
                No hay páginas en este proyecto.
                <br />
                Crea una nueva página para comenzar a diseñar.
              </Typography>
            </Box>
          ) : (
            <List>
              {pages.map((page) => (
                <ListItem
                  key={page.id}
                  button
                  selected={page.id === selectedPageId}
                  onClick={() => handlePageSelect(page.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    border: page.id === selectedPageId ? 1 : 0,
                    borderColor: 'primary.main',
                    bgcolor: page.id === selectedPageId ? 'action.selected' : 'transparent',
                    '&:hover': {
                      bgcolor: page.id === selectedPageId ? 'action.selected' : 'action.hover',
                    }
                  }}
                  disabled={loading}
                >
                  {editingPageId === page.id ? (
                    <TextField
                      fullWidth
                      value={editingPageName}
                      onChange={(e) => setEditingPageName(e.target.value)}
                      autoFocus
                      size="small"
                      onKeyDown={handleKeyDown}
                      onBlur={handleSavePageName}
                      InputProps={{
                        endAdornment: (
                          <IconButton size="small" onClick={handleSavePageName} disabled={loading}>
                            {loading ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" />}
                          </IconButton>
                        )
                      }}
                      onClick={(e) => e.stopPropagation()}
                      disabled={loading}
                    />
                  ) : (
                    <>
                      <Badge
                        color="primary"
                        variant="dot"
                        invisible={page.id !== selectedPageId}
                        sx={{ mr: 1 }}
                      >
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: page.id === selectedPageId ? 'primary.main' : 'action.selected',
                            color: page.id === selectedPageId ? 'white' : 'text.primary',
                            borderRadius: 1,
                            mr: 2
                          }}
                        >
                          
                        </Box>
                      </Badge>
                      <ListItemText 
                        primary={page.nombre || page.name} 
                        primaryTypographyProps={{
                          fontWeight: page.id === selectedPageId ? 'bold' : 'normal'
                        }} 
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="options"
                          onClick={(e) => handleMenuOpen(e, page.id)}
                          disabled={loading}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          )}

          {/* Sección de miniaturas de páginas */}
          {hasPages && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Vista previa de páginas
              </Typography>
              <Grid container spacing={1}>
                {pages.map((page) => (
                  <Grid item xs={4} key={page.id}>
                    <Paper
                      elevation={page.id === selectedPageId ? 3 : 1}
                      sx={{
                        aspectRatio: '16/9',
                        p: 1,
                        cursor: 'pointer',
                        border: page.id === selectedPageId ? 2 : 0,
                        borderColor: 'primary.main',
                        position: 'relative',
                        '&:hover': {
                          boxShadow: 2
                        }
                      }}
                      onClick={() => handlePageSelect(page.id)}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          bgcolor: 'background.default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {page.nombre || page.name}
                        </Typography>
                      </Box>
                      {page.id === selectedPageId && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            bgcolor: 'primary.main',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <CheckIcon sx={{ color: 'white', fontSize: 14 }} />
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

<Menu
        id="page-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const page = pages.find((p) => p.id === selectedPageId);
            if (page) {
              handleStartEditPage(page.id, page.nombre || page.name);
            }
          }}
          disabled={loading}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Renombrar
        </MenuItem>
        <MenuItem onClick={() => handleDuplicatePage(selectedPageId)} disabled={loading}>
          <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>
        <Divider />
        {/* <MenuItem onClick={handleConfirmDeletePage} disabled={loading || pages.length <= 1}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
          <Typography color="error">Eliminar</Typography>
        </MenuItem> */}
      </Menu>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="primary" variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menú de opciones para cada página */}


      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Eliminar página
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar esta página? Esta acción no se puede deshacer.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Se eliminarán todas las figuras contenidas en esta página.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} disabled={loading}>
            Cancelar
          </Button>
          <Button 
             
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PagesPanel;