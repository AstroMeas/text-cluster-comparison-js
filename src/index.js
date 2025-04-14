import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './app.css';

// Here we start the React application by rendering our main component (App)
// into the root element.

// Get the DOM element with the ID "root" from index.html
const container = document.getElementById('root');

// Create a React root (React 18+)
const root = createRoot(container);

// Render our App component into the React root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);