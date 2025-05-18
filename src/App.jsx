import Canvas from './components/principal/canvas'
import Login from './pages/Login'
import Home from './pages/Home'
import PrivateRoute from './Routes/PrivateRoute'
import { BrowserRouter as Router ,Route, Routes, Navigate } from 'react-router-dom'
import Register from './pages/Register'

function App() {
  return (
    <Router>
    <Routes>
      {/* Ruta pública para login */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Rutas protegidas que requieren autenticación */}
      <Route path="/" element={<PrivateRoute />}>
        <Route index element={<Home />} />
        <Route path="canvas" element={<Canvas />} />
      </Route>
      
      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
  )
}

export default App
