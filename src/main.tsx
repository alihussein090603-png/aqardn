import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppStateProvider } from './context/AppStateContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppStateProvider>
            <App />
          </AppStateProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
