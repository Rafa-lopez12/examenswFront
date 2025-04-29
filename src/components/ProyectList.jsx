import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ViewQuilt as ViewQuiltIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EditProjectDialog from './EditProyectDialog';

const ProjectList = ({ proyecto, loading, error, onCreateProject }) => {
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleOpenProject = (projectId) => {
    navigate(`/canvas?projectId=${projectId}`);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleDeleteProject = (project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedProject(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" component="h1">
          Mis Proyectos
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={onCreateProject}
        >
          Nuevo Proyecto
        </Button>
      </Box>

      {/* {!proyecto || proyecto.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          mt: 8 
        }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No tienes proyectos creados todavía
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={onCreateProject}
          >
            Crear mi primer proyecto
          </Button>
        </Box>
      ) : ( */}
        <Grid container spacing={3}>
          {proyecto.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {project.nombre}
                  </Typography>
                  <Typography color="text.secondary">
                    Creado: {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<ViewQuiltIcon />}
                    onClick={() => handleOpenProject(project.id)}
                  >
                    Abrir
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleEditProject(project)}
                  >
                    Editar
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteProject(project)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      {/* )} */}
      
      {/* Botón flotante para dispositivos móviles */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={onCreateProject}
        >
          <AddIcon />
        </Fab>
      </Box>

      {/* Diálogos para editar y eliminar proyectos */}
      <EditProjectDialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog} 
        project={selectedProject} 
      />
      
     
    </>
  );
};

export default ProjectList;