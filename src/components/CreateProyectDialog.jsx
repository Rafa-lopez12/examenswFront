import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { useProyecto } from '../context/ProyectoContext';

const CreateProjectDialog = ({ open, onClose, onProjectCreated, userId }) => {
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {createProyecto}=useProyecto()

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      setError('El nombre del proyecto es requerido');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // const newProject = await createProject({
      //   nombre: projectName,
      //   usuarioId: userId
      // });
      const data={
        nombre: projectName,
        usuarioId: userId,
      }
      const newProject= createProyecto(data)
      
      onProjectCreated(newProject);
      handleClose();
    } catch (err) {
      console.error('Error creating project:', err);
      setError('No se pudo crear el proyecto. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProjectName('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nombre del Proyecto"
            type="text"
            fullWidth
            variant="outlined"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={loading}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Creando...' : 'Crear Proyecto'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateProjectDialog;