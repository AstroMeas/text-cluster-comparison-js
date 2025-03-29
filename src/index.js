import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './app.css';

// Hier starten wir die React-Anwendung, indem wir unsere Hauptkomponente (App)
// in das root-Element rendern.

// Holen wir uns das DOM-Element mit der ID "root" aus der index.html
const container = document.getElementById('root');

// Erstellen wir eine React-Wurzel (React 18+)
const root = createRoot(container);

// Rendern wir unsere App-Komponente in die React-Wurzel
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);