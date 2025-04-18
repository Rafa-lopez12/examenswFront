import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  TextField,
  Menu,
  MenuItem,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  ViewSidebar as RightSidebarIcon,
  ViewSidebar as LeftSidebarIcon,
  People as PeopleIcon,
  ViewQuilt as PagesIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CanvasTopBar = ({ 
  projectName, 
  onToggleLeftSidebar, 
  onToggleRightSidebar,
  onToggleCollaborators,
  onTogglePages
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [projectNameEditing, setProjectNameEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(projectName);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleNameEdit = () => {
    setProjectNameEditing(true);
  };

  const handleNameSave = () => {
    setProjectNameEditing(false);
    // Aquí iría la lógica para guardar el nombre en el backend
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setProjectNameEditing(false);
      setEditedName(projectName);
    }
  };

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={1}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper'
      }}
    >
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>

        {projectNameEditing ? (
          <TextField
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleKeyDown}
            autoFocus
            size="small"
            sx={{ width: 200 }}
          />
        ) : (
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 0, 
              mr: 2, 
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main'
              }
            }}
            onClick={handleNameEdit}
          >
            {projectName}
          </Typography>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Botones principales */}
        <Tooltip title="Guardar">
          <IconButton color="inherit">
            <SaveIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Ver páginas">
          <IconButton color="inherit" onClick={onTogglePages}>
            <PagesIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Panel izquierdo">
          <IconButton color="inherit" onClick={onToggleLeftSidebar}>
            <LeftSidebarIcon sx={{ transform: 'scaleX(-1)' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Panel derecho">
          <IconButton color="inherit" onClick={onToggleRightSidebar}>
            <RightSidebarIcon />
          </IconButton>
        </Tooltip>

        <Button
          color="primary"
          startIcon={<PeopleIcon />}
          onClick={onToggleCollaborators}
          sx={{ mx: 1 }}
        >
          Invitar
        </Button>

        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          size="small"
          color="primary"
        >
          Compartir
        </Button>

        <IconButton
          color="inherit"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenuOpen}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>Exportar</MenuItem>
          <MenuItem onClick={handleMenuClose}>Preferencias</MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>Ayuda</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default CanvasTopBar;