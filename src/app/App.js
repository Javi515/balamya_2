import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '../styles/App.css';
import AppRoutes from './routes';
import { AuthProvider } from '../context/AuthContext';
import { AlertsProvider } from '../context/AlertsContext';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';

function App() {
  const basename = import.meta.env.BASE_URL;

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AlertsProvider>
          <BrowserRouter basename={basename}>
            <AppRoutes />
          </BrowserRouter>
        </AlertsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
