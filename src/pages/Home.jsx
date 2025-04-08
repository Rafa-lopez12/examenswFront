import React, { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ProjectList from '../components/ProyectList';
import TopBar from '../components/TopBar';
import CreateProjectDialog from '../components/CreateProyectDialog';
import {fetchUserProjects} from '../services/ProyectService'
import { useProyecto } from '../context/ProyectoContext';

const Home = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const {proyecto, getProyectos} = useProyecto()


  useEffect(() => {
    const loadProyectos = async () => {
      try {
        setLoading(true);
        await getProyectos(currentUser.id);
        setError(null);
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
        setError("No se pudieron cargar los proyectos");
      } finally {
        setLoading(false);
      }
    };
  
    if (currentUser) {
      loadProyectos();
    }
  }, [getProyectos]);
  console.log(currentUser)
  console.log(proyecto)

  const handleToggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleProjectCreated = (newProject) => {
    setProjects((prevProjects) => [...prevProjects, newProject]);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* TopBar */}
      <TopBar 
        open={openDrawer} 
        handleDrawerToggle={handleToggleDrawer} 
      />
      
      {/* Sidebar */}
      <Sidebar 
        open={openDrawer} 
        onCreateProject={handleOpenCreateDialog} 
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${openDrawer ? 240 : 0}px)` },
          ml: { sm: `${openDrawer ? 240 : 0}px` },
          mt: '64px',
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <ProjectList 
          proyecto={proyecto} 
          loading={loading} 
          error={error} 
          onCreateProject={handleOpenCreateDialog}
        />
      </Box>
      
      {/* Create Project Dialog */}
      <CreateProjectDialog 
        open={openCreateDialog} 
        onClose={handleCloseCreateDialog} 
        onProjectCreated={handleProjectCreated}
        userId={currentUser?.id}
      />
    </Box>
  );
};

export default Home;