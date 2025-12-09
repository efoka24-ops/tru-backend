import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'

// Initialize app
async function initApp() {
  try {
    // Initialiser les endpoints API du Frontend
    const { setupFrontendAPI } = await import('./api/frontendAPI');
    setupFrontendAPI();
  } catch (error) {
    console.warn('Frontend API setup warning:', error.message);
  }

  const root = document.getElementById('root');
  if (!root) {
    document.body.innerHTML = '<div style="padding: 20px; font-family: system-ui; color: red;">Erreur: Élément root non trouvé</div>';
  } else {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <ErrorBoundary>
          <Router>
            <App />
          </Router>
        </ErrorBoundary>
      </React.StrictMode>,
    );
  }
}

initApp();
