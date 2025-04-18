import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { CanvasProvider } from './context/PrincipalContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProyectoProvider } from './context/ProyectoContext.jsx'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { VistaProvider } from './context/VistaContext.jsx'
import { FiguraProvider } from './context/FiguraContext.jsx'



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ProyectoProvider>
        <VistaProvider>
          <FiguraProvider>
            <App />
          </FiguraProvider>
        </VistaProvider>
      </ProyectoProvider>
    </AuthProvider>
  
  </React.StrictMode>,
)
