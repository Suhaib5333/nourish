import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AppProvider } from './context/AppContext'
import { RoleProvider } from './context/RoleContext'
import { ToastProvider } from './hooks/useToast'
import App from './app/App'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <AppProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AppProvider>
      </RoleProvider>
    </BrowserRouter>
  </StrictMode>
)
