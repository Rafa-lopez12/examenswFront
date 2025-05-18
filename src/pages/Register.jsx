import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Paper, 
  Avatar, 
  CircularProgress, 
  Divider,
  InputAdornment,
  IconButton,
  Grid,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  Visibility, 
  VisibilityOff, 
  Email as EmailIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Estados para el control de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);

  const {register}=useAuth()
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Validación de datos
  const validateStep = () => {
    if (step === 0) {
      if (!formData.nombre) {
        setError('Por favor ingrese su nombre');
        return false;
      }
      if (!formData.email) {
        setError('Por favor ingrese su correo electrónico');
        return false;
      }
      // Validación básica de correo electrónico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Por favor ingrese un correo electrónico válido');
        return false;
      }
    } else if (step === 1) {
      if (!formData.password) {
        setError('Por favor ingrese una contraseña');
        return false;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
      if (!formData.confirmPassword) {
        setError('Por favor confirme su contraseña');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
    }
    return true;
  };
  
  // Avanzar al siguiente paso
  const handleNext = () => {
    if (validateStep()) {
      setError('');
      setStep(step + 1);
    }
  };
  
  // Retroceder al paso anterior
  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };
  
  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Crear objeto de datos para enviar
      const userData = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password
      };
      
      // Llamar a la API para registro
      const response = register(userData)
      // Si el registro fue exitoso
      setSuccess(true);
      
      // Redirigir al login después de un breve retraso
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setError(error.response?.data?.message || 'Error al crear la cuenta. Inténtelo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Información personal', 'Credenciales', 'Confirmación'];

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(120deg, #e0f7fa 0%, #80deea 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={8} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <PersonAddIcon fontSize="large" />
          </Avatar>
          
          <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
            Crear cuenta
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Completa tus datos para registrarte
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              Cuenta creada exitosamente. Redirigiendo al inicio de sesión...
            </Alert>
          )}
          
          <Stepper activeStep={step} alternativeLabel sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {step === 0 && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="nombre"
                  label="Nombre completo"
                  name="nombre"
                  autoComplete="name"
                  autoFocus
                  value={formData.nombre}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Correo electrónico"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </>
            )}
            
            {step === 1 && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    )
                  }}
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="caption" color="text.secondary">
                  La contraseña debe tener al menos 6 caracteres e incluir al menos una letra mayúscula, una minúscula y un número.
                </Typography>
              </>
            )}
            
            {step === 2 && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Por favor revisa tus datos antes de confirmar
                </Alert>
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nombre:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {formData.nombre}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Correo:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {formData.email}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              {step > 0 ? (
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{ mr: 1 }}
                >
                  Atrás
                </Button>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                >
                  Volver al login
                </Button>
              )}
              
              {step < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ borderRadius: 2 }}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || success}
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Completar registro'
                  )}
                </Button>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ width: '100%', mt: 4, mb: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
              Inicia sesión
            </Link>
          </Typography>
        </Paper>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 4 }}
        >
          © {new Date().getFullYear()} Canvas Colaborativo. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
};

export default Register;