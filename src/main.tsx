import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

if ('serviceWorker' in navigator) {
  try {
    // Register protocol handler
    navigator.registerProtocolHandler('web+hockeypickup', `${window.location.origin}/%s`);
  } catch (e) {
    console.error('Protocol handler registration failed:', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
